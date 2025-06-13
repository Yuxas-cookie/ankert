import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SurveyAccess {
  access_type: 'public' | 'url_only' | 'password' | 'authenticated' | 'email_restricted'
  password?: string
  allowed_emails?: string[]
  start_date?: string
  end_date?: string
  max_responses?: number
  require_login?: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: surveyId } = await params
    const { searchParams } = new URL(request.url)
    
    // Get password and email from query params for validation
    const providedPassword = searchParams.get('password')
    const userEmail = searchParams.get('email')

    // Get survey with access settings
    // In development, allow draft surveys; in production, only published
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    let query = supabase
      .from('surveys')
      .select(`
        id,
        title,
        description,
        status,
        access_type,
        access_password,
        allowed_emails,
        max_responses,
        start_date,
        end_date,
        response_count,
        user_id,
        questions (
          id,
          question_type,
          question_text,
          is_required,
          order_index,
          settings,
          question_options (
            id,
            option_text,
            order_index
          )
        )
      `)
      .eq('id', surveyId)

    // Only filter by published status in production
    if (!isDevelopment) {
      query = query.eq('status', 'published')
    }

    const { data: survey, error } = await query.single()

    if (error || !survey) {
      const errorMessage = isDevelopment 
        ? `Survey not found. Error: ${error?.message || 'No survey with ID ' + surveyId}`
        : 'Survey not found or not available'
      
      return NextResponse.json(
        { 
          error: errorMessage,
          ...(isDevelopment && { details: error })
        },
        { status: 404 }
      )
    }

    const accessSettings: SurveyAccess = {
      access_type: survey.access_type || 'public',
      password: survey.access_password,
      allowed_emails: survey.allowed_emails,
      start_date: survey.start_date,
      end_date: survey.end_date,
      max_responses: survey.max_responses
    }

    // In development mode, allow access to draft surveys without restrictions
    if (isDevelopment && survey.status === 'draft') {
      // Skip most access restrictions for draft surveys in development
      survey.questions.sort((a, b) => a.order_index - b.order_index)
      survey.questions.forEach(question => {
        if (question.question_options) {
          question.question_options.sort((a, b) => a.order_index - b.order_index)
        }
      })

      const { access_type, access_password, allowed_emails, max_responses, start_date, end_date, user_id, response_count, ...publicSurvey } = survey

      return NextResponse.json({ 
        survey: publicSurvey,
        access_info: {
          type: 'public',
          requires_password: false,
          requires_email: false,
          requires_auth: false,
          max_responses: null,
          responses_remaining: null
        },
        development_mode: true
      })
    }

    // Check time-based restrictions
    if (accessSettings.start_date) {
      const startDate = new Date(accessSettings.start_date)
      if (new Date() < startDate) {
        return NextResponse.json(
          { 
            error: 'Survey not yet available',
            message: `このアンケートは${startDate.toLocaleDateString('ja-JP')}から開始されます。`,
            start_date: accessSettings.start_date
          },
          { status: 403 }
        )
      }
    }

    if (accessSettings.end_date) {
      const endDate = new Date(accessSettings.end_date)
      if (new Date() > endDate) {
        return NextResponse.json(
          { 
            error: 'Survey has ended',
            message: `このアンケートは${endDate.toLocaleDateString('ja-JP')}に終了しました。`,
            end_date: accessSettings.end_date
          },
          { status: 403 }
        )
      }
    }

    // Check maximum responses limit
    if (accessSettings.max_responses && survey.response_count >= accessSettings.max_responses) {
      return NextResponse.json(
        { 
          error: 'Survey response limit reached',
          message: '回答の上限に達したため、このアンケートは受け付けを終了しました。'
        },
        { status: 403 }
      )
    }

    // Check access type restrictions
    switch (accessSettings.access_type) {
      case 'password':
        if (!providedPassword || providedPassword !== accessSettings.password) {
          return NextResponse.json(
            { 
              error: 'Password required',
              message: 'このアンケートにアクセスするにはパスワードが必要です。',
              requires_password: true
            },
            { status: 401 }
          )
        }
        break

      case 'email_restricted':
        if (!userEmail) {
          return NextResponse.json(
            { 
              error: 'Email required',
              message: 'このアンケートにアクセスするにはメールアドレスの確認が必要です。',
              requires_email: true
            },
            { status: 401 }
          )
        }
        
        if (accessSettings.allowed_emails && !accessSettings.allowed_emails.includes(userEmail)) {
          return NextResponse.json(
            { 
              error: 'Email not authorized',
              message: 'このメールアドレスではアンケートにアクセスできません。'
            },
            { status: 403 }
          )
        }
        break

      case 'authenticated':
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return NextResponse.json(
            { 
              error: 'Authentication required',
              message: 'このアンケートにアクセスするにはログインが必要です。',
              requires_auth: true
            },
            { status: 401 }
          )
        }
        break

      case 'url_only':
      case 'public':
        // No additional restrictions
        break

      default:
        return NextResponse.json(
          { error: 'Invalid access configuration' },
          { status: 500 }
        )
    }

    // Sort questions and options by order
    survey.questions.sort((a, b) => a.order_index - b.order_index)
    survey.questions.forEach(question => {
      if (question.question_options) {
        question.question_options.sort((a, b) => a.order_index - b.order_index)
      }
    })

    // Remove sensitive data before returning
    const { access_type, access_password, allowed_emails, max_responses, start_date, end_date, user_id, response_count, ...publicSurvey } = survey

    return NextResponse.json({ 
      survey: publicSurvey,
      access_info: {
        type: accessSettings.access_type,
        requires_password: accessSettings.access_type === 'password',
        requires_email: accessSettings.access_type === 'email_restricted',
        requires_auth: accessSettings.access_type === 'authenticated',
        max_responses: accessSettings.max_responses,
        responses_remaining: accessSettings.max_responses ? Math.max(0, accessSettings.max_responses - response_count) : null
      }
    })

  } catch (error) {
    console.error('Error fetching public survey:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}