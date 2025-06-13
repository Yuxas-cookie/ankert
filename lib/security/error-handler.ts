// Centralized error handling utilities

interface ErrorContext {
  userId?: string
  action?: string
  metadata?: Record<string, any>
}

export class AppError extends Error {
  public code: string
  public statusCode: number
  public context?: ErrorContext

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: ErrorContext
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.context = context
  }
}

export const ErrorCodes = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  // Survey errors
  SURVEY_NOT_FOUND: 'SURVEY_NOT_FOUND',
  SURVEY_ACCESS_DENIED: 'SURVEY_ACCESS_DENIED',
  SURVEY_EXPIRED: 'SURVEY_EXPIRED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

export const handleError = (error: unknown, context?: ErrorContext): AppError => {
  // Already an AppError
  if (error instanceof AppError) {
    return error
  }

  // Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as any
    const message = supabaseError.message || 'データベースエラーが発生しました'
    const code = supabaseError.code || ErrorCodes.DATABASE_ERROR
    
    return new AppError(message, code, 500, context)
  }

  // Standard errors
  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorCodes.INTERNAL_ERROR,
      500,
      context
    )
  }

  // Unknown errors
  return new AppError(
    'エラーが発生しました',
    ErrorCodes.INTERNAL_ERROR,
    500,
    context
  )
}

export const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.code) {
    case ErrorCodes.AUTH_INVALID_CREDENTIALS:
      return 'メールアドレスまたはパスワードが正しくありません'
    case ErrorCodes.AUTH_SESSION_EXPIRED:
      return 'セッションの有効期限が切れました。再度ログインしてください'
    case ErrorCodes.AUTH_UNAUTHORIZED:
      return 'この操作を行う権限がありません'
    case ErrorCodes.SURVEY_NOT_FOUND:
      return 'アンケートが見つかりません'
    case ErrorCodes.SURVEY_ACCESS_DENIED:
      return 'このアンケートにアクセスする権限がありません'
    case ErrorCodes.SURVEY_EXPIRED:
      return 'このアンケートの回答期限が終了しました'
    case ErrorCodes.VALIDATION_FAILED:
      return '入力内容に誤りがあります'
    case ErrorCodes.INVALID_INPUT:
      return '無効な入力値です'
    case ErrorCodes.DATABASE_ERROR:
      return 'データベースエラーが発生しました。しばらくしてから再度お試しください'
    case ErrorCodes.NETWORK_ERROR:
      return 'ネットワークエラーが発生しました。接続を確認してください'
    default:
      return 'エラーが発生しました。しばらくしてから再度お試しください'
  }
}

// Log error safely (without sensitive data)
export const logError = (error: AppError): void => {
  if (process.env.NODE_ENV === 'production') {
    // In production, send to monitoring service
    console.error({
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      // Omit sensitive context data
    })
  } else {
    // In development, log full error
    console.error('AppError:', error)
  }
}