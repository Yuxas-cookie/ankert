'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/file-upload'
import { SurveyWithQuestions } from '@/types/survey'
import { SingleChoiceQuestion } from '../questions/SingleChoiceQuestion'
import { MultipleChoiceQuestion } from '../questions/MultipleChoiceQuestion'
import { TextQuestion } from '../questions/TextQuestion'
import { RatingQuestion } from '../questions/RatingQuestion'
import { MatrixQuestion } from '../questions/MatrixQuestion'
import { DateQuestion } from '../questions/DateQuestion'
import { FileQuestion } from '../questions/FileQuestion'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, RotateCcw, Send, Smartphone, Tablet, Monitor } from 'lucide-react'

interface SurveyPreviewProps {
  survey: SurveyWithQuestions
  mode?: 'preview' | 'test'
  onTestSubmit?: (responses: Record<string, any>) => void
  className?: string
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function SurveyPreview({
  survey,
  mode = 'preview',
  onTestSubmit,
  className
}: SurveyPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  // For now, treat all questions as one page
  const totalPages = 1
  const currentQuestions = survey.questions
  const progress = ((currentPage + 1) / totalPages) * 100

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // Clear error when user provides input
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateCurrentPage = () => {
    const newErrors: Record<string, string> = {}
    
    currentQuestions.forEach(question => {
      if (question.is_required && !responses[question.id]) {
        newErrors[question.id] = 'この質問は必須です'
      }
      
      // Additional validation based on question type
      const value = responses[question.id]
      if (value) {
        switch (question.question_type) {
          case 'multiple_choice':
            if (Array.isArray(value) && value.length === 0) {
              newErrors[question.id] = '最低1つは選択してください'
            }
            break
          case 'text':
          case 'textarea':
            const settings = question.settings as any
            if (settings?.minLength && value.length < settings.minLength) {
              newErrors[question.id] = `最低${settings.minLength}文字以上入力してください`
            }
            if (settings?.maxLength && value.length > settings.maxLength) {
              newErrors[question.id] = `最大${settings.maxLength}文字以内で入力してください`
            }
            break
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentPage()) {
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleSubmit = () => {
    if (validateCurrentPage()) {
      onTestSubmit?.(responses)
      alert(`テスト回答が送信されました！\n\n回答数: ${Object.keys(responses).length}`)
    }
  }

  const handleReset = () => {
    setCurrentPage(0)
    setResponses({})
    setErrors({})
  }

  const renderQuestion = (question: any) => {
    const commonProps = {
      question,
      value: responses[question.id],
      onChange: (value: any) => handleResponseChange(question.id, value),
      disabled: mode === 'preview',
      error: errors[question.id]
    }

    switch (question.question_type) {
      case 'single_choice':
        return <SingleChoiceQuestion {...commonProps} />
      case 'multiple_choice':
        return <MultipleChoiceQuestion {...commonProps} />
      case 'text':
      case 'textarea':
        return <TextQuestion {...commonProps} />
      case 'rating':
        return <RatingQuestion {...commonProps} />
      case 'matrix':
        return <MatrixQuestion {...commonProps} />
      case 'date':
        return <DateQuestion {...commonProps} />
      case 'file':
        return <FileQuestion {...commonProps} />
      default:
        return (
          <div className="text-gray-500 italic">
            未対応の質問タイプ: {question.question_type}
          </div>
        )
    }
  }

  const getDeviceStyles = () => {
    switch (deviceType) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      case 'desktop':
        return 'max-w-4xl mx-auto'
      default:
        return 'max-w-4xl mx-auto'
    }
  }

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      case 'desktop':
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={mode === 'test' ? 'default' : 'secondary'}>
            {mode === 'test' ? 'テストモード' : 'プレビューモード'}
          </Badge>
          {mode === 'test' && (
            <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              リセット
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map((type) => (
            <Button
              key={type}
              onClick={() => setDeviceType(type)}
              variant={deviceType === type ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              {getDeviceIcon(type)}
              {type === 'mobile' ? 'モバイル' : type === 'tablet' ? 'タブレット' : 'デスクトップ'}
            </Button>
          ))}
        </div>
      </div>

      {/* Preview Container */}
      <div className={getDeviceStyles()}>
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div>
                <CardTitle className="text-2xl">{survey.title}</CardTitle>
                {survey.description && (
                  <p className="text-gray-600 mt-2">{survey.description}</p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>進捗</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-8">
              {currentQuestions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-1">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {renderQuestion(question)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            {mode === 'test' && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button
                  onClick={handlePrevious}
                  disabled={currentPage === 0}
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  前へ
                </Button>

                <span className="text-sm text-gray-600">
                  {currentPage + 1} / {totalPages}
                </span>

                <Button
                  onClick={handleNext}
                  className="gap-2"
                >
                  {currentPage === totalPages - 1 ? (
                    <>
                      <Send className="h-4 w-4" />
                      送信
                    </>
                  ) : (
                    <>
                      次へ
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug Info for test mode */}
      {mode === 'test' && Object.keys(responses).length > 0 && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-sm">デバッグ情報</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify(responses, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}