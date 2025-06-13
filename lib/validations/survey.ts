import { z } from 'zod'

// Define QuestionType as it's used in validation
export type QuestionType = 
  | 'single_choice'
  | 'multiple_choice' 
  | 'text'
  | 'textarea'
  | 'rating'
  | 'matrix'
  | 'date'
  | 'file'

export const surveyValidationSchema = z.object({
  title: z.string()
    .min(1, '質問タイトルは必須です')
    .max(255, 'タイトルは255文字以内で入力してください'),
  description: z.string()
    .max(1000, '説明文は1000文字以内で入力してください')
    .optional(),
})

export const questionValidationSchema = z.object({
  type: z.enum(['single_choice', 'multiple_choice', 'text', 'textarea', 'rating', 'matrix', 'date', 'file'] as const),
  text: z.string()
    .min(1, '質問文は必須です')
    .max(500, '質問文は500文字以内で入力してください'),
  required: z.boolean(),
  settings: z.object({
    ratingScale: z.object({
      min: z.number().min(1),
      max: z.number().max(10),
      labels: z.array(z.string()).optional(),
    }).optional(),
    matrix: z.object({
      rows: z.array(z.string()).min(1),
      columns: z.array(z.string()).min(1),
    }).optional(),
    file: z.object({
      maxSize: z.number().positive(),
      allowedTypes: z.array(z.string()),
    }).optional(),
    conditional: z.object({
      dependsOn: z.string(),
      showIf: z.object({
        value: z.union([z.string(), z.array(z.string())]),
        operator: z.enum(['equals', 'contains', 'not_equals']),
      }),
    }).optional(),
  }).optional(),
  options: z.array(z.string()).optional(),
})

export const surveyFormSchema = z.object({
  title: surveyValidationSchema.shape.title,
  description: surveyValidationSchema.shape.description,
  questions: z.array(questionValidationSchema).optional(),
})

// Validation helper functions
export const validateQuestionByType = (type: QuestionType, data: any) => {
  switch (type) {
    case 'single_choice':
    case 'multiple_choice':
      return data.options && data.options.length >= 2
        ? { valid: true }
        : { valid: false, error: '選択肢は最低2つ必要です' }
    
    case 'text':
    case 'textarea':
      return { valid: true }
    
    case 'rating':
      return data.settings?.ratingScale 
        ? { valid: true }
        : { valid: false, error: '評価スケールの設定が必要です' }
    
    case 'matrix':
      return data.settings?.matrix?.rows?.length > 0 && data.settings?.matrix?.columns?.length > 0
        ? { valid: true }
        : { valid: false, error: 'マトリックスの行と列の設定が必要です' }
    
    case 'date':
      return { valid: true }
    
    case 'file':
      return data.settings?.file
        ? { valid: true }
        : { valid: false, error: 'ファイルアップロード設定が必要です' }
    
    default:
      return { valid: false, error: '無効な質問タイプです' }
  }
}

export const validateSurveyStructure = (survey: any) => {
  const errors: string[] = []
  
  // Basic survey validation
  if (!survey.title || survey.title.trim() === '') {
    errors.push('アンケートタイトルは必須です')
  }
  
  // Questions validation
  if (!survey.questions || survey.questions.length === 0) {
    errors.push('最低1つの質問が必要です')
  } else {
    survey.questions.forEach((question: any, index: number) => {
      const validation = validateQuestionByType(question.type, question)
      if (!validation.valid) {
        errors.push(`質問${index + 1}: ${validation.error}`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export type SurveyFormData = z.infer<typeof surveyFormSchema>
export type QuestionFormData = z.infer<typeof questionValidationSchema>