'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  GripVertical, 
  Copy, 
  Trash2, 
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import { QuestionType } from './QuestionTypesPanel'

export interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  visible: boolean
  orderIndex: number
  settings?: Record<string, any>
}

interface QuestionCardProps {
  question: Question
  isSelected?: boolean
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleVisibility?: (id: string) => void
}

const getQuestionTypeLabel = (type: QuestionType): string => {
  const labels: Record<QuestionType, string> = {
    'text': 'テキスト',
    'textarea': '長文',
    'single-choice': '単一選択',
    'multiple-choice': '複数選択',
    'rating': '評価',
    'date': '日付',
    'time': '時刻',
    'file-upload': 'ファイル',
    'matrix': 'マトリックス',
    'yes-no': 'はい/いいえ'
  }
  return labels[type]
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleVisibility
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: question.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as Element).closest('.card-content')) {
      onSelect?.(question.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isDragging && 'opacity-50',
        !question.visible && 'opacity-60'
      )}
    >
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200',
          'hover:shadow-md hover:border-primary/50',
          isSelected && 'ring-2 ring-primary border-primary',
          !question.visible && 'bg-muted/50'
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Drag Handle */}
              <button
                className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>

              {/* Question Content */}
              <div className="flex-1 min-w-0 card-content">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getQuestionTypeLabel(question.type)}
                  </Badge>
                  {question.required && (
                    <Badge variant="destructive" className="text-xs">
                      必須
                    </Badge>
                  )}
                  {!question.visible && (
                    <Badge variant="secondary" className="text-xs">
                      非表示
                    </Badge>
                  )}
                </div>

                <h3 className="font-medium text-sm leading-snug mb-1 truncate">
                  {question.title || '無題の質問'}
                </h3>
                
                {question.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {question.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility?.(question.id)
                }}
              >
                {question.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(question.id)
                }}
              >
                <Settings className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate?.(question.id)
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(question.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}