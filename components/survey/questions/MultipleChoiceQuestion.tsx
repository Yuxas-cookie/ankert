'use client'

import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Question, QuestionOption } from '@/types/survey'

interface MultipleChoiceQuestionProps {
  question: Question & { options?: QuestionOption[] }
  value?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
}

interface MultipleChoiceQuestionPreviewProps {
  question: Question & { options?: QuestionOption[] }
}

export function MultipleChoiceQuestion({
  question,
  value = [],
  onChange,
  disabled = false
}: MultipleChoiceQuestionProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    console.log('[MultipleChoiceQuestion] Change:', { 
      optionValue, 
      optionType: typeof optionValue,
      checked, 
      currentValue: value,
      currentValueTypes: value.map(v => typeof v)
    })
    if (!onChange) return
    
    if (checked) {
      onChange([...value, optionValue])
    } else {
      onChange(value.filter(v => v !== optionValue))
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </h3>
      
      {(question as any).description && (
        <p className="text-sm text-gray-600">{(question as any).description}</p>
      )}

      <div className="space-y-3">
        {question.options && question.options.length > 0 ? (
          question.options.map((option) => {
            const optionValue = String(option.id)
            const isChecked = value.includes(optionValue)
            console.log('[MultipleChoiceQuestion] Rendering option:', {
              optionId: option.id,
              optionValue,
              currentValues: value,
              isChecked
            })
            
            return (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${option.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => 
                    handleChange(optionValue, checked as boolean)
                  }
                  disabled={disabled}
                />
                <Label 
                  htmlFor={`option-${option.id}`}
                  className="text-sm font-normal cursor-pointer"
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
      </div>
    </div>
  )
}

export function MultipleChoiceQuestionPreview({ question }: MultipleChoiceQuestionPreviewProps) {
  return (
    <div className="space-y-4 opacity-75">
      <h3 className="text-lg font-medium">
        {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </h3>
      
      {(question as any).description && (
        <p className="text-sm text-gray-600">{(question as any).description}</p>
      )}

      <div className="space-y-3">
        {question.options?.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={`preview-option-${option.id}`}
              disabled
              className="border-gray-300"
            />
            <Label 
              htmlFor={`preview-option-${option.id}`}
              className="text-sm font-normal text-gray-500"
            >
              {option.option_text}
            </Label>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-500 italic">
        複数選択質問（プレビューのみ）
      </div>
    </div>
  )
}