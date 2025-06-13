import { createClient } from './client'
import { Database, QuestionWithOptions } from '../../types/database-new'
import { Question, QuestionOption } from '../../types/survey'

// QuestionFormData type definition
export interface QuestionFormData {
  type: string
  text: string
  required: boolean
  options?: string[]
  settings?: any
}

type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type QuestionUpdate = Database['public']['Tables']['questions']['Update']

export class QuestionService {
  private supabase = createClient()

  async createQuestion(
    surveyId: string, 
    data: QuestionFormData, 
    orderIndex: number
  ): Promise<{ data: Question | null; error: Error | null }> {
    try {
      // Map form types to database types
      const typeMapping: Record<string, string> = {
        'text': 'text_short',
        'textarea': 'text_long',
        'rating': 'rating_scale',
        'matrix': 'matrix_single',
        'file': 'file_upload'
      }
      
      const dbQuestionType = typeMapping[data.type] || data.type
      
      const questionData: QuestionInsert = {
        survey_id: surveyId,
        question_type: dbQuestionType as any,
        question_text: data.text,
        is_required: data.required,
        order_index: orderIndex,
        settings: data.settings ? JSON.parse(JSON.stringify(data.settings)) : null,
      }

      const { data: question, error } = await this.supabase
        .from('questions')
        .insert(questionData)
        .select()
        .single()

      if (error) throw error

      // Create options if this is a choice question
      if (data.options && data.options.length > 0 && question) {
        const optionsData = data.options.map((optionText, index) => ({
          question_id: question.id,
          option_text: optionText,
          order_index: index,
        }))

        const { error: optionsError } = await this.supabase
          .from('question_options')
          .insert(optionsData)

        if (optionsError) throw optionsError
      }

      return { data: question, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getQuestionsBySurveyId(surveyId: string): Promise<{ data: QuestionWithOptions[] | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('questions')
        .select(`
          *,
          question_options (*)
        `)
        .eq('survey_id', surveyId)
        .order('order_index')

      if (error) throw error

      // Transform the data to match our expected structure
      const questions: QuestionWithOptions[] = data.map((question: any) => ({
        ...question,
        options: question.question_options || []
      }))

      return { data: questions, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async updateQuestion(
    id: string, 
    data: Partial<QuestionFormData>
  ): Promise<{ data: Question | null; error: Error | null }> {
    try {
      // Map form types to database types
      const typeMapping: Record<string, string> = {
        'text': 'text_short',
        'textarea': 'text_long',
        'rating': 'rating_scale',
        'matrix': 'matrix_single',
        'file': 'file_upload'
      }
      
      const dbQuestionType = data.type ? (typeMapping[data.type] || data.type) : undefined
      
      const updateData: QuestionUpdate = {
        ...(dbQuestionType && { question_type: dbQuestionType as any }),
        ...(data.text && { question_text: data.text }),
        ...(data.required !== undefined && { is_required: data.required }),
        ...(data.settings && { settings: JSON.parse(JSON.stringify(data.settings)) }),
        updated_at: new Date().toISOString(),
      }

      const { data: question, error } = await this.supabase
        .from('questions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update options if provided
      if (data.options !== undefined) {
        // Delete existing options
        await this.supabase
          .from('question_options')
          .delete()
          .eq('question_id', id)

        // Insert new options
        if (data.options.length > 0) {
          const optionsData = data.options.map((optionText, index) => ({
            question_id: id,
            option_text: optionText,
            order_index: index,
          }))

          const { error: optionsError } = await this.supabase
            .from('question_options')
            .insert(optionsData)

          if (optionsError) throw optionsError
        }
      }

      return { data: question, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async deleteQuestion(id: string): Promise<{ error: Error | null }> {
    try {
      // Delete options first (cascade should handle this, but being explicit)
      await this.supabase
        .from('question_options')
        .delete()
        .eq('question_id', id)

      // Delete question
      const { error } = await this.supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async reorderQuestions(surveyId: string, questionIds: string[]): Promise<{ error: Error | null }> {
    try {
      // Update order_index for each question
      const updates = questionIds.map((questionId, index) => 
        this.supabase
          .from('questions')
          .update({ order_index: index })
          .eq('id', questionId)
          .eq('survey_id', surveyId)
      )

      await Promise.all(updates)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async duplicateQuestion(id: string, surveyId: string): Promise<{ data: Question | null; error: Error | null }> {
    try {
      // Get original question with options
      const { data: original, error: fetchError } = await this.supabase
        .from('questions')
        .select(`
          *,
          question_options (*)
        `)
        .eq('id', id)
        .single()

      if (fetchError || !original) throw fetchError || new Error('Question not found')

      // Get next order index
      const { data: questions } = await this.supabase
        .from('questions')
        .select('order_index')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrderIndex = questions && questions.length > 0 ? questions[0].order_index + 1 : 0

      // Create duplicate question
      const duplicateData: QuestionInsert = {
        survey_id: surveyId,
        question_type: original.question_type,
        question_text: `${original.question_text} (コピー)`,
        is_required: original.is_required,
        order_index: nextOrderIndex,
        settings: original.settings,
      }

      const { data: duplicate, error } = await this.supabase
        .from('questions')
        .insert(duplicateData)
        .select()
        .single()

      if (error) throw error

      // Duplicate options if any
      if (original.question_options && original.question_options.length > 0 && duplicate) {
        const optionsData = original.question_options.map((option: any) => ({
          question_id: duplicate.id,
          option_text: option.option_text,
          order_index: option.order_index,
        }))

        const { error: optionsError } = await this.supabase
          .from('question_options')
          .insert(optionsData)

        if (optionsError) throw optionsError
      }

      return { data: duplicate, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

export const questionService = new QuestionService()