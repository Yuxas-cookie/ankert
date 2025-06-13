// 🚀 新しいSupabaseデータベース型定義
// Generated from comprehensive schema v2.0

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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          timezone: string
          language: string
          theme: 'light' | 'dark' | 'system'
          email_notifications: boolean
          push_notifications: boolean
          last_sign_in_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          timezone?: string
          language?: string
          theme?: 'light' | 'dark' | 'system'
          email_notifications?: boolean
          push_notifications?: boolean
          last_sign_in_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          timezone?: string
          language?: string
          theme?: 'light' | 'dark' | 'system'
          email_notifications?: boolean
          push_notifications?: boolean
          last_sign_in_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          avatar_url: string | null
          owner_id: string
          plan: 'free' | 'pro' | 'enterprise'
          max_members: number
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          avatar_url?: string | null
          owner_id: string
          plan?: 'free' | 'pro' | 'enterprise'
          max_members?: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          avatar_url?: string | null
          owner_id?: string
          plan?: 'free' | 'pro' | 'enterprise'
          max_members?: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: string[]
          is_system_role: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: string[]
          is_system_role?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: string[]
          is_system_role?: boolean
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role_id: string
          joined_at: string
          invited_by: string | null
          status: 'active' | 'inactive' | 'pending'
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role_id: string
          joined_at?: string
          invited_by?: string | null
          status?: 'active' | 'inactive' | 'pending'
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role_id?: string
          joined_at?: string
          invited_by?: string | null
          status?: 'active' | 'inactive' | 'pending'
        }
      }
      team_invitations: {
        Row: {
          id: string
          team_id: string
          email: string
          role_id: string
          invited_by: string
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          role_id: string
          invited_by: string
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          role_id?: string
          invited_by?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      surveys: {
        Row: {
          id: string
          user_id: string
          team_id: string | null
          title: string
          description: string | null
          status: 'draft' | 'published' | 'closed' | 'archived'
          is_draft: boolean
          draft_updated_at: string | null
          preview_token: string | null
          access_type: 'public' | 'url_only' | 'password' | 'authenticated' | 'email_restricted'
          access_password: string | null
          allowed_emails: string[] | null
          max_responses: number | null
          start_date: string | null
          end_date: string | null
          settings: Json
          branding: Json
          folder_id: string | null
          tags: string[]
          response_count: number
          completion_rate: number
          avg_completion_time: number | null
          created_at: string
          updated_at: string
          published_at: string | null
          closed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          team_id?: string | null
          title: string
          description?: string | null
          status?: 'draft' | 'published' | 'closed' | 'archived'
          is_draft?: boolean
          draft_updated_at?: string | null
          preview_token?: string | null
          access_type?: 'public' | 'url_only' | 'password' | 'authenticated' | 'email_restricted'
          access_password?: string | null
          allowed_emails?: string[] | null
          max_responses?: number | null
          start_date?: string | null
          end_date?: string | null
          settings?: Json
          branding?: Json
          folder_id?: string | null
          tags?: string[]
          response_count?: number
          completion_rate?: number
          avg_completion_time?: number | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string | null
          title?: string
          description?: string | null
          status?: 'draft' | 'published' | 'closed' | 'archived'
          is_draft?: boolean
          draft_updated_at?: string | null
          preview_token?: string | null
          access_type?: 'public' | 'url_only' | 'password' | 'authenticated' | 'email_restricted'
          access_password?: string | null
          allowed_emails?: string[] | null
          max_responses?: number | null
          start_date?: string | null
          end_date?: string | null
          settings?: Json
          branding?: Json
          folder_id?: string | null
          tags?: string[]
          response_count?: number
          completion_rate?: number
          avg_completion_time?: number | null
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
          question_type: 'single_choice' | 'multiple_choice' | 'text_short' | 'text_long' | 'rating_scale' | 'matrix_single' | 'matrix_multiple' | 'date' | 'time' | 'datetime' | 'file_upload' | 'slider' | 'ranking'
          question_text: string
          description: string | null
          is_required: boolean
          order_index: number
          settings: Json
          validation_rules: Json
          logic_conditions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          question_type: 'single_choice' | 'multiple_choice' | 'text_short' | 'text_long' | 'rating_scale' | 'matrix_single' | 'matrix_multiple' | 'date' | 'time' | 'datetime' | 'file_upload' | 'slider' | 'ranking'
          question_text: string
          description?: string | null
          is_required?: boolean
          order_index: number
          settings?: Json
          validation_rules?: Json
          logic_conditions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          question_type?: 'single_choice' | 'multiple_choice' | 'text_short' | 'text_long' | 'rating_scale' | 'matrix_single' | 'matrix_multiple' | 'date' | 'time' | 'datetime' | 'file_upload' | 'slider' | 'ranking'
          question_text?: string
          description?: string | null
          is_required?: boolean
          order_index?: number
          settings?: Json
          validation_rules?: Json
          logic_conditions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          option_value: string | null
          order_index: number
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          option_value?: string | null
          order_index: number
          settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          option_value?: string | null
          order_index?: number
          settings?: Json
          created_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          survey_id: string
          user_id: string | null
          session_id: string | null
          is_test_response: boolean
          is_complete: boolean
          completion_percentage: number
          started_at: string
          completed_at: string | null
          last_activity_at: string
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          device_info: Json
          time_spent: number | null
          page_views: number
        }
        Insert: {
          id?: string
          survey_id: string
          user_id?: string | null
          session_id?: string | null
          is_test_response?: boolean
          is_complete?: boolean
          completion_percentage?: number
          started_at?: string
          completed_at?: string | null
          last_activity_at?: string
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          device_info?: Json
          time_spent?: number | null
          page_views?: number
        }
        Update: {
          id?: string
          survey_id?: string
          user_id?: string | null
          session_id?: string | null
          is_test_response?: boolean
          is_complete?: boolean
          completion_percentage?: number
          started_at?: string
          completed_at?: string | null
          last_activity_at?: string
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          device_info?: Json
          time_spent?: number | null
          page_views?: number
        }
      }
      answers: {
        Row: {
          id: string
          response_id: string
          question_id: string
          answer_text: string | null
          answer_value: Json | null
          answer_numeric: number | null
          answer_date: string | null
          answer_timestamp: string | null
          time_spent: number | null
          revision_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          response_id: string
          question_id: string
          answer_text?: string | null
          answer_value?: Json | null
          answer_numeric?: number | null
          answer_date?: string | null
          answer_timestamp?: string | null
          time_spent?: number | null
          revision_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          response_id?: string
          question_id?: string
          answer_text?: string | null
          answer_value?: Json | null
          answer_numeric?: number | null
          answer_date?: string | null
          answer_timestamp?: string | null
          time_spent?: number | null
          revision_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      file_uploads: {
        Row: {
          id: string
          answer_id: string | null
          survey_id: string | null
          user_id: string | null
          filename: string
          original_filename: string
          file_size: number
          mime_type: string
          file_path: string
          storage_bucket: string
          upload_status: 'pending' | 'completed' | 'failed'
          virus_scan_status: 'pending' | 'clean' | 'infected'
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          answer_id?: string | null
          survey_id?: string | null
          user_id?: string | null
          filename: string
          original_filename: string
          file_size: number
          mime_type: string
          file_path: string
          storage_bucket?: string
          upload_status?: 'pending' | 'completed' | 'failed'
          virus_scan_status?: 'pending' | 'clean' | 'infected'
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          answer_id?: string | null
          survey_id?: string | null
          user_id?: string | null
          filename?: string
          original_filename?: string
          file_size?: number
          mime_type?: string
          file_path?: string
          storage_bucket?: string
          upload_status?: 'pending' | 'completed' | 'failed'
          virus_scan_status?: 'pending' | 'clean' | 'infected'
          created_at?: string
          expires_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          team_id: string | null
          survey_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          team_id?: string | null
          survey_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          team_id?: string | null
          survey_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
      }
      performance_metrics: {
        Row: {
          id: string
          user_id: string | null
          page_name: string
          url: string | null
          page_load_time: number | null
          first_contentful_paint: number | null
          largest_contentful_paint: number | null
          cumulative_layout_shift: number | null
          first_input_delay: number | null
          time_to_interactive: number | null
          user_agent: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          page_name: string
          url?: string | null
          page_load_time?: number | null
          first_contentful_paint?: number | null
          largest_contentful_paint?: number | null
          cumulative_layout_shift?: number | null
          first_input_delay?: number | null
          time_to_interactive?: number | null
          user_agent?: string | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          page_name?: string
          url?: string | null
          page_load_time?: number | null
          first_contentful_paint?: number | null
          largest_contentful_paint?: number | null
          cumulative_layout_shift?: number | null
          first_input_delay?: number | null
          time_to_interactive?: number | null
          user_agent?: string | null
          timestamp?: string
          created_at?: string
        }
      }
      realtime_sessions: {
        Row: {
          id: string
          user_id: string
          survey_id: string
          session_token: string
          status: 'active' | 'inactive' | 'expired'
          last_ping: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          survey_id: string
          session_token: string
          status?: 'active' | 'inactive' | 'expired'
          last_ping?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string
          survey_id?: string
          session_token?: string
          status?: 'active' | 'inactive' | 'expired'
          last_ping?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          team_id: string | null
          type: string
          title: string
          message: string | null
          data: Json
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id?: string | null
          type: string
          title: string
          message?: string | null
          data?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string | null
          type?: string
          title?: string
          message?: string | null
          data?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          survey_id: string
          response_id: string | null
          event_type: string
          event_name: string
          properties: Json
          timestamp: string
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          survey_id: string
          response_id?: string | null
          event_type: string
          event_name: string
          properties?: Json
          timestamp?: string
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          survey_id?: string
          response_id?: string | null
          event_type?: string
          event_name?: string
          properties?: Json
          timestamp?: string
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
    Views: {
      team_members_detailed: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role_id: string
          status: 'active' | 'inactive' | 'pending'
          joined_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role_name: string
          permissions: string[]
          team_name: string
        }
      }
      survey_stats_detailed: {
        Row: {
          id: string
          title: string
          status: 'draft' | 'published' | 'closed' | 'archived'
          created_at: string
          published_at: string | null
          response_count: number
          completion_rate: number
          avg_completion_time: number | null
          question_count: number
          creator_name: string | null
          team_name: string | null
        }
      }
    }
    Functions: {
      update_survey_stats: {
        Args: { survey_uuid: string }
        Returns: undefined
      }
      generate_preview_token: {
        Args: {}
        Returns: string
      }
      generate_invitation_token: {
        Args: {}
        Returns: string
      }
      is_team_member: {
        Args: { team_uuid: string; user_uuid: string }
        Returns: boolean
      }
      has_permission: {
        Args: { team_uuid: string; user_uuid: string; permission_name: string }
        Returns: boolean
      }
      can_access_survey: {
        Args: { survey_uuid: string; user_uuid?: string | null }
        Returns: boolean
      }
      can_access_survey_preview: {
        Args: { survey_uuid: string; token: string }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: {}
        Returns: number
      }
      cleanup_old_performance_metrics: {
        Args: {}
        Returns: number
      }
      cleanup_old_audit_logs: {
        Args: {}
        Returns: number
      }
      create_team_invitation_notification: {
        Args: { team_uuid: string; invited_email: string; inviter_id: string }
        Returns: string
      }
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: { team_name: string; role_name: string; permissions: string[] }[]
      }
      test_rls_policies: {
        Args: { user_uuid: string }
        Returns: Json
      }
    }
    Enums: {
      theme_type: 'light' | 'dark' | 'system'
      plan_type: 'free' | 'pro' | 'enterprise'
      member_status: 'active' | 'inactive' | 'pending'
      survey_status: 'draft' | 'published' | 'closed' | 'archived'
      access_type: 'public' | 'url_only' | 'password' | 'authenticated' | 'email_restricted'
      question_type: 'single_choice' | 'multiple_choice' | 'text_short' | 'text_long' | 'rating_scale' | 'matrix_single' | 'matrix_multiple' | 'date' | 'time' | 'datetime' | 'file_upload' | 'slider' | 'ranking'
      upload_status: 'pending' | 'completed' | 'failed'
      virus_scan_status: 'pending' | 'clean' | 'infected'
      session_status: 'active' | 'inactive' | 'expired'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 便利な型エイリアス
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Team = Database['public']['Tables']['teams']['Row']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']

export type Role = Database['public']['Tables']['roles']['Row']
export type RoleInsert = Database['public']['Tables']['roles']['Insert']
export type RoleUpdate = Database['public']['Tables']['roles']['Update']

export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update']

export type TeamInvitation = Database['public']['Tables']['team_invitations']['Row']
export type TeamInvitationInsert = Database['public']['Tables']['team_invitations']['Insert']
export type TeamInvitationUpdate = Database['public']['Tables']['team_invitations']['Update']

export type Survey = Database['public']['Tables']['surveys']['Row']
export type SurveyInsert = Database['public']['Tables']['surveys']['Insert']
export type SurveyUpdate = Database['public']['Tables']['surveys']['Update']

export type Question = Database['public']['Tables']['questions']['Row']
export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type QuestionUpdate = Database['public']['Tables']['questions']['Update']

export type QuestionOption = Database['public']['Tables']['question_options']['Row']
export type QuestionOptionInsert = Database['public']['Tables']['question_options']['Insert']
export type QuestionOptionUpdate = Database['public']['Tables']['question_options']['Update']

export type Response = Database['public']['Tables']['responses']['Row']
export type ResponseInsert = Database['public']['Tables']['responses']['Insert']
export type ResponseUpdate = Database['public']['Tables']['responses']['Update']

export type Answer = Database['public']['Tables']['answers']['Row']
export type AnswerInsert = Database['public']['Tables']['answers']['Insert']
export type AnswerUpdate = Database['public']['Tables']['answers']['Update']

export type FileUpload = Database['public']['Tables']['file_uploads']['Row']
export type FileUploadInsert = Database['public']['Tables']['file_uploads']['Insert']
export type FileUploadUpdate = Database['public']['Tables']['file_uploads']['Update']

export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update']

export type PerformanceMetric = Database['public']['Tables']['performance_metrics']['Row']
export type PerformanceMetricInsert = Database['public']['Tables']['performance_metrics']['Insert']
export type PerformanceMetricUpdate = Database['public']['Tables']['performance_metrics']['Update']

export type RealtimeSession = Database['public']['Tables']['realtime_sessions']['Row']
export type RealtimeSessionInsert = Database['public']['Tables']['realtime_sessions']['Insert']
export type RealtimeSessionUpdate = Database['public']['Tables']['realtime_sessions']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']
export type AnalyticsEventInsert = Database['public']['Tables']['analytics_events']['Insert']
export type AnalyticsEventUpdate = Database['public']['Tables']['analytics_events']['Update']

// ビューの型
export type TeamMemberDetailed = Database['public']['Views']['team_members_detailed']['Row']
export type SurveyStatsDetailed = Database['public']['Views']['survey_stats_detailed']['Row']

// 権限の型定義
export type Permission = 
  | 'team.manage'
  | 'team.delete'
  | 'team.settings'
  | 'members.invite'
  | 'members.remove'
  | 'members.manage_roles'
  | 'surveys.create'
  | 'surveys.edit'
  | 'surveys.delete'
  | 'surveys.publish'
  | 'surveys.share'
  | 'surveys.export'
  | 'surveys.view_responses'
  | 'surveys.respond'
  | 'analytics.view'
  | 'analytics.export'

// 役割の型定義
export type RoleName = 'owner' | 'admin' | 'editor' | 'viewer' | 'respondent'

// カスタム型
export interface SurveyWithStats extends Survey {
  question_count: number
  completed_responses: number
  total_responses: number
}

export interface TeamWithMembers extends Team {
  members: TeamMemberDetailed[]
  member_count: number
}

export interface QuestionWithOptions extends Question {
  options: QuestionOption[]
}

export interface SurveyWithQuestions extends Survey {
  questions: QuestionWithOptions[]
}

export interface ResponseWithAnswers extends Response {
  answers: Answer[]
}

// 設定の型定義
export interface QuestionSettings {
  // 単一選択・複数選択
  other_option?: boolean
  randomize_options?: boolean
  
  // テキスト
  min_length?: number
  max_length?: number
  placeholder?: string
  
  // 評価スケール
  scale_min?: number
  scale_max?: number
  scale_labels?: string[]
  scale_type?: 'stars' | 'numbers' | 'emoji' | 'thumbs'
  
  // マトリックス
  rows?: string[]
  columns?: string[]
  multiple_selection?: boolean
  
  // ファイルアップロード
  allowed_file_types?: string[]
  max_file_size?: number
  max_files?: number
  
  // 日付・時刻
  date_format?: string
  time_format?: string
  min_date?: string
  max_date?: string
}

export interface SurveySettings {
  // 全般設定
  show_progress_bar?: boolean
  allow_navigation?: boolean
  randomize_questions?: boolean
  
  // 回答設定
  allow_multiple_responses?: boolean
  require_authentication?: boolean
  auto_save?: boolean
  
  // 外観設定
  custom_css?: string
  logo_url?: string
  background_color?: string
  primary_color?: string
  
  // 完了設定
  thank_you_message?: string
  redirect_url?: string
}

export interface TeamSettings {
  // 通知設定
  email_notifications?: boolean
  slack_webhook?: string
  
  // アクセス設定
  default_survey_access?: 'public' | 'team_only'
  require_approval?: boolean
  
  // ブランディング
  logo_url?: string
  primary_color?: string
  secondary_color?: string
}