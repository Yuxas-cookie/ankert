'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { responseService } from '@/lib/supabase/responses'
import { surveyService } from '@/lib/supabase/surveys'
import { SurveyWithQuestions } from '@/types/survey'
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview'
import { AdvancedInsights } from '@/components/analytics/AdvancedInsights'
import { ExportDialog } from '@/components/export/ExportDialog'
import { AnalyticsData } from '@/types/charts'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  FileText
} from 'lucide-react'
import { ResponseDetailDialog } from '@/components/survey/ResponseDetailDialog'
import { analyzeResponses } from '@/lib/analytics/response-analyzer'
import { AnalyticsFilters, AnalyticsFilter } from '@/components/analytics/AnalyticsFilters'

export default function SurveyResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  const { user, loading: authLoading } = useAuth()

  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'responses' | 'analytics' | 'advanced'>('responses')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<any>(null)
  const [showResponseDetail, setShowResponseDetail] = useState(false)
  const [responseDetailLoading, setResponseDetailLoading] = useState(false)
  const [analyticsFilter, setAnalyticsFilter] = useState<AnalyticsFilter>({
    dateRange: {
      start: null,
      end: null,
      preset: 'month'
    },
    questionTypes: [],
    responseStatus: 'all',
    deviceTypes: ['mobile', 'desktop', 'tablet']
  })
  const [filteredResponses, setFilteredResponses] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (surveyId && user) {
      loadData()
    }
  }, [surveyId, user, authLoading, router])

  // Apply filters to responses
  useEffect(() => {
    if (!responses || responses.length === 0) {
      setFilteredResponses([])
      return
    }

    let filtered = [...responses]

    // Filter by date range
    if (analyticsFilter.dateRange.start || analyticsFilter.dateRange.end) {
      filtered = filtered.filter(response => {
        const responseDate = new Date(response.created_at || response.started_at)
        if (analyticsFilter.dateRange.start && responseDate < analyticsFilter.dateRange.start) {
          return false
        }
        if (analyticsFilter.dateRange.end && responseDate > analyticsFilter.dateRange.end) {
          return false
        }
        return true
      })
    }

    // Filter by response status
    if (analyticsFilter.responseStatus !== 'all') {
      filtered = filtered.filter(response => {
        const isCompleted = response.status === 'completed' || response.submitted_at || response.completed_at
        return analyticsFilter.responseStatus === 'completed' ? isCompleted : !isCompleted
      })
    }

    // Filter by device type
    if (analyticsFilter.deviceTypes.length < 3) {
      filtered = filtered.filter(response => {
        const userAgent = response.user_agent?.toLowerCase() || ''
        let deviceType = 'unknown'
        
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
          deviceType = 'mobile'
        } else if (userAgent.includes('ipad') || userAgent.includes('tablet')) {
          deviceType = 'tablet'
        } else if (userAgent.includes('windows') || userAgent.includes('mac') || userAgent.includes('linux')) {
          deviceType = 'desktop'
        }
        
        return analyticsFilter.deviceTypes.includes(deviceType)
      })
    }

    setFilteredResponses(filtered)
  }, [responses, analyticsFilter])

  const loadData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Load survey details
      const { data: surveyData, error: surveyError } = await surveyService.getSurveyById(surveyId, user.id)
      if (surveyError) throw surveyError
      setSurvey(surveyData)

      // Load responses
      const { data: responsesData, error: responsesError } = await responseService.getResponsesBySurvey(surveyId, user.id)
      if (responsesError) throw responsesError
      setResponses(responsesData || [])

      // Load stats
      const { data: statsData, error: statsError } = await responseService.getResponseStats(surveyId, user.id)
      if (statsError) throw statsError
      setStats(statsData)

    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getResponsePreview = (responseData: Record<string, any>) => {
    const values = Object.values(responseData)
    const preview = values.slice(0, 2).map(value => {
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      if (typeof value === 'string' && value.length > 30) {
        return value.substring(0, 30) + '...'
      }
      return String(value)
    }).join(' | ')
    
    return preview || '(空の回答)'
  }

  const handleViewResponse = async (responseId: string) => {
    if (!user) return
    
    try {
      setResponseDetailLoading(true)
      setShowResponseDetail(true)
      
      const { data, error } = await responseService.getResponseById(responseId, user.id)
      
      if (error) {
        console.error('Error loading response:', error)
        setSelectedResponse(null)
      } else {
        setSelectedResponse(data)
      }
    } catch (err) {
      console.error('Error loading response:', err)
      setSelectedResponse(null)
    } finally {
      setResponseDetailLoading(false)
    }
  }

  // Calculate analytics data from filtered responses
  const analyticsData = useMemo<AnalyticsData>(() => {
    const dataToAnalyze = activeTab === 'responses' ? responses : filteredResponses
    
    if (!survey || !dataToAnalyze || dataToAnalyze.length === 0) {
      return {
        totalResponses: 0,
        completionRate: 0,
        avgCompletionTime: 0,
        responseVelocity: 0,
        questionMetrics: [],
        trends: [],
        demographics: {}
      }
    }

    // 実データから分析結果を取得
    const analysis = analyzeResponses(survey, dataToAnalyze)

    // trendsデータをAnalyticsDataの形式に変換
    const trends = analysis.trendsData.map(trend => ({
      timestamp: trend.date,
      value: trend.count,
      label: trend.label
    }))

    // demographicsデータを形式変換
    const demographics = {
      device: {
        mobile: analysis.deviceDistribution.mobile,
        desktop: analysis.deviceDistribution.desktop,
        tablet: analysis.deviceDistribution.tablet
      }
    }

    return {
      totalResponses: analysis.totalResponses,
      completionRate: analysis.completionRate,
      avgCompletionTime: Math.round(analysis.avgCompletionTime),
      responseVelocity: Math.round(analysis.responseVelocity * 10) / 10,
      questionMetrics: analysis.questionMetrics,
      trends,
      demographics
    }
  }, [survey, responses, filteredResponses, activeTab])

  // Extract text responses for advanced analysis
  const textResponses = useMemo(() => {
    const dataToAnalyze = activeTab === 'advanced' ? filteredResponses : responses
    
    if (!survey || !dataToAnalyze || dataToAnalyze.length === 0) return []

    return survey.questions
      .filter(q => ['text', 'textarea'].includes(q.question_type))
      .map(question => {
        const questionResponses = dataToAnalyze
          .map(r => r.response_data?.[question.id])
          .filter(answer => answer && typeof answer === 'string' && answer.trim() !== '')
        
        return {
          questionId: question.id,
          responses: questionResponses
        }
      })
      .filter(q => q.responses.length > 0)
  }, [survey, responses, filteredResponses, activeTab])

  const exportResponses = () => {
    if (!survey || responses.length === 0) return

    // Create CSV content
    const headers = ['回答ID', '送信日時', ...survey.questions.map(q => q.question_text)]
    const csvContent = [
      headers.join(','),
      ...responses.map(response => [
        response.id,
        formatDate(response.submitted_at || response.completed_at || response.started_at),
        ...survey.questions.map(question => {
          const answer = response.response_data[question.id]
          if (Array.isArray(answer)) {
            return `"${answer.join(', ')}"`
          }
          return `"${String(answer || '')}"`
        })
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${survey.title}_responses.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading || authLoading) {
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
        <div className="text-center text-red-600 dark:text-red-400">
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/surveys/${surveyId}`} className="text-muted-foreground hover:text-foreground mb-2 inline-block">
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              アンケート詳細に戻る
            </Link>
            <h1 className="text-2xl font-bold">回答一覧</h1>
            <p className="text-muted-foreground">{survey.title}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowExportDialog(true)}
              disabled={responses.length === 0}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              レポート生成
            </Button>
            <Button
              onClick={exportResponses}
              disabled={responses.length === 0}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSVエクスポート
            </Button>
          </div>
        </div>

        {/* Analytics Filters */}
        <AnalyticsFilters 
          onFilterChange={setAnalyticsFilter}
          onExport={exportResponses}
          questionTypes={survey.questions.map(q => q.question_type).filter((v, i, a) => a.indexOf(v) === i)}
          loading={isLoading}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-2xl font-bold">{activeTab === 'responses' ? (stats?.totalResponses || 0) : filteredResponses.length}</p>
                  <p className="text-sm text-muted-foreground">総回答数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-2xl font-bold">{stats?.recentResponses || 0}</p>
                  <p className="text-sm text-muted-foreground">30日間の回答</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm font-medium">
                    {stats?.latestResponseAt ? formatDate(stats.latestResponseAt) : '回答なし'}
                  </p>
                  <p className="text-sm text-muted-foreground">最新回答日時</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-2xl font-bold">{survey.questions.length}</p>
                  <p className="text-sm text-muted-foreground">質問数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'responses' | 'analytics' | 'advanced')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              回答一覧
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              基本分析
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              高度な分析
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>回答データ</CardTitle>
                  <Badge variant="outline">
                    {responses.length}件の回答
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">まだ回答がありません</p>
                <p className="text-sm">アンケートが公開されると、回答がここに表示されます。</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>送信日時</TableHead>
                      <TableHead>回答プレビュー</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell className="font-mono text-sm">
                          {response.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {formatDate(response.submitted_at || response.completed_at || response.started_at)}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <span className="text-sm text-muted-foreground">
                            {getResponsePreview(response.response_data)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleViewResponse(response.id)}
                          >
                            <Eye className="h-4 w-4" />
                            詳細
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsOverview 
              data={analyticsData} 
              surveyId={surveyId}
              loading={isLoading}
            />
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <AdvancedInsights 
              data={analyticsData}
              textResponses={textResponses}
            />
          </TabsContent>
        </Tabs>

        {/* Export Dialog */}
        {showExportDialog && survey && (
          <ExportDialog
            open={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            analyticsData={analyticsData}
            surveyInfo={{
              id: survey.id,
              title: survey.title,
              description: survey.description || '',
              createdAt: new Date(survey.created_at),
              totalQuestions: survey.questions.length
            }}
            responses={responses}
          />
        )}
        
        {/* Response Detail Dialog */}
        <ResponseDetailDialog
          open={showResponseDetail}
          onClose={() => {
            setShowResponseDetail(false)
            setSelectedResponse(null)
          }}
          response={selectedResponse}
          loading={responseDetailLoading}
        />
      </div>
    </div>
  )
}