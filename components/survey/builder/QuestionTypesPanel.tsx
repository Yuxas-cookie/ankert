'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Type, 
  ListChecks, 
  CheckSquare, 
  Star, 
  Calendar,
  FileText,
  Upload,
  Grid3X3,
  ToggleLeft
} from 'lucide-react'

export type QuestionType = 
  | 'text'
  | 'textarea' 
  | 'single-choice'
  | 'multiple-choice'
  | 'rating'
  | 'date'
  | 'time'
  | 'file-upload'
  | 'matrix'
  | 'yes-no'

interface QuestionTypeDefinition {
  id: QuestionType
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'basic' | 'advanced'
}

const questionTypes: QuestionTypeDefinition[] = [
  {
    id: 'text',
    name: 'テキスト入力',
    description: '短いテキストの入力',
    icon: Type,
    category: 'basic'
  },
  {
    id: 'textarea',
    name: '長文入力',
    description: '複数行のテキスト入力',
    icon: FileText,
    category: 'basic'
  },
  {
    id: 'single-choice',
    name: '単一選択',
    description: 'ラジオボタンで一つを選択',
    icon: ListChecks,
    category: 'basic'
  },
  {
    id: 'multiple-choice',
    name: '複数選択',
    description: 'チェックボックスで複数選択',
    icon: CheckSquare,
    category: 'basic'
  },
  {
    id: 'rating',
    name: '評価スケール',
    description: '星や数値での評価',
    icon: Star,
    category: 'basic'
  },
  {
    id: 'yes-no',
    name: 'はい/いいえ',
    description: '二択の質問',
    icon: ToggleLeft,
    category: 'basic'
  },
  {
    id: 'date',
    name: '日付選択',
    description: '日付ピッカー',
    icon: Calendar,
    category: 'advanced'
  },
  {
    id: 'file-upload',
    name: 'ファイルアップロード',
    description: 'ファイルの添付',
    icon: Upload,
    category: 'advanced'
  },
  {
    id: 'matrix',
    name: 'マトリックス',
    description: '表形式の質問',
    icon: Grid3X3,
    category: 'advanced'
  }
]

interface DraggableQuestionTypeProps {
  questionType: QuestionTypeDefinition
}

const DraggableQuestionType: React.FC<DraggableQuestionTypeProps> = ({ questionType }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `question-type-${questionType.id}`,
    data: { questionType }
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <questionType.icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">{questionType.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            {questionType.description}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}

interface QuestionTypesPanelProps {
  className?: string
}

export const QuestionTypesPanel: React.FC<QuestionTypesPanelProps> = ({ className }) => {
  const basicTypes = questionTypes.filter(type => type.category === 'basic')
  const advancedTypes = questionTypes.filter(type => type.category === 'advanced')

  return (
    <div className={cn('w-80 border-r border-border bg-muted/30 p-4', className)}>
      <div className="space-y-6">
        <div>
          <h2 className="font-semibold text-lg mb-4">質問タイプ</h2>
          <p className="text-sm text-muted-foreground mb-4">
            ドラッグして質問を追加
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-3">基本</h3>
            <div className="grid gap-3">
              {basicTypes.map((questionType) => (
                <DraggableQuestionType
                  key={questionType.id}
                  questionType={questionType}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">高度</h3>
            <div className="grid gap-3">
              {advancedTypes.map((questionType) => (
                <DraggableQuestionType
                  key={questionType.id}
                  questionType={questionType}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}