import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AnalyticsData, TimeSeriesData } from '@/types/charts';

export interface RealTimeMetrics {
  activeRespondents: number;
  responseCount: number;
  lastResponseTime: Date | null;
  recentResponses: any[];
  completionRate: number;
}

export interface AnalyticsUpdate {
  type: 'response_created' | 'response_updated' | 'response_deleted';
  data: any;
  timestamp: Date;
  surveyId: string;
}

type AnalyticsCallback = (update: AnalyticsUpdate) => void;
type MetricsCallback = (metrics: RealTimeMetrics) => void;

export class RealTimeAnalytics {
  private supabase = createClient();
  private subscriptions = new Map<string, RealtimeChannel>();
  private callbacks = new Map<string, AnalyticsCallback[]>();
  private metricsCallbacks = new Map<string, MetricsCallback[]>();
  private currentMetrics = new Map<string, RealTimeMetrics>();
  
  // Cache for recent activity
  private recentActivity = new Map<string, any[]>();
  private activityWindowMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeActivityCleanup();
  }

  /**
   * Subscribe to real-time analytics for a specific survey
   */
  subscribeToSurvey(
    surveyId: string, 
    analyticsCallback: AnalyticsCallback,
    metricsCallback?: MetricsCallback
  ): string {
    const subscriptionId = `analytics_${surveyId}_${Date.now()}`;
    
    // Store callbacks
    if (!this.callbacks.has(surveyId)) {
      this.callbacks.set(surveyId, []);
    }
    this.callbacks.get(surveyId)?.push(analyticsCallback);

    if (metricsCallback) {
      if (!this.metricsCallbacks.has(surveyId)) {
        this.metricsCallbacks.set(surveyId, []);
      }
      this.metricsCallbacks.get(surveyId)?.push(metricsCallback);
    }

    // Create Supabase real-time subscription
    const channel = this.supabase
      .channel(`analytics:${surveyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `survey_id=eq.${surveyId}`
        },
        (payload) => this.handleResponseInsert(payload, surveyId)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'responses',
          filter: `survey_id=eq.${surveyId}`
        },
        (payload) => this.handleResponseUpdate(payload, surveyId)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers'
        },
        (payload) => this.handleAnswerInsert(payload, surveyId)
      )
      .subscribe();

    this.subscriptions.set(subscriptionId, channel);
    
    // Initialize metrics for this survey
    this.initializeSurveyMetrics(surveyId);

    return subscriptionId;
  }

  /**
   * Unsubscribe from real-time analytics
   */
  unsubscribeFromSurvey(subscriptionId: string): void {
    const channel = this.subscriptions.get(subscriptionId);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Get current real-time metrics for a survey
   */
  getCurrentMetrics(surveyId: string): RealTimeMetrics | null {
    return this.currentMetrics.get(surveyId) || null;
  }

  /**
   * Calculate incremental metrics update
   */
  private async calculateIncrementalMetrics(
    surveyId: string, 
    updateType: AnalyticsUpdate['type']
  ): Promise<RealTimeMetrics> {
    const current = this.currentMetrics.get(surveyId) || {
      activeRespondents: 0,
      responseCount: 0,
      lastResponseTime: null,
      recentResponses: [],
      completionRate: 0
    };

    // Fetch latest data from database
    const { data: responses } = await this.supabase
      .from('responses')
      .select(`
        id,
        status,
        created_at,
        completed_at,
        answers(count)
      `)
      .eq('survey_id', surveyId)
      .gte('created_at', new Date(Date.now() - this.activityWindowMs).toISOString());

    if (!responses) return current;

    // Calculate new metrics
    const responseCount = responses.length;
    const completedResponses = responses.filter(r => r.status === 'completed').length;
    const activeRespondents = responses.filter(r => 
      r.status === 'in_progress' && 
      new Date(r.created_at).getTime() > Date.now() - (10 * 60 * 1000) // Active in last 10 minutes
    ).length;

    const updatedMetrics: RealTimeMetrics = {
      activeRespondents,
      responseCount,
      lastResponseTime: responses.length > 0 ? 
        new Date(Math.max(...responses.map(r => new Date(r.created_at).getTime()))) : 
        current.lastResponseTime,
      recentResponses: responses.slice(-10), // Last 10 responses
      completionRate: responseCount > 0 ? (completedResponses / responseCount) * 100 : 0
    };

    this.currentMetrics.set(surveyId, updatedMetrics);
    return updatedMetrics;
  }

  /**
   * Handle new response insertion
   */
  private async handleResponseInsert(payload: any, surveyId: string): Promise<void> {
    const analyticsUpdate: AnalyticsUpdate = {
      type: 'response_created',
      data: payload.new,
      timestamp: new Date(),
      surveyId
    };

    // Update metrics
    const newMetrics = await this.calculateIncrementalMetrics(surveyId, 'response_created');
    
    // Notify callbacks
    this.notifyAnalyticsCallbacks(surveyId, analyticsUpdate);
    this.notifyMetricsCallbacks(surveyId, newMetrics);
    
    // Store recent activity
    this.addToRecentActivity(surveyId, analyticsUpdate);
  }

  /**
   * Handle response update
   */
  private async handleResponseUpdate(payload: any, surveyId: string): Promise<void> {
    const analyticsUpdate: AnalyticsUpdate = {
      type: 'response_updated',
      data: { old: payload.old, new: payload.new },
      timestamp: new Date(),
      surveyId
    };

    // Update metrics
    const newMetrics = await this.calculateIncrementalMetrics(surveyId, 'response_updated');
    
    // Notify callbacks
    this.notifyAnalyticsCallbacks(surveyId, analyticsUpdate);
    this.notifyMetricsCallbacks(surveyId, newMetrics);
    
    // Store recent activity
    this.addToRecentActivity(surveyId, analyticsUpdate);
  }

  /**
   * Handle new answer insertion
   */
  private async handleAnswerInsert(payload: any, surveyId: string): Promise<void> {
    // Get response to check if it belongs to our survey
    const { data: response } = await this.supabase
      .from('responses')
      .select('survey_id')
      .eq('id', payload.new.response_id)
      .single();

    if (response?.survey_id !== surveyId) return;

    const analyticsUpdate: AnalyticsUpdate = {
      type: 'response_updated', // Answer insert counts as response update
      data: payload.new,
      timestamp: new Date(),
      surveyId
    };

    // Update metrics (answers affect completion rates)
    const newMetrics = await this.calculateIncrementalMetrics(surveyId, 'response_updated');
    
    // Notify callbacks
    this.notifyAnalyticsCallbacks(surveyId, analyticsUpdate);
    this.notifyMetricsCallbacks(surveyId, newMetrics);
  }

  /**
   * Initialize metrics for a survey
   */
  private async initializeSurveyMetrics(surveyId: string): Promise<void> {
    await this.calculateIncrementalMetrics(surveyId, 'response_created');
  }

  /**
   * Notify analytics callbacks
   */
  private notifyAnalyticsCallbacks(surveyId: string, update: AnalyticsUpdate): void {
    const callbacks = this.callbacks.get(surveyId) || [];
    callbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in analytics callback:', error);
      }
    });
  }

  /**
   * Notify metrics callbacks
   */
  private notifyMetricsCallbacks(surveyId: string, metrics: RealTimeMetrics): void {
    const callbacks = this.metricsCallbacks.get(surveyId) || [];
    callbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Error in metrics callback:', error);
      }
    });
  }

  /**
   * Add activity to recent activity cache
   */
  private addToRecentActivity(surveyId: string, update: AnalyticsUpdate): void {
    if (!this.recentActivity.has(surveyId)) {
      this.recentActivity.set(surveyId, []);
    }

    const activities = this.recentActivity.get(surveyId)!;
    activities.push(update);

    // Keep only recent activities (last 100 items or within time window)
    const cutoffTime = Date.now() - this.activityWindowMs;
    const recentActivities = activities
      .filter(activity => activity.timestamp.getTime() > cutoffTime)
      .slice(-100);

    this.recentActivity.set(surveyId, recentActivities);
  }

  /**
   * Get recent activity for a survey
   */
  getRecentActivity(surveyId: string): AnalyticsUpdate[] {
    return this.recentActivity.get(surveyId) || [];
  }

  /**
   * Initialize cleanup for old activity data
   */
  private initializeActivityCleanup(): void {
    setInterval(() => {
      const cutoffTime = Date.now() - this.activityWindowMs;
      
      for (const [surveyId, activities] of this.recentActivity.entries()) {
        const recentActivities = activities.filter(
          activity => activity.timestamp.getTime() > cutoffTime
        );
        
        if (recentActivities.length === 0) {
          this.recentActivity.delete(surveyId);
        } else {
          this.recentActivity.set(surveyId, recentActivities);
        }
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Dispose of all subscriptions and cleanup
   */
  dispose(): void {
    for (const [subscriptionId, channel] of this.subscriptions.entries()) {
      this.supabase.removeChannel(channel);
    }
    
    this.subscriptions.clear();
    this.callbacks.clear();
    this.metricsCallbacks.clear();
    this.currentMetrics.clear();
    this.recentActivity.clear();
  }
}

// Singleton instance for global use
export const realTimeAnalytics = new RealTimeAnalytics();