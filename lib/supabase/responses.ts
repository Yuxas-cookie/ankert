import { createClient } from './client'
import { ResponseSubmission, Response } from '@/types/survey'

export class ResponseService {
  private supabase = createClient()

  async submitResponse(data: ResponseSubmission): Promise<{ data: Response | null; error: Error | null }> {
    try {
      const { data: response, error } = await this.supabase
        .from('responses')
        .insert(data)
        .select()
        .single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: response, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getResponsesBySurvey(surveyId: string, userId: string): Promise<{ data: any[] | null; error: Error | null }> {
    try {
      // First verify the user owns the survey
      const { data: survey, error: surveyError } = await this.supabase
        .from('surveys')
        .select('user_id')
        .eq('id', surveyId)
        .single()

      if (surveyError || !survey || survey.user_id !== userId) {
        return { data: null, error: new Error('Access denied') }
      }

      const { data: responses, error } = await this.supabase
        .from('responses')
        .select(`
          *,
          answers (
            question_id,
            answer_text,
            answer_value
          )
        `)
        .eq('survey_id', surveyId)
        .order('completed_at', { ascending: false })

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      // Transform responses to include response_data
      const transformedResponses = responses?.map(response => ({
        ...response,
        submitted_at: response.completed_at || response.started_at,
        response_data: response.answers?.reduce((acc: Record<string, any>, answer: any) => {
          if (answer.answer_value) {
            try {
              acc[answer.question_id] = JSON.parse(answer.answer_value)
            } catch {
              acc[answer.question_id] = answer.answer_value
            }
          } else {
            acc[answer.question_id] = answer.answer_text
          }
          return acc
        }, {}) || {}
      })) || []

      return { data: transformedResponses, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getResponseById(responseId: string, userId: string): Promise<{ data: any | null; error: Error | null }> {
    try {
      // Get the response with survey info to verify ownership
      const { data: response, error: responseError } = await this.supabase
        .from('responses')
        .select(`
          *,
          survey:surveys!inner (
            id,
            title,
            description,
            user_id,
            questions (
              id,
              question_type,
              question_text,
              is_required,
              order_index,
              settings,
              question_options (
                id,
                option_text,
                order_index
              )
            )
          ),
          answers (
            question_id,
            answer_text,
            answer_value
          )
        `)
        .eq('id', responseId)
        .single()

      if (responseError || !response) {
        return { data: null, error: new Error('Response not found') }
      }

      // Verify the user owns the survey
      if (response.survey.user_id !== userId) {
        return { data: null, error: new Error('Access denied') }
      }

      // Sort questions by order
      response.survey.questions.sort((a: any, b: any) => a.order_index - b.order_index)
      response.survey.questions.forEach((question: any) => {
        if (question.question_options) {
          question.question_options.sort((a: any, b: any) => a.order_index - b.order_index)
        }
      })

      // Transform response to include response_data
      const transformedResponse = {
        ...response,
        submitted_at: response.completed_at || response.started_at,
        response_data: response.answers?.reduce((acc: Record<string, any>, answer: any) => {
          if (answer.answer_value) {
            try {
              acc[answer.question_id] = JSON.parse(answer.answer_value)
            } catch {
              acc[answer.question_id] = answer.answer_value
            }
          } else {
            acc[answer.question_id] = answer.answer_text
          }
          return acc
        }, {}) || {}
      }

      return { data: transformedResponse, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getResponseStats(surveyId: string, userId: string): Promise<{ data: any | null; error: Error | null }> {
    try {
      // First verify the user owns the survey
      const { data: survey, error: surveyError } = await this.supabase
        .from('surveys')
        .select('user_id')
        .eq('id', surveyId)
        .single()

      if (surveyError || !survey || survey.user_id !== userId) {
        return { data: null, error: new Error('Access denied') }
      }

      // Get response count and stats
      const { count: totalResponses } = await this.supabase
        .from('responses')
        .select('*', { count: 'exact' })
        .eq('survey_id', surveyId)

      // Get responses from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentResponses } = await this.supabase
        .from('responses')
        .select('*', { count: 'exact' })
        .eq('survey_id', surveyId)
        .gte('completed_at', thirtyDaysAgo.toISOString())

      // Get latest response date
      const { data: latestResponse } = await this.supabase
        .from('responses')
        .select('completed_at')
        .eq('survey_id', surveyId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      return {
        data: {
          totalResponses: totalResponses || 0,
          recentResponses: recentResponses || 0,
          latestResponseAt: latestResponse?.completed_at || null
        },
        error: null
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getPublicSurvey(surveyId: string): Promise<{ data: any | null; error: Error | null }> {
    try {
      const { data: survey, error } = await this.supabase
        .from('surveys')
        .select(`
          id,
          title,
          description,
          status,
          questions (
            id,
            question_type,
            question_text,
            is_required,
            order_index,
            settings,
            question_options (
              id,
              option_text,
              order_index
            )
          )
        `)
        .eq('id', surveyId)
        .eq('status', 'published')
        .single()

      if (error || !survey) {
        return { data: null, error: new Error('Survey not found or not available') }
      }

      // Sort questions and options by order
      survey.questions.sort((a: any, b: any) => a.order_index - b.order_index)
      survey.questions.forEach((question: any) => {
        if (question.question_options) {
          question.question_options.sort((a: any, b: any) => a.order_index - b.order_index)
        }
      })

      return { data: survey, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async validateResponse(surveyId: string, responses: Record<string, any>): Promise<{ valid: boolean; errors: Record<string, string> }> {
    try {
      // Get survey structure for validation
      const { data: survey, error } = await this.supabase
        .from('surveys')
        .select(`
          questions (
            id,
            question_type,
            is_required,
            settings
          )
        `)
        .eq('id', surveyId)
        .single()

      if (error || !survey) {
        return { valid: false, errors: { general: 'Survey not found' } }
      }

      const validationErrors: Record<string, string> = {}

      for (const question of survey.questions) {
        const response = responses[question.id]

        // Check required fields
        if (question.is_required && (!response || response === '')) {
          validationErrors[question.id] = 'This field is required'
          continue
        }

        // Skip validation if no response provided for optional field
        if (!response && response !== 0 && response !== false) {
          continue
        }

        // Validate response based on question type
        switch (question.question_type) {
          case 'single_choice':
            if (typeof response !== 'string') {
              validationErrors[question.id] = 'Invalid response format'
            }
            break

          case 'multiple_choice':
            if (!Array.isArray(response)) {
              validationErrors[question.id] = 'Invalid response format'
            }
            break

          case 'text':
          case 'textarea':
            if (typeof response !== 'string') {
              validationErrors[question.id] = 'Invalid response format'
            } else {
              const settings = question.settings as any
              if (settings?.minLength && response.length < settings.minLength) {
                validationErrors[question.id] = `Minimum ${settings.minLength} characters required`
              }
              if (settings?.maxLength && response.length > settings.maxLength) {
                validationErrors[question.id] = `Maximum ${settings.maxLength} characters allowed`
              }
            }
            break

          case 'rating':
            const ratingValue = Number(response)
            if (isNaN(ratingValue)) {
              validationErrors[question.id] = 'Invalid rating value'
            } else {
              const settings = question.settings as any
              const min = settings?.minValue || 1
              const max = settings?.maxValue || 5
              if (ratingValue < min || ratingValue > max) {
                validationErrors[question.id] = `Rating must be between ${min} and ${max}`
              }
            }
            break

          case 'date':
            if (typeof response !== 'string' || isNaN(Date.parse(response))) {
              validationErrors[question.id] = 'Invalid date format'
            }
            break

          case 'matrix':
            if (typeof response !== 'object' || Array.isArray(response)) {
              validationErrors[question.id] = 'Invalid matrix response format'
            }
            break
        }
      }

      return {
        valid: Object.keys(validationErrors).length === 0,
        errors: validationErrors
      }
    } catch (error) {
      return { valid: false, errors: { general: 'Validation failed' } }
    }
  }
}

export const responseService = new ResponseService()