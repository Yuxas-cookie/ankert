'use client'

import React, { useState } from 'react'
import { ResponseDetailDialog } from '@/components/survey/ResponseDetailDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Mock response data for testing
const mockResponse = {
  id: 'test-response-123',
  survey_id: 'test-survey-456',
  submitted_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  started_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
  time_spent: 300, // 5 minutes
  user_id: null,
  ip_address: '192.168.1.100',
  user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  survey: {
    title: 'Customer Satisfaction Survey',
    questions: [
      {
        id: 'q1',
        question_type: 'text',
        question_text: 'What is your name?',
        is_required: true,
        order_index: 0
      },
      {
        id: 'q2',
        question_type: 'single_choice',
        question_text: 'How satisfied are you with our service?',
        is_required: true,
        order_index: 1,
        question_options: [
          { id: 'opt1', option_text: 'Very Satisfied' },
          { id: 'opt2', option_text: 'Satisfied' },
          { id: 'opt3', option_text: 'Neutral' },
          { id: 'opt4', option_text: 'Dissatisfied' },
          { id: 'opt5', option_text: 'Very Dissatisfied' }
        ]
      },
      {
        id: 'q3',
        question_type: 'multiple_choice',
        question_text: 'Which features do you use? (Select all that apply)',
        is_required: false,
        order_index: 2,
        question_options: [
          { id: 'feat1', option_text: 'Survey Creation' },
          { id: 'feat2', option_text: 'Response Analytics' },
          { id: 'feat3', option_text: 'Team Collaboration' },
          { id: 'feat4', option_text: 'Export Features' }
        ]
      },
      {
        id: 'q4',
        question_type: 'rating',
        question_text: 'Rate your overall experience',
        is_required: true,
        order_index: 3,
        settings: { minValue: 1, maxValue: 5 }
      },
      {
        id: 'q5',
        question_type: 'textarea',
        question_text: 'Any additional comments?',
        is_required: false,
        order_index: 4
      },
      {
        id: 'q6',
        question_type: 'date',
        question_text: 'When did you start using our service?',
        is_required: false,
        order_index: 5
      }
    ]
  },
  response_data: {
    'q1': 'John Doe',
    'q2': 'Very Satisfied',
    'q3': ['Survey Creation', 'Response Analytics'],
    'q4': 5,
    'q5': 'Great service! The survey builder is intuitive and the analytics are very helpful. Would love to see more chart types.',
    'q6': '2025-01-15'
  }
}

const mockResponsePartial = {
  ...mockResponse,
  id: 'test-response-456',
  response_data: {
    'q1': 'Jane Smith',
    'q2': 'Satisfied',
    'q4': 4,
    // q3, q5, q6 are missing (unanswered)
  }
}

export default function TestResponseDetailPage() {
  const [showDialog1, setShowDialog1] = useState(false)
  const [showDialog2, setShowDialog2] = useState(false)
  const [showDialogLoading, setShowDialogLoading] = useState(false)
  const [showDialogError, setShowDialogError] = useState(false)
  const [loadingState, setLoadingState] = useState(false)

  const handleShowLoading = () => {
    setShowDialogLoading(true)
    setLoadingState(true)
    // Simulate loading for 2 seconds
    setTimeout(() => {
      setLoadingState(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Response Detail Dialog Test Page</h1>
          <p className="text-muted-foreground mt-2">
            This page allows you to test the ResponseDetailDialog component with various states
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Test Case 1: Complete Response */}
          <Card>
            <CardHeader>
              <CardTitle>Test Case 1: Complete Response</CardTitle>
              <CardDescription>
                All questions answered, anonymous user, mobile device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowDialog1(true)}>
                Open Dialog
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>• All questions have answers</p>
                <p>• Shows mobile device detection</p>
                <p>• Anonymous user indicator</p>
              </div>
            </CardContent>
          </Card>

          {/* Test Case 2: Partial Response */}
          <Card>
            <CardHeader>
              <CardTitle>Test Case 2: Partial Response</CardTitle>
              <CardDescription>
                Some questions unanswered, tests "回答なし" display
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowDialog2(true)}>
                Open Dialog
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>• Optional questions skipped</p>
                <p>• Shows empty answer handling</p>
                <p>• Different response patterns</p>
              </div>
            </CardContent>
          </Card>

          {/* Test Case 3: Loading State */}
          <Card>
            <CardHeader>
              <CardTitle>Test Case 3: Loading State</CardTitle>
              <CardDescription>
                Shows loading spinner for 2 seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleShowLoading}>
                Open Dialog (Loading)
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>• Loading indicator</p>
                <p>• Simulates API delay</p>
                <p>• Then shows full response</p>
              </div>
            </CardContent>
          </Card>

          {/* Test Case 4: Error State */}
          <Card>
            <CardHeader>
              <CardTitle>Test Case 4: Error State</CardTitle>
              <CardDescription>
                Shows error message when response fails to load
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowDialogError(true)}>
                Open Dialog (Error)
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>• Error message display</p>
                <p>• No response data</p>
                <p>• Graceful error handling</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dialog Features to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Close button functionality</li>
              <li>✓ ESC key to close</li>
              <li>✓ Click outside to close</li>
              <li>✓ Scroll behavior for long content</li>
              <li>✓ Responsive design on different screen sizes</li>
              <li>✓ Theme compatibility (light/dark mode)</li>
              <li>✓ Answer formatting for each question type</li>
              <li>✓ Metadata display (date, device, IP)</li>
              <li>✓ Question badges (required, type)</li>
              <li>✓ Visual indicators (checkmarks, icons)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <ResponseDetailDialog
          open={showDialog1}
          onClose={() => setShowDialog1(false)}
          response={mockResponse}
          loading={false}
        />

        <ResponseDetailDialog
          open={showDialog2}
          onClose={() => setShowDialog2(false)}
          response={mockResponsePartial}
          loading={false}
        />

        <ResponseDetailDialog
          open={showDialogLoading}
          onClose={() => setShowDialogLoading(false)}
          response={loadingState ? null : mockResponse}
          loading={loadingState}
        />

        <ResponseDetailDialog
          open={showDialogError}
          onClose={() => setShowDialogError(false)}
          response={null}
          loading={false}
        />
      </div>
    </div>
  )
}