import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ResponseSubmission } from '@/types/survey'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: surveyId } = await params
    const body = await request.json()
    
    // Debug: Check current auth context
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user context:', user ? `Authenticated user: ${user.id}` : 'Anonymous user')
    
    // Validate request body
    if (!body.responses || typeof body.responses !== 'object') {
      return NextResponse.json(
        { error: 'Invalid response data' },
        { status: 400 }
      )
    }

    // Get survey to validate structure
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select(`
        *,
        questions (
          id,
          question_type,
          is_required,
          settings,
          question_options (option_text)
        )
      `)
      .eq('id', surveyId)
      .single()

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Check if survey is published
    if (survey.status !== 'published') {
      return NextResponse.json(
        { error: 'Survey is not available for responses' },
        { status: 400 }
      )
    }

    // Validate responses against survey questions
    const validationErrors: Record<string, string> = {}
    
    for (const question of survey.questions) {
      const response = body.responses[question.id]
      
      // Check required fields
      if (question.is_required && (!response || response === '')) {
        validationErrors[question.id] = 'This field is required'
        continue
      }
      
      // Skip validation if no response provided for optional field
      if (!response && response !== 0 && response !== false) {
        continue
      }
      
      // Validate response based on question type
      switch (question.question_type) {
        case 'single_choice':
          if (typeof response !== 'string') {
            validationErrors[question.id] = 'Invalid response format'
          }
          break
          
        case 'multiple_choice':
          if (!Array.isArray(response)) {
            validationErrors[question.id] = 'Invalid response format'
          }
          break
          
        case 'text':
        case 'textarea':
          if (typeof response !== 'string') {
            validationErrors[question.id] = 'Invalid response format'
          } else {
            const settings = question.settings as any
            if (settings?.minLength && response.length < settings.minLength) {
              validationErrors[question.id] = `Minimum ${settings.minLength} characters required`
            }
            if (settings?.maxLength && response.length > settings.maxLength) {
              validationErrors[question.id] = `Maximum ${settings.maxLength} characters allowed`
            }
          }
          break
          
        case 'rating':
          const ratingValue = Number(response)
          if (isNaN(ratingValue)) {
            validationErrors[question.id] = 'Invalid rating value'
          } else {
            const settings = question.settings as any
            const min = settings?.minValue || 1
            const max = settings?.maxValue || 5
            if (ratingValue < min || ratingValue > max) {
              validationErrors[question.id] = `Rating must be between ${min} and ${max}`
            }
          }
          break
          
        case 'date':
          if (typeof response !== 'string' || isNaN(Date.parse(response))) {
            validationErrors[question.id] = 'Invalid date format'
          }
          break
          
        case 'matrix':
          if (typeof response !== 'object' || Array.isArray(response)) {
            validationErrors[question.id] = 'Invalid matrix response format'
          }
          break
      }
    }

    // Return validation errors if any
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors },
        { status: 400 }
      )
    }

    // Create response record
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    
    const responseData: any = {
      survey_id: surveyId,
      user_id: null,
      is_test_response: false,
      is_complete: true,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      ip_address: ipAddress && ipAddress !== 'unknown' ? ipAddress.split(',')[0].trim() : null,
      user_agent: request.headers.get('user-agent') || null,
      time_spent: body.timeSpent || null
    }

    // Use service client for anonymous submissions to bypass RLS
    const serviceClient = user ? null : createServiceClient()
    const client = serviceClient || supabase
    
    const { data: savedResponse, error: saveError } = await client
      .from('responses')
      .insert(responseData)
      .select()
      .single()

    if (saveError) {
      console.error('Error saving response:', saveError)
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      )
    }

    // Save individual answers
    const answerData = Object.entries(body.responses).map(([questionId, value]) => ({
      response_id: savedResponse.id,
      question_id: questionId,
      answer_text: typeof value === 'string' ? value : null,
      answer_value: typeof value !== 'string' ? JSON.stringify(value) : null
    }))

    if (answerData.length > 0) {
      const { error: answersError } = await client
        .from('answers')
        .insert(answerData)

      if (answersError) {
        console.error('Error saving answers:', answersError)
        // Don't fail the request if answers fail to save
      }
    }

    return NextResponse.json({
      message: 'Response submitted successfully',
      responseId: savedResponse.id
    })

  } catch (error) {
    console.error('Error processing response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: surveyId } = await params
    
    // Get current user (for admin access)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the survey
    const { data: survey } = await supabase
      .from('surveys')
      .select('user_id')
      .eq('id', surveyId)
      .single()

    if (!survey || survey.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get responses with their answers for the survey
    const { data: responses, error } = await supabase
      .from('responses')
      .select(`
        *,
        answers (
          question_id,
          answer_text,
          answer_value
        )
      `)
      .eq('survey_id', surveyId)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching responses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      )
    }

    return NextResponse.json({ responses })

  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}