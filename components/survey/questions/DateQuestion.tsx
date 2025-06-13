'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Question, QuestionOption } from '@/types/survey'
import { cn } from '@/lib/utils'

interface DateQuestionProps {
  question: Question & {
    options: QuestionOption[]
  }
  value?: Date
  onChange?: (value: Date | undefined) => void
  disabled?: boolean
  error?: string
  className?: string
}

export function DateQuestion({
  question,
  value,
  onChange,
  disabled = false,
  error,
  className
}: DateQuestionProps) {
  const settings = question.settings as any
  const dateSettings = settings?.date || {}
  
  const mode = dateSettings.mode || 'date'
  const placeholder = dateSettings.placeholder

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label className="text-lg font-medium">
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {dateSettings.minDate && (
          <p className="text-sm text-gray-600">
            {dateSettings.minDate}以降の日付を選択してください
          </p>
        )}
        
        {dateSettings.maxDate && (
          <p className="text-sm text-gray-600">
            {dateSettings.maxDate}以前の日付を選択してください
          </p>
        )}
      </div>

      <DateTimePicker
        value={value}
        onChange={onChange}
        mode={mode}
        placeholder={placeholder}
        disabled={disabled}
        className="max-w-sm"
      />

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}

// Preview version for question builder
export function DateQuestionPreview({
  question,
  className
}: {
  question: Question & {
    options: QuestionOption[]
  }
  className?: string
}) {
  return (
    <DateQuestion
      question={question}
      disabled={true}
      className={cn('opacity-75', className)}
    />
  )
}