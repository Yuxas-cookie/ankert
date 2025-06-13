'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { Question, QuestionOption } from '@/types/survey'
import { cn } from '@/lib/utils'

interface FileQuestionProps {
  question: Question & { options: QuestionOption[] }
  value?: File[]
  onChange?: (value: File[]) => void
  disabled?: boolean
  error?: string
  className?: string
}

export function FileQuestion({
  question,
  value = [],
  onChange,
  disabled = false,
  error,
  className
}: FileQuestionProps) {
  const settings = question.settings as any
  const fileSettings = settings?.file || {}
  
  const maxSize = fileSettings.maxSize || 10 * 1024 * 1024 // 10MB
  const allowedTypes = fileSettings.allowedTypes || []
  const maxFiles = fileSettings.maxFiles || 1
  const description = fileSettings.description

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label className="text-lg font-medium">
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>

      <FileUpload
        onChange={onChange}
        accept={allowedTypes}
        maxSize={maxSize}
        maxFiles={maxFiles}
        disabled={disabled}
        value={value as any}
      />

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {value.length > 0 && (
        <div className="text-sm text-green-600">
          {value.length}個のファイルが選択されています
        </div>
      )}
    </div>
  )
}

// Preview version for question builder
export function FileQuestionPreview({
  question,
  className
}: {
  question: Question & { options: QuestionOption[] }
  className?: string
}) {
  return (
    <FileQuestion
      question={question}
      disabled={true}
      className={cn('opacity-75', className)}
    />
  )
}