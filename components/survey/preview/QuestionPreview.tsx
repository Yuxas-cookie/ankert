'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Question, QuestionOption } from '@/types/survey'

type QuestionWithOptions = Question & {
  options: QuestionOption[]
}
import { SingleChoiceQuestionPreview } from '../questions/SingleChoiceQuestion'
import { MultipleChoiceQuestionPreview } from '../questions/MultipleChoiceQuestion'
import { TextQuestionPreview } from '../questions/TextQuestion'
import { RatingQuestionPreview } from '../questions/RatingQuestion'
import { MatrixQuestionPreview } from '../questions/MatrixQuestion'
import { DateQuestionPreview } from '../questions/DateQuestion'
import { FileQuestionPreview } from '../questions/FileQuestion'
import { cn } from '@/lib/utils'

interface QuestionPreviewProps {
  question: QuestionWithOptions
  index: number
  className?: string
}

export function QuestionPreview({ question, index, className }: QuestionPreviewProps) {
  const renderQuestionComponent = () => {
    switch (question.question_type) {
      case 'single_choice':
        return <SingleChoiceQuestionPreview question={question} />
      case 'multiple_choice':
        return <MultipleChoiceQuestionPreview question={question} />
      case 'text':
      case 'textarea':
        return <TextQuestionPreview question={question} />
      case 'rating':
        return <RatingQuestionPreview question={question} />
      case 'matrix':
        return <MatrixQuestionPreview question={question} />
      case 'date':
        return <DateQuestionPreview question={question} />
      case 'file':
        return <FileQuestionPreview question={question} />
      default:
        return (
          <div className="text-gray-500 italic">
            未対応の質問タイプ: {question.question_type}
          </div>
        )
    }
  }

  const getQuestionTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      single_choice: '単一選択',
      multiple_choice: '複数選択',
      text: '短文回答',
      textarea: '長文回答',
      rating: '評価スケール',
      matrix: 'マトリックス',
      date: '日付選択',
      file: 'ファイル'
    }

    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[type] || type}
      </Badge>
    )
  }

  return (
    <Card className={cn('transition-all duration-200', className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
              {getQuestionTypeBadge(question.question_type)}
              {question.is_required && (
                <Badge variant="destructive" className="text-xs">
                  必須
                </Badge>
              )}
            </div>
          </div>

          {renderQuestionComponent()}
        </div>
      </CardContent>
    </Card>
  )
}