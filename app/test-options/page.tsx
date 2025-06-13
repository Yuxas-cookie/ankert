'use client'

import React, { useEffect, useState } from 'react'
import { SingleChoiceQuestion } from '@/components/survey/questions/SingleChoiceQuestion'
import { MultipleChoiceQuestion } from '@/components/survey/questions/MultipleChoiceQuestion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestOptionsPage() {
  const [singleValue, setSingleValue] = useState<string>('')
  const [multipleValue, setMultipleValue] = useState<string[]>([])

  const testQuestion = {
    id: 'test-question-1',
    survey_id: 'test-survey',
    question_type: 'single_choice',
    question_text: 'テスト質問: 好きな色は？',
    is_required: true,
    order_index: 0,
    options: [
      { id: 'opt-1', question_id: 'test-question-1', option_text: '赤', order_index: 0 },
      { id: 'opt-2', question_id: 'test-question-1', option_text: '青', order_index: 1 },
      { id: 'opt-3', question_id: 'test-question-1', option_text: '緑', order_index: 2 },
    ]
  }

  const multipleTestQuestion = {
    ...testQuestion,
    id: 'test-question-2',
    question_type: 'multiple_choice',
    question_text: 'テスト質問: 好きなフルーツは？（複数選択可）',
    options: [
      { id: 'opt-4', question_id: 'test-question-2', option_text: 'りんご', order_index: 0 },
      { id: 'opt-5', question_id: 'test-question-2', option_text: 'バナナ', order_index: 1 },
      { id: 'opt-6', question_id: 'test-question-2', option_text: 'オレンジ', order_index: 2 },
    ]
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">選択肢コンポーネントテスト</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>単一選択（ラジオボタン）</CardTitle>
          </CardHeader>
          <CardContent>
            <SingleChoiceQuestion
              question={testQuestion}
              value={singleValue}
              onChange={(value) => {
                console.log('Single choice selected:', value)
                setSingleValue(value)
              }}
            />
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="text-sm font-medium">選択された値:</p>
              <pre className="text-xs">{JSON.stringify(singleValue, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>複数選択（チェックボックス）</CardTitle>
          </CardHeader>
          <CardContent>
            <MultipleChoiceQuestion
              question={multipleTestQuestion}
              value={multipleValue}
              onChange={(value) => {
                console.log('Multiple choice selected:', value)
                setMultipleValue(value)
              }}
            />
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="text-sm font-medium">選択された値:</p>
              <pre className="text-xs">{JSON.stringify(multipleValue, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>APIレスポンスのシミュレーション</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">実際のAPIレスポンスで確認:</p>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/surveys/test-survey-id/public')
                  const data = await response.json()
                  console.log('API Response:', data)
                  alert('コンソールでAPIレスポンスを確認してください')
                } catch (error) {
                  console.error('API Error:', error)
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              APIをテスト
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}