'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { RatingScale } from '@/components/ui/rating-scale'
import { Question, QuestionOption } from '@/types/survey'
import { cn } from '@/lib/utils'

interface RatingQuestionProps {
  question: Question & { options: QuestionOption[] }
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  error?: string
  className?: string
}

export function RatingQuestion({
  question,
  value,
  onChange,
  disabled = false,
  error,
  className
}: RatingQuestionProps) {
  const settings = question.settings as any
  const ratingSettings = settings?.ratingScale || {}
  
  const min = ratingSettings.min || 1
  const max = ratingSettings.max || 5
  const labels = ratingSettings.labels || []
  const type = ratingSettings.type || 'number'

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label className="text-lg font-medium">
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {labels.length > 0 && (
          <p className="text-sm text-gray-600">
            {min}:{labels[0]} 〜 {max}:{labels[1] || labels[0]}
          </p>
        )}
      </div>

      <RatingScale
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        type={type}
        labels={labels}
        disabled={disabled}
        className="justify-center"
      />

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}

// Preview version for question builder
export function RatingQuestionPreview({
  question,
  className
}: {
  question: Question & { options: QuestionOption[] }
  className?: string
}) {
  return (
    <RatingQuestion
      question={question}
      disabled={true}
      className={cn('opacity-75', className)}
    />
  )
}