import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: responseId } = await params
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get the response with survey info to verify ownership
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select(`
        *,
        survey:surveys!inner (
          id,
          title,
          description,
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
        ),
        answers (
          question_id,
          answer_text,
          answer_value
        )
      `)
      .eq('id', responseId)
      .single()

    if (responseError || !response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    // Verify the user owns the survey
    if (response.survey.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Sort questions by order
    response.survey.questions.sort((a: any, b: any) => a.order_index - b.order_index)
    response.survey.questions.forEach((question: any) => {
      if (question.question_options) {
        question.question_options.sort((a: any, b: any) => a.order_index - b.order_index)
      }
    })

    // Transform response to include response_data
    const transformedResponse = {
      ...response,
      submitted_at: response.completed_at || response.started_at,
      response_data: response.answers?.reduce((acc: Record<string, any>, answer: any) => {
        if (answer.answer_value) {
          try {
            acc[answer.question_id] = JSON.parse(answer.answer_value)
          } catch {
            acc[answer.question_id] = answer.answer_value
          }
        } else {
          acc[answer.question_id] = answer.answer_text
        }
        return acc
      }, {}) || {}
    }

    return NextResponse.json({ response: transformedResponse })

  } catch (error) {
    console.error('Error fetching response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}