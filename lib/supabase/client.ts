import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../../types/database-new'

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// アンケート関連のヘルパー関数
export const supabase = createClient()

// 型安全なクエリビルダー
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// よく使用するテーブル型の定義 (新スキーマ対応)
export type Profile = Tables<'profiles'>
export type Team = Tables<'teams'>
export type Role = Tables<'roles'>
export type TeamMember = Tables<'team_members'>
export type Survey = Tables<'surveys'>
export type Question = Tables<'questions'>
export type QuestionOption = Tables<'question_options'>
export type Response = Tables<'responses'>
export type Answer = Tables<'answers'>
export type FileUpload = Tables<'file_uploads'>
export type AuditLog = Tables<'audit_logs'>
export type Notification = Tables<'notifications'>

// Insert型 (新スキーマ対応)
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type SurveyInsert = Database['public']['Tables']['surveys']['Insert']
export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type QuestionOptionInsert = Database['public']['Tables']['question_options']['Insert']
export type ResponseInsert = Database['public']['Tables']['responses']['Insert']
export type AnswerInsert = Database['public']['Tables']['answers']['Insert']

// Update型 (新スキーマ対応)
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']
export type SurveyUpdate = Database['public']['Tables']['surveys']['Update']
export type QuestionUpdate = Database['public']['Tables']['questions']['Update']
export type QuestionOptionUpdate = Database['public']['Tables']['question_options']['Update']
export type ResponseUpdate = Database['public']['Tables']['responses']['Update']
export type AnswerUpdate = Database['public']['Tables']['answers']['Update']