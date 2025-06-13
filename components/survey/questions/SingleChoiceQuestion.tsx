'use client'

import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Question, QuestionOption } from '@/types/survey'
import { cn } from '@/lib/utils'

interface SingleChoiceQuestionProps {
  question: Question & { options?: QuestionOption[] }
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  error?: string
  className?: string
}

export function SingleChoiceQuestion({
  question,
  value,
  onChange,
  disabled = false,
  error,
  className
}: SingleChoiceQuestionProps) {
  const handleValueChange = (selectedValue: string) => {
    console.log('[SingleChoiceQuestion] Value changed:', {
      selectedValue,
      selectedType: typeof selectedValue,
      currentValue: value,
      currentType: typeof value,
      options: question.options?.map(o => ({ id: o.id, idType: typeof o.id, text: o.option_text }))
    })
    onChange?.(selectedValue)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </h3>
      </div>

      <RadioGroup
        value={value || ''}
        onValueChange={handleValueChange}
        disabled={disabled}
        className="space-y-3"
      >
        {question.options && question.options.length > 0 ? (
          question.options.map((option) => {
            const optionValue = String(option.id)
            const isSelected = value === optionValue
            console.log('[SingleChoiceQuestion] Rendering option:', {
              optionId: option.id,
              optionValue,
              currentValue: value,
              isSelected
            })
            
            return (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={optionValue} 
                  id={`option-${option.id}`}
                  className={error ? 'border-red-500' : ''}
                />
                <Label 
                  htmlFor={`option-${option.id}`}
                  className={cn(
                    'text-sm font-normal cursor-pointer',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {option.option_text}
                </Label>
              </div>
            )
          })
        ) : (
          <div className="text-gray-500 text-sm italic">
            選択肢が設定されていません
          </div>
        )}
      </RadioGroup>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}

// Preview version for question builder
export function SingleChoiceQuestionPreview({
  question,
  className
}: {
  question: Question & { options?: QuestionOption[] }
  className?: string
}) {
  return (
    <SingleChoiceQuestion
      question={question}
      disabled={true}
      className={cn('opacity-75', className)}
    />
  )
}