'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { MatrixQuestion as MatrixQuestionComponent } from '@/components/ui/matrix-question'
import { Question, QuestionOption } from '@/types/survey'
import { cn } from '@/lib/utils'

interface MatrixQuestionProps {
  question: Question & { options?: QuestionOption[] }
  value?: Record<string, string | string[]>
  onChange?: (value: Record<string, string | string[]>) => void
  disabled?: boolean
  error?: string
  className?: string
}

export function MatrixQuestion({
  question,
  value = {},
  onChange,
  disabled = false,
  error,
  className
}: MatrixQuestionProps) {
  const settings = question.settings as any
  const matrixSettings = settings?.matrix || {}
  
  const rows = matrixSettings.rows || []
  const columns = matrixSettings.columns || []
  const type = matrixSettings.type || 'single'

  if (rows.length === 0 || columns.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <Label className="text-lg font-medium">
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="text-gray-500 text-sm italic">
          マトリックスの行と列が設定されていません
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label className="text-lg font-medium">
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <p className="text-sm text-gray-600">
          {type === 'single' 
            ? '各行で1つずつ選択してください' 
            : '各行で複数選択可能です'
          }
        </p>
      </div>

      <MatrixQuestionComponent
        rows={rows}
        columns={columns}
        values={value}
        onChange={onChange}
        type={type}
        disabled={disabled}
      />

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}

// Preview version for question builder
export function MatrixQuestionPreview({
  question,
  className
}: {
  question: Question & { options?: QuestionOption[] }
  className?: string
}) {
  return (
    <MatrixQuestion
      question={question}
      disabled={true}
      className={cn('opacity-75', className)}
    />
  )
}