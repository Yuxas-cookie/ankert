export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      surveys: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'draft' | 'published' | 'closed' | 'archived'
          is_draft: boolean
          draft_updated_at: string | null
          preview_token: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          closed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'draft' | 'published' | 'closed' | 'archived'
          is_draft?: boolean
          draft_updated_at?: string | null
          preview_token?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'draft' | 'published' | 'closed' | 'archived'
          is_draft?: boolean
          draft_updated_at?: string | null
          preview_token?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          closed_at?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          survey_id: string
          question_type: string
          question_text: string
          is_required: boolean
          order_index: number
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          question_type: string
          question_text: string
          is_required?: boolean
          order_index: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          question_type?: string
          question_text?: string
          is_required?: boolean
          order_index?: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          order_index?: number
          created_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          survey_id: string
          user_id: string | null
          is_test_response: boolean
          started_at: string
          completed_at: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          survey_id: string
          user_id?: string | null
          is_test_response?: boolean
          started_at?: string
          completed_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          survey_id?: string
          user_id?: string | null
          is_test_response?: boolean
          started_at?: string
          completed_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      answers: {
        Row: {
          id: string
          response_id: string
          question_id: string
          answer_text: string | null
          answer_value: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          response_id: string
          question_id: string
          answer_text?: string | null
          answer_value?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          response_id?: string
          question_id?: string
          answer_text?: string | null
          answer_value?: Json | null
          created_at?: string
        }
      }
      survey_permissions: {
        Row: {
          id: string
          survey_id: string
          permission_type: string
          allowed_emails: string[] | null
          password_hash: string | null
          start_date: string | null
          end_date: string | null
        }
        Insert: {
          id?: string
          survey_id: string
          permission_type: string
          allowed_emails?: string[] | null
          password_hash?: string | null
          start_date?: string | null
          end_date?: string | null
        }
        Update: {
          id?: string
          survey_id?: string
          permission_type?: string
          allowed_emails?: string[] | null
          password_hash?: string | null
          start_date?: string | null
          end_date?: string | null
        }
      }
      survey_previews: {
        Row: {
          id: string
          survey_id: string
          token: string
          password_hash: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          token: string
          password_hash?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          token?: string
          password_hash?: string | null
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}