import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RealTimeMetrics {
  total_responses: number
  active_responders: number
  completion_rate: number
  avg_completion_time: number
  responses_last_hour: number
  responses_today: number
  question_metrics: {
    question_id: string
    response_count: number
    completion_rate: number
  }[]
}

export interface ResponseActivity {
  timestamp: string
  response_id: string
  status: 'started' | 'completed' | 'abandoned'
  completion_time?: number
  user_id?: string
}

export class RealTimeMetricsService {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  /**
   * Subscribe to real-time metrics for a survey
   */
  subscribeToSurveyMetrics(
    surveyId: string,
    callback: (metrics: RealTimeMetrics) => void
  ): () => void {
    const channelName = `survey-metrics-${surveyId}`
    
    // Add callback to listeners
    if (!this.listeners.has(channelName)) {
      this.listeners.set(channelName, new Set())
    }
    this.listeners.get(channelName)!.add(callback)

    // Create channel if it doesn't exist
    if (!this.channels.has(channelName)) {
      const channel = this.supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'survey_responses',
            filter: `survey_id=eq.${surveyId}`
          },
          () => {
            this.fetchAndBroadcastMetrics(surveyId)
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'response_data',
            filter: `survey_id=eq.${surveyId}`
          },
          () => {
            this.fetchAndBroadcastMetrics(surveyId)
          }
        )
        .subscribe()

      this.channels.set(channelName, channel)

      // Fetch initial metrics
      this.fetchAndBroadcastMetrics(surveyId)
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(channelName)
      if (listeners) {
        listeners.delete(callback)
        
        // Remove channel if no listeners remain
        if (listeners.size === 0) {
          const channel = this.channels.get(channelName)
          if (channel) {
            this.supabase.removeChannel(channel)
            this.channels.delete(channelName)
          }
          this.listeners.delete(channelName)
        }
      }
    }
  }

  /**
   * Subscribe to response activity feed
   */
  subscribeToResponseActivity(
    surveyId: string,
    callback: (activity: ResponseActivity) => void
  ): () => void {
    const channelName = `response-activity-${surveyId}`
    
    if (!this.listeners.has(channelName)) {
      this.listeners.set(channelName, new Set())
    }
    this.listeners.get(channelName)!.add(callback)

    if (!this.channels.has(channelName)) {
      const channel = this.supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'survey_responses',
            filter: `survey_id=eq.${surveyId}`
          },
          (payload) => {
            const activity: ResponseActivity = {
              timestamp: payload.new.created_at,
              response_id: payload.new.id,
              status: 'started',
              user_id: payload.new.user_id
            }
            this.broadcastToListeners(channelName, activity)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'survey_responses',
            filter: `survey_id=eq.${surveyId}`
          },
          (payload) => {
            if (payload.new.status === 'completed') {
              const activity: ResponseActivity = {
                timestamp: payload.new.completed_at,
                response_id: payload.new.id,
                status: 'completed',
                completion_time: this.calculateCompletionTime(
                  payload.new.created_at,
                  payload.new.completed_at
                ),
                user_id: payload.new.user_id
              }
              this.broadcastToListeners(channelName, activity)
            }
          }
        )
        .subscribe()

      this.channels.set(channelName, channel)
    }

    return () => {
      const listeners = this.listeners.get(channelName)
      if (listeners) {
        listeners.delete(callback)
        
        if (listeners.size === 0) {
          const channel = this.channels.get(channelName)
          if (channel) {
            this.supabase.removeChannel(channel)
            this.channels.delete(channelName)
          }
          this.listeners.delete(channelName)
        }
      }
    }
  }

  /**
   * Get current metrics for a survey
   */
  async getSurveyMetrics(surveyId: string): Promise<RealTimeMetrics> {
    try {
      const [
        totalResponses,
        completedResponses,
        activeResponders,
        avgCompletionTime,
        responsesLastHour,
        responsesToday,
        questionMetrics
      ] = await Promise.all([
        this.getTotalResponses(surveyId),
        this.getCompletedResponses(surveyId),
        this.getActiveResponders(surveyId),
        this.getAverageCompletionTime(surveyId),
        this.getResponsesLastHour(surveyId),
        this.getResponsesToday(surveyId),
        this.getQuestionMetrics(surveyId)
      ])

      return {
        total_responses: totalResponses,
        active_responders: activeResponders,
        completion_rate: totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0,
        avg_completion_time: avgCompletionTime,
        responses_last_hour: responsesLastHour,
        responses_today: responsesToday,
        question_metrics: questionMetrics
      }
    } catch (error) {
      console.error('Error fetching survey metrics:', error)
      throw error
    }
  }

  /**
   * Track real-time user activity
   */
  async trackUserActivity(surveyId: string, responseId: string, action: string): Promise<void> {
    try {
      await this.supabase
        .from('response_activity_log')
        .insert({
          survey_id: surveyId,
          response_id: responseId,
          action,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error tracking user activity:', error)
    }
  }

  private async fetchAndBroadcastMetrics(surveyId: string): Promise<void> {
    try {
      const metrics = await this.getSurveyMetrics(surveyId)
      const channelName = `survey-metrics-${surveyId}`
      this.broadcastToListeners(channelName, metrics)
    } catch (error) {
      console.error('Error fetching and broadcasting metrics:', error)
    }
  }

  private broadcastToListeners(channelName: string, data: any): void {
    const listeners = this.listeners.get(channelName)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  private async getTotalResponses(surveyId: string): Promise<number> {
    const { count } = await this.supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId)

    return count || 0
  }

  private async getCompletedResponses(surveyId: string): Promise<number> {
    const { count } = await this.supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId)
      .eq('status', 'completed')

    return count || 0
  }

  private async getActiveResponders(surveyId: string): Promise<number> {
    // Count responses started in the last 30 minutes that haven't been completed
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    const { count } = await this.supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId)
      .eq('status', 'in_progress')
      .gte('created_at', thirtyMinutesAgo)

    return count || 0
  }

  private async getAverageCompletionTime(surveyId: string): Promise<number> {
    const { data } = await this.supabase
      .from('survey_responses')
      .select('created_at, completed_at')
      .eq('survey_id', surveyId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null)

    if (!data || data.length === 0) return 0

    const totalTime = data.reduce((sum, response) => {
      const completionTime = this.calculateCompletionTime(
        response.created_at,
        response.completed_at
      )
      return sum + completionTime
    }, 0)

    return Math.round(totalTime / data.length)
  }

  private async getResponsesLastHour(surveyId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { count } = await this.supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId)
      .gte('created_at', oneHourAgo)

    return count || 0
  }

  private async getResponsesToday(surveyId: string): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count } = await this.supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId)
      .gte('created_at', today.toISOString())

    return count || 0
  }

  private async getQuestionMetrics(surveyId: string): Promise<any[]> {
    const { data: questions } = await this.supabase
      .from('questions')
      .select('id')
      .eq('survey_id', surveyId)

    if (!questions) return []

    const metrics = await Promise.all(
      questions.map(async (question) => {
        const { count: responseCount } = await this.supabase
          .from('response_data')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', question.id)

        const { count: totalResponses } = await this.supabase
          .from('survey_responses')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', surveyId)

        return {
          question_id: question.id,
          response_count: responseCount || 0,
          completion_rate: (totalResponses && totalResponses > 0) ? ((responseCount || 0) / totalResponses) * 100 : 0
        }
      })
    )

    return metrics
  }

  private calculateCompletionTime(startTime: string, endTime: string): number {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    return Math.round((end - start) / 1000) // in seconds
  }

  /**
   * Clean up all subscriptions
   */
  dispose(): void {
    this.channels.forEach(channel => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.listeners.clear()
  }
}