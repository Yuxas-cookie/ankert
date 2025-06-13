'use client'

import React from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { QuestionEditor } from './QuestionEditor'
import { QuestionFormData } from '@/lib/validations/survey'

interface QuestionListProps {
  questions: (QuestionFormData & { id: string })[]
  onQuestionsChange: (questions: (QuestionFormData & { id: string })[]) => void
  className?: string
}

export function QuestionList({ questions, onQuestionsChange, className }: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = React.useCallback((event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      onQuestionsChange(prev => {
        const oldIndex = prev.findIndex(q => q.id === active.id)
        const newIndex = prev.findIndex(q => q.id === over.id)
        
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }, [onQuestionsChange])

  const addQuestion = React.useCallback((type: string = 'single_choice') => {
    const newQuestion: QuestionFormData & { id: string } = {
      id: `question-${Date.now()}`,
      type: type as any,
      text: '',
      required: false,
      options: type === 'single_choice' || type === 'multiple_choice' ? ['', ''] : [],
      settings: type === 'rating' ? { ratingScale: { min: 1, max: 5, labels: ['', ''] } } as any :
                type === 'matrix' ? { matrix: { rows: [''], columns: [''] } } as any :
                type === 'date' ? { date: { mode: 'date' } } as any :
                type === 'file' ? { file: { maxSize: 10485760, maxFiles: 1, allowedTypes: [] } } as any :
                {} as any
    }

    onQuestionsChange(prev => [...prev, newQuestion])
  }, [onQuestionsChange])

  const updateQuestion = React.useCallback((index: number, data: QuestionFormData) => {
    onQuestionsChange(prev => {
      const newQuestions = [...prev]
      newQuestions[index] = { ...newQuestions[index], ...data }
      return newQuestions
    })
  }, [onQuestionsChange])

  const deleteQuestion = React.useCallback((index: number) => {
    onQuestionsChange(prev => prev.filter((_, i) => i !== index))
  }, [onQuestionsChange])

  const duplicateQuestion = React.useCallback((index: number) => {
    onQuestionsChange(prev => {
      const questionToDuplicate = prev[index]
      const duplicatedQuestion: QuestionFormData & { id: string } = {
        ...questionToDuplicate,
        id: `question-${Date.now()}`,
        text: `${questionToDuplicate.text} (コピー)`
      }

      const newQuestions = [...prev]
      newQuestions.splice(index + 1, 0, duplicatedQuestion)
      return newQuestions
    })
  }, [onQuestionsChange])

  return (
    <div className={className}>
      <CosmicCard variant="nebula" className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">質問</h2>
            <div className="flex flex-wrap gap-2">
              <CosmicButton onClick={() => addQuestion('single_choice')} variant="glass" size="sm">
                単一選択
              </CosmicButton>
              <CosmicButton onClick={() => addQuestion('multiple_choice')} variant="glass" size="sm">
                複数選択
              </CosmicButton>
              <CosmicButton onClick={() => addQuestion('text')} variant="glass" size="sm">
                短文回答
              </CosmicButton>
              <CosmicButton onClick={() => addQuestion('textarea')} variant="glass" size="sm">
                長文回答
              </CosmicButton>
              <CosmicButton onClick={() => addQuestion('rating')} variant="glass" size="sm">
                評価スケール
              </CosmicButton>
              <CosmicButton onClick={() => addQuestion('matrix')} variant="glass" size="sm">
                マトリックス
              </CosmicButton>
              <CosmicButton onClick={() => addQuestion('date')} variant="glass" size="sm">
                日付選択
              </CosmicButton>
              <CosmicButton onClick={() => addQuestion('file')} variant="glass" size="sm">
                ファイル
              </CosmicButton>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border/30 rounded-2xl bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[var(--cosmic-nebula)]/20 to-[var(--cosmic-star)]/20 rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">まだ質問が追加されていません</p>
                <CosmicButton onClick={() => addQuestion()} variant="nebula" icon={<Plus className="h-4 w-4" />}>
                  最初の質問を追加
                </CosmicButton>
              </div>
            </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={(data) => updateQuestion(index, data)}
                    onDelete={() => deleteQuestion(index)}
                    onDuplicate={() => duplicateQuestion(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          )}

          {questions.length > 0 && (
            <div className="flex justify-center pt-4">
              <CosmicButton onClick={() => addQuestion()} variant="glass" icon={<Plus className="h-4 w-4" />}>
                質問を追加
              </CosmicButton>
            </div>
          )}
        </div>
      </CosmicCard>
    </div>
  )
}