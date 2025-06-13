'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Question, QuestionOption } from '@/types/survey'
import { cn } from '@/lib/utils'

interface TextQuestionProps {
  question: Question & { options: QuestionOption[] }
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  error?: string
  className?: string
}

export function TextQuestion({
  question,
  value = '',
  onChange,
  disabled = false,
  error,
  className
}: TextQuestionProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  // Get settings for text validation
  const settings = question.settings as any
  const maxLength = settings?.maxLength
  const minLength = settings?.minLength
  const placeholder = settings?.placeholder || '回答を入力してください'

  const isTextarea = question.question_type === 'textarea'
  const currentLength = value.length

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label htmlFor={`question-${question.id}`} className="text-lg font-medium">
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {(maxLength || minLength) && (
          <p className="text-sm text-gray-600">
            {minLength && maxLength 
              ? `${minLength}〜${maxLength}文字で入力してください`
              : maxLength 
                ? `最大${maxLength}文字まで`
                : minLength
                  ? `最低${minLength}文字以上`
                  : ''
            }
          </p>
        )}
      </div>

      <div className="space-y-2">
        {isTextarea ? (
          <Textarea
            id={`question-${question.id}`}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={4}
            className={cn(
              'resize-none',
              error && 'border-red-500'
            )}
          />
        ) : (
          <Input
            id={`question-${question.id}`}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {maxLength && (
          <div className="flex justify-end">
            <span className={cn(
              'text-xs',
              currentLength > maxLength ? 'text-red-500' : 'text-gray-500'
            )}>
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Validation hints */}
      {minLength && currentLength > 0 && currentLength < minLength && (
        <p className="text-yellow-600 text-sm">
          あと{minLength - currentLength}文字以上入力してください
        </p>
      )}
    </div>
  )
}

// Preview version for question builder
export function TextQuestionPreview({
  question,
  className
}: {
  question: Question & { options: QuestionOption[] }
  className?: string
}) {
  return (
    <TextQuestion
      question={question}
      value=""
      disabled={true}
      className={cn('opacity-75', className)}
    />
  )
}