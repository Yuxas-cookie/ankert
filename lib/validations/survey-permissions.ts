import { z } from 'zod'

export const surveyPermissionTypes = [
  'public',           // 一般公開
  'url_access',       // URLを知っている人のみ
  'authenticated',    // ログインユーザーのみ  
  'restricted'        // 特定グループ/メールアドレスのみ
] as const

export type SurveyPermissionType = typeof surveyPermissionTypes[number]

export const surveyPermissionSchema = z.object({
  id: z.string().uuid().optional(),
  survey_id: z.string().uuid(),
  permission_type: z.enum(surveyPermissionTypes),
  allowed_emails: z.array(z.string().email()).optional(),
  password_hash: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
})

export const createSurveyPermissionSchema = z.object({
  survey_id: z.string().uuid(),
  permission_type: z.enum(surveyPermissionTypes),
  allowed_emails: z.array(z.string().email()).optional(),
  password: z.string().min(1).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional()
}).refine(data => {
  // 特定グループ制限の場合はメールアドレス必須
  if (data.permission_type === 'restricted' && (!data.allowed_emails || data.allowed_emails.length === 0)) {
    return false
  }
  return true
}, {
  message: '特定グループ制限の場合はメールアドレスを指定してください',
  path: ['allowed_emails']
}).refine(data => {
  // 期間設定の場合は開始日が終了日より前
  if (data.start_date && data.end_date && data.start_date >= data.end_date) {
    return false
  }
  return true
}, {
  message: '開始日は終了日より前に設定してください',
  path: ['end_date']
})

export const surveyAccessSchema = z.object({
  survey_id: z.string().uuid(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  access_token: z.string().optional()
})

export type SurveyPermission = z.infer<typeof surveyPermissionSchema>
export type CreateSurveyPermissionInput = z.infer<typeof createSurveyPermissionSchema>
export type SurveyAccessInput = z.infer<typeof surveyAccessSchema>