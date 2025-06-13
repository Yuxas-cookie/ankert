'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DebugResponsesPage() {
  const params = useParams()
  const surveyId = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [responses, setResponses] = useState<any[]>([])
  
  useEffect(() => {
    debugResponses()
  }, [surveyId])

  const debugResponses = async () => {
    const supabase = createClient()
    const info: any = {
      surveyId,
      timestamp: new Date().toISOString(),
      steps: []
    }

    try {
      // Step 1: Check auth
      info.steps.push({ step: 'Checking auth...', timestamp: new Date().toISOString() })
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        info.authError = authError.message
        info.steps.push({ step: 'Auth error', error: authError.message })
      } else {
        info.user = user ? { id: user.id, email: user.email } : null
        info.steps.push({ step: 'Auth success', user: info.user })
      }

      // Step 2: Check survey ownership
      info.steps.push({ step: 'Checking survey ownership...', timestamp: new Date().toISOString() })
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('id, title, user_id, status')
        .eq('id', surveyId)
        .single()

      if (surveyError) {
        info.surveyError = surveyError.message
        info.steps.push({ step: 'Survey fetch error', error: surveyError.message })
      } else {
        info.survey = survey
        info.isOwner = survey?.user_id === user?.id
        info.steps.push({ 
          step: 'Survey found', 
          survey: survey,
          isOwner: info.isOwner 
        })
      }

      // Step 3: Fetch responses using API
      info.steps.push({ step: 'Fetching responses via API...', timestamp: new Date().toISOString() })
      const apiResponse = await fetch(`/api/surveys/${surveyId}/responses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      info.apiStatus = apiResponse.status
      info.apiStatusText = apiResponse.statusText
      
      const apiData = await apiResponse.json()
      info.apiResponse = apiData
      
      if (apiResponse.ok && apiData.responses) {
        setResponses(apiData.responses)
        info.steps.push({ 
          step: 'API fetch success', 
          responseCount: apiData.responses.length 
        })
      } else {
        info.steps.push({ 
          step: 'API fetch failed', 
          status: apiResponse.status,
          error: apiData.error 
        })
      }

      // Step 4: Try direct Supabase query
      info.steps.push({ step: 'Trying direct Supabase query...', timestamp: new Date().toISOString() })
      const { data: directResponses, error: directError } = await supabase
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

      if (directError) {
        info.directError = directError.message
        info.steps.push({ 
          step: 'Direct query error', 
          error: directError.message,
          code: directError.code,
          details: directError.details
        })
      } else {
        info.directResponseCount = directResponses?.length || 0
        info.steps.push({ 
          step: 'Direct query result', 
          count: info.directResponseCount 
        })
      }

    } catch (err) {
      info.error = err instanceof Error ? err.message : 'Unknown error'
      info.steps.push({ step: 'Unexpected error', error: info.error })
    } finally {
      setDebugInfo(info)
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/surveys" className="text-blue-600 hover:text-blue-800">
            ← アンケート一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold mt-4">Response Debug Page</h1>
          <p className="text-gray-600">Survey ID: {surveyId}</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">Loading debug information...</div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Debug Info */}
            <Card>
              <CardHeader>
                <CardTitle>Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Responses Display */}
            {responses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responses ({responses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {responses.map((response, index) => (
                      <div key={response.id} className="border p-4 rounded">
                        <div className="text-sm">
                          <strong>Response {index + 1}:</strong> {response.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          Completed: {response.completed_at ? new Date(response.completed_at).toLocaleString() : 'Not completed'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Answers: {response.answers?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={debugResponses} variant="outline">
                  Refresh Debug Info
                </Button>
                <div className="text-sm text-gray-600 mt-4">
                  <p>To test properly:</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>Make sure you are logged in as the survey owner</li>
                    <li>Check the console for any errors</li>
                    <li>Try the regular responses page: <Link href={`/surveys/${surveyId}/responses`} className="text-blue-600 hover:text-blue-800">View Responses</Link></li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}