'use client'

import React, { useState } from 'react'
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview'
import { ExportDialog } from '@/components/export/ExportDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsData } from '@/types/charts'
import { FileText, BarChart3 } from 'lucide-react'

export default function TestAnalyticsPage() {
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Mock analytics data
  const mockAnalyticsData: AnalyticsData = {
    totalResponses: 150,
    completionRate: 85.5,
    avgCompletionTime: 240, // 4 minutes
    responseVelocity: 25.3,
    questionMetrics: [
      {
        questionId: 'q1',
        question: 'どのようにして私たちのサービスを知りましたか？',
        responseRate: 98.5,
        avgTime: 15,
        dropOffRate: 1.5
      },
      {
        questionId: 'q2',
        question: 'サービスの満足度を教えてください',
        responseRate: 95.2,
        avgTime: 20,
        dropOffRate: 3.3
      },
      {
        questionId: 'q3',
        question: '改善してほしい点があれば教えてください',
        responseRate: 82.4,
        avgTime: 45,
        dropOffRate: 12.8
      },
      {
        questionId: 'q4',
        question: '友人に勧めたいと思いますか？',
        responseRate: 88.9,
        avgTime: 10,
        dropOffRate: 6.5
      }
    ],
    trends: Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        timestamp: date,
        value: Math.floor(Math.random() * 30) + 15,
        label: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
      }
    }),
    demographics: {
      device: {
        mobile: 90,
        desktop: 45,
        tablet: 15
      },
      location: {
        '東京': 60,
        '大阪': 30,
        '名古屋': 20,
        'その他': 40
      },
      age: {
        '18-24': 30,
        '25-34': 45,
        '35-44': 35,
        '45-54': 25,
        '55+': 15
      }
    }
  }

  // Mock survey info
  const mockSurveyInfo = {
    id: 'test-survey-123',
    title: '顧客満足度調査アンケート',
    description: 'お客様の貴重なご意見をお聞かせください',
    createdAt: new Date('2024-01-01'),
    totalQuestions: 4
  }

  // Mock responses
  const mockResponses = Array.from({ length: 50 }, (_, i) => ({
    id: `response-${i + 1}`,
    survey_id: 'test-survey-123',
    status: Math.random() > 0.15 ? 'completed' : 'in_progress',
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: Math.random() > 0.15 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
    response_data: {
      q1: ['検索エンジン', 'SNS', '友人の紹介'][Math.floor(Math.random() * 3)],
      q2: Math.floor(Math.random() * 5) + 1,
      q3: ['UIの改善', '機能の追加', '価格の見直し', '特になし'][Math.floor(Math.random() * 4)],
      q4: Math.random() > 0.3
    }
  }))

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">分析機能テストページ</h1>
            <p className="text-gray-600 mt-2">チャート表示とエクスポート機能のテスト</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowExportDialog(true)}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              レポート生成
            </Button>
          </div>
        </div>

        {/* Test Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              テストデータ情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">総回答数</p>
                <p className="text-xl font-semibold">{mockAnalyticsData.totalResponses}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">完了率</p>
                <p className="text-xl font-semibold">{mockAnalyticsData.completionRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">平均完了時間</p>
                <p className="text-xl font-semibold">{Math.floor(mockAnalyticsData.avgCompletionTime / 60)}分</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">質問数</p>
                <p className="text-xl font-semibold">{mockSurveyInfo.totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview Component */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">分析ダッシュボード</h2>
          <AnalyticsOverview 
            data={mockAnalyticsData} 
            surveyId={mockSurveyInfo.id}
            loading={false}
          />
        </div>

        {/* Export Dialog */}
        {showExportDialog && (
          <ExportDialog
            open={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            analyticsData={mockAnalyticsData}
            surveyInfo={mockSurveyInfo}
            responses={mockResponses}
          />
        )}
      </div>
    </div>
  )
}