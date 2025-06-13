'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SurveyPreview } from '@/components/survey/preview/SurveyPreview'
import { surveyService } from '@/lib/supabase/surveys'
import { SurveyWithQuestions } from '@/types/survey'
import { ArrowLeft, Eye, TestTube } from 'lucide-react'

export default function SurveyPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [mode, setMode] = useState<'preview' | 'test'>('preview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock user ID - in real app, get from auth
  const userId = 'mock-user-id'

  useEffect(() => {
    if (surveyId) {
      loadSurvey()
    }
  }, [surveyId])

  const loadSurvey = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await surveyService.getSurveyById(surveyId, userId)
      
      if (error) throw error
      
      setSurvey(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestSubmit = (responses: Record<string, any>) => {
    console.log('Test responses submitted:', responses)
    alert(`テスト回答が完了しました！\n\n回答された質問数: ${Object.keys(responses).length}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold text-red-600">エラーが発生しました</div>
          <div className="text-gray-600">{error || 'アンケートが見つかりません'}</div>
          <Link href="/surveys">
            <Button>アンケート一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/surveys/${surveyId}/edit`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  編集に戻る
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">プレビュー: {survey.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setMode('preview')}
                variant={mode === 'preview' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                プレビュー
              </Button>
              <Button
                onClick={() => setMode('test')}
                variant={mode === 'test' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <TestTube className="h-4 w-4" />
                テスト回答
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <SurveyPreview
          survey={survey}
          mode={mode}
          onTestSubmit={handleTestSubmit}
        />
      </div>
    </div>
  )
}