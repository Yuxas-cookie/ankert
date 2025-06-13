'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { QuestionCard, Question } from './QuestionCard'
import { Plus, FileQuestion } from 'lucide-react'

interface SurveyCanvasProps {
  questions: Question[]
  selectedQuestionId?: string
  onSelectQuestion?: (id: string) => void
  onEditQuestion?: (id: string) => void
  onDuplicateQuestion?: (id: string) => void
  onDeleteQuestion?: (id: string) => void
  onToggleQuestionVisibility?: (id: string) => void
  className?: string
}

const EmptyState: React.FC = () => (
  <Card className="border-dashed border-2 border-muted-foreground/25">
    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg mb-2">アンケートを作成しましょう</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        左側から質問タイプをドラッグ&ドロップして、アンケートを作成してください。
      </p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Plus className="h-4 w-4" />
        質問を追加するにはドラッグ&ドロップ
      </div>
    </CardContent>
  </Card>
)

const DropZone: React.FC<{
  isOver: boolean
  children?: React.ReactNode
}> = ({ isOver, children }) => (
  <div
    className={cn(
      'min-h-[200px] transition-all duration-200',
      isOver && 'bg-primary/5 border-primary/30 border-dashed border-2 rounded-lg'
    )}
  >
    {children}
  </div>
)

export const SurveyCanvas: React.FC<SurveyCanvasProps> = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onEditQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onToggleQuestionVisibility,
  className
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'survey-canvas'
  })

  const sortedQuestions = [...questions].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div className={cn('flex-1 p-6', className)}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">アンケート作成</h2>
          <p className="text-muted-foreground">
            質問を追加・編集してアンケートを作成してください
          </p>
        </div>

        <div ref={setNodeRef}>
          <DropZone isOver={isOver}>
            {sortedQuestions.length === 0 ? (
              <EmptyState />
            ) : (
              <SortableContext 
                items={sortedQuestions.map(q => q.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sortedQuestions.map((question, index) => (
                    <div key={question.id} className="relative">
                      {/* Question Number */}
                      <div className="absolute -left-8 top-4 w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {index + 1}
                      </div>

                      <QuestionCard
                        question={question}
                        isSelected={selectedQuestionId === question.id}
                        onSelect={onSelectQuestion}
                        onEdit={onEditQuestion}
                        onDuplicate={onDuplicateQuestion}
                        onDelete={onDeleteQuestion}
                        onToggleVisibility={onToggleQuestionVisibility}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            )}
          </DropZone>
        </div>

        {/* Add Question Hint */}
        {sortedQuestions.length > 0 && (
          <div 
            className={cn(
              'mt-8 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center text-sm text-muted-foreground transition-all',
              isOver && 'border-primary/50 bg-primary/5'
            )}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            ここに新しい質問をドロップ
          </div>
        )}
      </div>
    </div>
  )
}