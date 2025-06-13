'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RealTimeAnalytics, 
  RealTimeMetrics, 
  AnalyticsUpdate,
  realTimeAnalytics 
} from '@/lib/analytics/RealTimeAnalytics';

export interface UseRealTimeMetricsOptions {
  surveyId: string;
  enabled?: boolean;
  onUpdate?: (update: AnalyticsUpdate) => void;
  onMetricsChange?: (metrics: RealTimeMetrics) => void;
}

export const useRealTimeMetrics = (options: UseRealTimeMetricsOptions) => {
  const { surveyId, enabled = true, onUpdate, onMetricsChange } = options;
  
  // State
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeRespondents: 0,
    responseCount: 0,
    lastResponseTime: null,
    recentResponses: [],
    completionRate: 0
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<AnalyticsUpdate[]>([]);
  
  // Refs
  const subscriptionIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Analytics update handler
  const handleAnalyticsUpdate = useCallback((update: AnalyticsUpdate) => {
    setRecentActivity(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
    onUpdate?.(update);
  }, [onUpdate]);

  // Metrics update handler
  const handleMetricsUpdate = useCallback((newMetrics: RealTimeMetrics) => {
    setMetrics(newMetrics);
    onMetricsChange?.(newMetrics);
  }, [onMetricsChange]);

  // Connection setup
  const setupConnection = useCallback(async () => {
    if (!enabled || !surveyId) return;

    try {
      setConnectionError(null);
      
      // Subscribe to real-time analytics
      const subscriptionId = realTimeAnalytics.subscribeToSurvey(
        surveyId,
        handleAnalyticsUpdate,
        handleMetricsUpdate
      );
      
      subscriptionIdRef.current = subscriptionId;
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Load initial metrics
      const initialMetrics = realTimeAnalytics.getCurrentMetrics(surveyId);
      if (initialMetrics) {
        setMetrics(initialMetrics);
      }
      
      // Load recent activity
      const activity = realTimeAnalytics.getRecentActivity(surveyId);
      setRecentActivity(activity.slice(0, 50));
      
    } catch (error) {
      console.error('Failed to setup real-time connection:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnected(false);
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setupConnection();
        }, delay);
      }
    }
  }, [enabled, surveyId, handleAnalyticsUpdate, handleMetricsUpdate]);

  // Cleanup connection
  const cleanupConnection = useCallback(() => {
    if (subscriptionIdRef.current) {
      realTimeAnalytics.unsubscribeFromSurvey(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    cleanupConnection();
    reconnectAttempts.current = 0;
    setupConnection();
  }, [cleanupConnection, setupConnection]);

  // Setup connection on mount and when dependencies change
  useEffect(() => {
    setupConnection();
    return cleanupConnection;
  }, [setupConnection, cleanupConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupConnection();
    };
  }, [cleanupConnection]);

  // Helper function to get activity by type
  const getActivityByType = useCallback((type: AnalyticsUpdate['type']) => {
    return recentActivity.filter(activity => activity.type === type);
  }, [recentActivity]);

  // Helper function to get activity in time range
  const getActivityInTimeRange = useCallback((minutes: number) => {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return recentActivity.filter(activity => activity.timestamp > cutoff);
  }, [recentActivity]);

  // Calculate response velocity (responses per hour)
  const responseVelocity = useCallback(() => {
    const lastHourActivity = getActivityInTimeRange(60);
    const newResponses = lastHourActivity.filter(a => a.type === 'response_created');
    return newResponses.length;
  }, [getActivityInTimeRange]);

  // Calculate completion velocity (completions per hour)
  const completionVelocity = useCallback(() => {
    const lastHourActivity = getActivityInTimeRange(60);
    const completions = lastHourActivity.filter(a => 
      a.type === 'response_updated' && 
      a.data.new?.status === 'completed'
    );
    return completions.length;
  }, [getActivityInTimeRange]);

  return {
    // Core metrics
    metrics,
    
    // Connection state
    isConnected,
    connectionError,
    
    // Activity data
    recentActivity,
    
    // Calculated metrics
    responseVelocity: responseVelocity(),
    completionVelocity: completionVelocity(),
    
    // Utility functions
    getActivityByType,
    getActivityInTimeRange,
    
    // Control functions
    reconnect,
    
    // Raw methods for advanced usage
    getCurrentMetrics: () => realTimeAnalytics.getCurrentMetrics(surveyId),
    getRecentActivity: () => realTimeAnalytics.getRecentActivity(surveyId)
  };
};

// Hook for monitoring multiple surveys
export const useMultiSurveyRealTimeMetrics = (surveyIds: string[]) => {
  const [allMetrics, setAllMetrics] = useState<Record<string, RealTimeMetrics>>({});
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  
  const subscriptionsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    // Setup connections for new survey IDs
    surveyIds.forEach(surveyId => {
      if (!subscriptionsRef.current.has(surveyId)) {
        const subscriptionId = realTimeAnalytics.subscribeToSurvey(
          surveyId,
          (update) => {
            // Handle analytics update for this survey
          },
          (metrics) => {
            setAllMetrics(prev => ({
              ...prev,
              [surveyId]: metrics
            }));
          }
        );
        
        subscriptionsRef.current.set(surveyId, subscriptionId);
        setConnections(prev => ({
          ...prev,
          [surveyId]: true
        }));
      }
    });

    // Cleanup connections for removed survey IDs
    for (const [surveyId, subscriptionId] of subscriptionsRef.current.entries()) {
      if (!surveyIds.includes(surveyId)) {
        realTimeAnalytics.unsubscribeFromSurvey(subscriptionId);
        subscriptionsRef.current.delete(surveyId);
        
        setAllMetrics(prev => {
          const { [surveyId]: removed, ...rest } = prev;
          return rest;
        });
        
        setConnections(prev => {
          const { [surveyId]: removed, ...rest } = prev;
          return rest;
        });
      }
    }

    return () => {
      // Cleanup all subscriptions
      for (const subscriptionId of subscriptionsRef.current.values()) {
        realTimeAnalytics.unsubscribeFromSurvey(subscriptionId);
      }
      subscriptionsRef.current.clear();
    };
  }, [surveyIds]);

  return {
    metrics: allMetrics,
    connections,
    totalActiveRespondents: Object.values(allMetrics).reduce(
      (sum, metric) => sum + metric.activeRespondents, 0
    ),
    totalResponses: Object.values(allMetrics).reduce(
      (sum, metric) => sum + metric.responseCount, 0
    ),
    averageCompletionRate: Object.values(allMetrics).length > 0 ?
      Object.values(allMetrics).reduce((sum, metric) => sum + metric.completionRate, 0) / 
      Object.values(allMetrics).length : 0
  };
};