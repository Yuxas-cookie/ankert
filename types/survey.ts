// Survey-related types
export interface Survey {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'draft' | 'published' | 'closed' | 'archived'
  is_draft: boolean
  created_at: string
  updated_at: string
  published_at?: string
}

export interface Question {
  id: string
  survey_id: string
  question_type: string
  question_text: string
  is_required: boolean
  order_index: number
  settings?: any
}

export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  order_index: number
}

export interface Response {
  id: string
  survey_id: string
  user_id?: string
  is_complete: boolean
  started_at: string
  completed_at?: string
}

export interface Answer {
  id: string
  response_id: string
  question_id: string
  answer_text?: string
  answer_value?: any
}

export interface ResponseSubmission {
  survey_id: string
  user_id?: string | null
  is_test_response?: boolean
  started_at?: string
  completed_at?: string
  ip_address?: string
  user_agent?: string
  answers?: {
    question_id: string
    answer_text?: string
    answer_value?: any
  }[]
}

export interface SurveyWithQuestions extends Survey {
  questions: (Question & {
    options: QuestionOption[]
  })[]
}