'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { toast } from 'sonner'

export default function SurveyDebugPage() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Get all surveys for current user
      const { data: userSurveys, error: userError } = await supabase
        .from('surveys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('User surveys:', { userSurveys, userError })

      // Get all surveys (will fail if RLS is working)
      const { data: allSurveys, error: allError } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('All surveys:', { allSurveys, allError })

      setSurveys(userSurveys || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const testSurveyAccess = async (surveyId: string) => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .eq('user_id', user?.id)
        .single()

      if (error) {
        toast.error(`Cannot access survey: ${error.message}`)
      } else {
        toast.success('Survey access successful!')
      }
      
      console.log('Survey access test:', { surveyId, data, error })
    } catch (error) {
      console.error('Test error:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8">
        <CosmicCard variant="glass" className="p-8">
          <h1 className="text-2xl font-bold mb-4">Not logged in</h1>
          <p>Please log in to debug surveys</p>
        </CosmicCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <CosmicCard variant="nebula" className="p-8">
          <h1 className="text-2xl font-bold mb-4">Survey Debug Information</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Current User</h2>
              <div className="bg-background/50 p-4 rounded-lg font-mono text-sm">
                <div>Email: {user.email}</div>
                <div>User ID: {user.id}</div>
                <div>Created: {new Date(user.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Your Surveys ({surveys.length})</h2>
              {loading ? (
                <p>Loading...</p>
              ) : surveys.length === 0 ? (
                <p className="text-muted-foreground">No surveys found</p>
              ) : (
                <div className="space-y-2">
                  {surveys.map(survey => (
                    <div key={survey.id} className="bg-background/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold">{survey.title}</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            ID: {survey.id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Status: {survey.status} | Created: {new Date(survey.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <CosmicButton
                            size="sm"
                            variant="glass"
                            onClick={() => testSurveyAccess(survey.id)}
                          >
                            Test Access
                          </CosmicButton>
                          <CosmicButton
                            size="sm"
                            variant="nebula"
                            onClick={() => window.location.href = `/surveys/${survey.id}/edit`}
                          >
                            Try Edit
                          </CosmicButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <CosmicButton onClick={loadData} variant="cosmic">
                Reload Data
              </CosmicButton>
            </div>
          </div>
        </CosmicCard>

        <CosmicCard variant="glass" className="p-6">
          <h2 className="text-lg font-semibold mb-2">Debug Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check if your User ID matches the surveys user_id</li>
            <li>Click "Test Access" to verify RLS policies</li>
            <li>Click "Try Edit" to test the edit page</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </CosmicCard>
      </div>
    </div>
  )
}