import { createClient } from './client'
import { Database } from '../../types/database-new'
import { Survey, SurveyWithQuestions } from '../../types/survey'
import { SurveyFormData } from '../validations/survey'

type SurveyInsert = Database['public']['Tables']['surveys']['Insert']
type SurveyUpdate = Database['public']['Tables']['surveys']['Update']

export class SurveyService {
  private supabase = createClient()

  async createSurvey(data: SurveyFormData, userId: string): Promise<{ data: Survey | null; error: Error | null }> {
    try {
      const surveyData: SurveyInsert = {
        user_id: userId,
        title: data.title,
        description: data.description || null,
        status: 'draft',
        is_draft: true,
        draft_updated_at: new Date().toISOString(),
        access_type: 'url_only', // Default access type
        settings: {},
        branding: {},
        tags: [],
        response_count: 0,
        completion_rate: 0,
      }

      const { data: survey, error } = await this.supabase
        .from('surveys')
        .insert(surveyData)
        .select()
        .single()

      if (error) throw error

      return { data: survey, error: null }
    } catch (error) {
      console.error('Create survey error:', error)
      return { data: null, error: error as Error }
    }
  }

  async getSurveys(userId: string): Promise<{ data: Survey[] | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('surveys')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getSurveyById(id: string, userId: string): Promise<{ data: SurveyWithQuestions | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('surveys')
        .select(`
          *,
          questions (
            *,
            question_options (*)
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error) throw error

      // Transform the data to match our expected structure
      const survey: SurveyWithQuestions = {
        ...data,
        questions: data.questions.map((question: any) => ({
          ...question,
          options: question.question_options || []
        }))
      }

      return { data: survey, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async updateSurvey(id: string, data: Partial<SurveyFormData>, userId: string): Promise<{ data: Survey | null; error: Error | null }> {
    try {
      const updateData: SurveyUpdate = {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        updated_at: new Date().toISOString(),
        draft_updated_at: new Date().toISOString(),
      }

      const { data: survey, error } = await this.supabase
        .from('surveys')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return { data: survey, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async deleteSurvey(id: string, userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('surveys')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async saveDraft(id: string, data: Partial<SurveyFormData>, userId: string): Promise<{ data: Survey | null; error: Error | null }> {
    try {
      const updateData: SurveyUpdate = {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        is_draft: true,
        draft_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: survey, error } = await this.supabase
        .from('surveys')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return { data: survey, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async duplicateSurvey(id: string, userId: string): Promise<{ data: Survey | null; error: Error | null }> {
    try {
      // Get original survey
      const { data: original, error: fetchError } = await this.getSurveyById(id, userId)
      if (fetchError || !original) throw fetchError || new Error('Survey not found')

      // Create duplicate
      const duplicateData: SurveyInsert = {
        user_id: userId,
        title: `${original.title} (コピー)`,
        description: original.description,
        status: 'draft',
        is_draft: true,
        draft_updated_at: new Date().toISOString(),
        access_type: (original as any).access_type || 'url_only',
        settings: (original as any).settings || {},
        branding: (original as any).branding || {},
        tags: (original as any).tags || [],
        response_count: 0,
        completion_rate: 0,
      }

      const { data: duplicate, error } = await this.supabase
        .from('surveys')
        .insert(duplicateData)
        .select()
        .single()

      if (error) throw error

      return { data: duplicate, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async publishSurvey(id: string, userId: string): Promise<{ data: Survey | null; error: Error | null }> {
    try {
      const updateData: SurveyUpdate = {
        status: 'published',
        is_draft: false,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: survey, error } = await this.supabase
        .from('surveys')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return { data: survey, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

export const surveyService = new SurveyService()