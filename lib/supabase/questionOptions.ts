import { createClient } from './client'
import { Database } from '../../types/database'
import { QuestionOption } from '../../types/survey'

type QuestionOptionInsert = Database['public']['Tables']['question_options']['Insert']
type QuestionOptionUpdate = Database['public']['Tables']['question_options']['Update']

export class QuestionOptionService {
  private supabase = createClient()

  async createOption(
    questionId: string, 
    optionText: string, 
    orderIndex: number
  ): Promise<{ data: QuestionOption | null; error: Error | null }> {
    try {
      const optionData: QuestionOptionInsert = {
        question_id: questionId,
        option_text: optionText,
        order_index: orderIndex,
      }

      const { data: option, error } = await this.supabase
        .from('question_options')
        .insert(optionData)
        .select()
        .single()

      if (error) throw error

      return { data: option, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async updateOption(
    id: string, 
    optionText: string
  ): Promise<{ data: QuestionOption | null; error: Error | null }> {
    try {
      const updateData: QuestionOptionUpdate = {
        option_text: optionText,
      }

      const { data: option, error } = await this.supabase
        .from('question_options')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data: option, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async deleteOption(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('question_options')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async reorderOptions(questionId: string, optionIds: string[]): Promise<{ error: Error | null }> {
    try {
      // Update order_index for each option
      const updates = optionIds.map((optionId, index) => 
        this.supabase
          .from('question_options')
          .update({ order_index: index })
          .eq('id', optionId)
          .eq('question_id', questionId)
      )

      await Promise.all(updates)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async bulkCreateOptions(
    questionId: string, 
    options: string[]
  ): Promise<{ data: QuestionOption[] | null; error: Error | null }> {
    try {
      const optionsData: QuestionOptionInsert[] = options.map((optionText, index) => ({
        question_id: questionId,
        option_text: optionText,
        order_index: index,
      }))

      const { data, error } = await this.supabase
        .from('question_options')
        .insert(optionsData)
        .select()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async bulkUpdateOptions(
    questionId: string, 
    options: { id?: string; text: string }[]
  ): Promise<{ error: Error | null }> {
    try {
      // Delete all existing options
      await this.supabase
        .from('question_options')
        .delete()
        .eq('question_id', questionId)

      // Insert new options
      if (options.length > 0) {
        const optionsData: QuestionOptionInsert[] = options.map((option, index) => ({
          question_id: questionId,
          option_text: option.text,
          order_index: index,
        }))

        const { error } = await this.supabase
          .from('question_options')
          .insert(optionsData)

        if (error) throw error
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }
}

export const questionOptionService = new QuestionOptionService()