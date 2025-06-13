'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { surveyService } from '@/lib/supabase/surveys'
import { SurveyWithQuestions } from '@/types/survey'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { Copy, ExternalLink, BarChart3 } from 'lucide-react'

export default function SurveyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const surveyId = params.id as string
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id

  useEffect(() => {
    if (!userId) {
      toast.error('ログインが必要です')
      router.push('/login')
      return
    }
    if (surveyId) {
      loadSurvey()
    }
  }, [surveyId, userId, router])

  const loadSurvey = async () => {
    if (!userId) return
    
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

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'secondary' as const, label: '下書き' },
      published: { variant: 'default' as const, label: '公開中' },
      closed: { variant: 'destructive' as const, label: '終了' },
      archived: { variant: 'outline' as const, label: 'アーカイブ' }
    }

    const statusConfig = variants[status as keyof typeof variants]
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
  }

  const copyShareUrl = () => {
    const shareUrl = `${window.location.origin}/surveys/${surveyId}/respond`
    navigator.clipboard.writeText(shareUrl)
    toast.success('共有URLをコピーしました')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">
          <div className="text-lg font-semibold">エラーが発生しました</div>
          <div className="mt-2">{error || 'アンケートが見つかりません'}</div>
          <Link href="/surveys">
            <Button className="mt-4">アンケート一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/surveys" className="text-gray-600 hover:text-gray-800 mb-2 inline-block">
              ← アンケート一覧に戻る
            </Link>
            <h1 className="text-3xl font-bold">{survey.title}</h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            {getStatusBadge(survey.status)}
            <Link href={`/surveys/${survey.id}/edit`}>
              <Button variant="outline">編集</Button>
            </Link>
            {survey.status === 'published' && (
              <>
                <Button onClick={copyShareUrl} variant="outline" className="gap-2">
                  <Copy className="h-4 w-4" />
                  共有URL
                </Button>
                <Link href={`/surveys/${survey.id}/respond`} target="_blank">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    回答画面
                  </Button>
                </Link>
                <Link href={`/surveys/${survey.id}/responses`}>
                  <Button className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    回答一覧
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Survey Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>アンケート詳細</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {survey.description && (
                  <div>
                    <h3 className="font-medium mb-2">説明</h3>
                    <p className="text-gray-600">{survey.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-2">質問数</h3>
                  <p className="text-gray-600">{survey.questions.length}問</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>統計情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">作成日:</span>
                  <span className="text-sm">{formatDate(survey.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">更新日:</span>
                  <span className="text-sm">{formatDate(survey.updated_at)}</span>
                </div>
                {survey.published_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">公開日:</span>
                    <span className="text-sm">{formatDate(survey.published_at)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">回答数:</span>
                  <span className="text-sm font-semibold">0件</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Preview */}
        <Card>
          <CardHeader>
            <CardTitle>質問一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {survey.questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">まだ質問が追加されていません</p>
                <Link href={`/surveys/${survey.id}/edit`}>
                  <Button>質問を追加する</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {survey.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Q{index + 1}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {question.question_type}
                          </Badge>
                          {question.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              必須
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium">{question.question_text}</h3>
                        {question.options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">選択肢:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                              {question.options.map((option) => (
                                <li key={option.id}>{option.option_text}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}