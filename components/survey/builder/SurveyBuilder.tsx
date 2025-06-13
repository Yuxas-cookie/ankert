'use client'

import React, { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'
import { QuestionTypesPanel, QuestionType } from './QuestionTypesPanel'
import { SurveyCanvas } from './SurveyCanvas'
import { Question } from './QuestionCard'
import { PreviewModal } from '../preview/PreviewModal'
import { QuestionEditorDialog } from '../editor/QuestionEditorDialog'
import { Save, Eye, Settings, Undo, Redo, AlertTriangle } from 'lucide-react'

interface SurveyBuilderProps {
  initialQuestions?: Question[]
  onSave?: (questions: Question[]) => void
  onPreview?: () => void
  className?: string
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  initialQuestions = [],
  onSave,
  onPreview,
  className
}) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>()
  const [activeTab, setActiveTab] = useState<'build' | 'preview'>('build')
  const [history, setHistory] = useState<Question[][]>([initialQuestions])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showQuestionEditor, setShowQuestionEditor] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // History management
  const addToHistory = useCallback((newQuestions: Question[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newQuestions])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setQuestions([...history[historyIndex - 1]])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setQuestions([...history[historyIndex + 1]])
    }
  }, [history, historyIndex])

  // Question operations
  const createQuestion = useCallback((type: QuestionType): Question => {
    return {
      id: generateId(),
      type,
      title: `新しい${type === 'text' ? 'テキスト' : type === 'single-choice' ? '単一選択' : type}質問`,
      required: false,
      visible: true,
      orderIndex: questions.length,
      settings: {}
    }
  }, [questions.length])

  const addQuestion = useCallback((type: QuestionType, index?: number) => {
    const newQuestion = createQuestion(type)
    let newQuestions: Question[]

    if (index !== undefined) {
      newQuestions = [
        ...questions.slice(0, index),
        newQuestion,
        ...questions.slice(index)
      ]
      // Update order indices
      newQuestions = newQuestions.map((q, i) => ({ ...q, orderIndex: i }))
    } else {
      newQuestions = [...questions, newQuestion]
    }

    setQuestions(newQuestions)
    addToHistory(newQuestions)
    setSelectedQuestionId(newQuestion.id)
  }, [questions, createQuestion, addToHistory])

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    const newQuestions = questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    )
    setQuestions(newQuestions)
    addToHistory(newQuestions)
  }, [questions, addToHistory])

  const duplicateQuestion = useCallback((id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id)
    if (!questionToDuplicate) return

    const newQuestion: Question = {
      ...questionToDuplicate,
      id: generateId(),
      title: `${questionToDuplicate.title} (コピー)`,
      orderIndex: questionToDuplicate.orderIndex + 1
    }

    const newQuestions = [
      ...questions.slice(0, questionToDuplicate.orderIndex + 1),
      newQuestion,
      ...questions.slice(questionToDuplicate.orderIndex + 1)
    ].map((q, i) => ({ ...q, orderIndex: i }))

    setQuestions(newQuestions)
    addToHistory(newQuestions)
    setSelectedQuestionId(newQuestion.id)
  }, [questions, addToHistory])

  const deleteQuestion = useCallback((id: string) => {
    const newQuestions = questions
      .filter(q => q.id !== id)
      .map((q, i) => ({ ...q, orderIndex: i }))
    
    setQuestions(newQuestions)
    addToHistory(newQuestions)
    
    if (selectedQuestionId === id) {
      setSelectedQuestionId(undefined)
    }
  }, [questions, selectedQuestionId, addToHistory])

  const toggleQuestionVisibility = useCallback((id: string) => {
    updateQuestion(id, { 
      visible: !questions.find(q => q.id === id)?.visible 
    })
  }, [questions, updateQuestion])

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    // Handle drag start if needed
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over if needed
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    // Adding new question from types panel
    if (active.id.toString().startsWith('question-type-')) {
      const questionTypeData = active.data.current?.questionType
      if (questionTypeData && over.id === 'survey-canvas') {
        addQuestion(questionTypeData.id)
      }
      return
    }

    // Reordering existing questions
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id)
      const newIndex = questions.findIndex(q => q.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = arrayMove(questions, oldIndex, newIndex)
          .map((q, i) => ({ ...q, orderIndex: i }))
        
        setQuestions(newQuestions)
        addToHistory(newQuestions)
      }
    }
  }

  const handleSave = () => {
    onSave?.(questions)
  }

  const handleEditQuestion = (id: string) => {
    const question = questions.find(q => q.id === id)
    if (question) {
      setEditingQuestion(question)
      setShowQuestionEditor(true)
    }
  }

  const handleSaveQuestion = (updatedQuestion: Question) => {
    updateQuestion(updatedQuestion.id, updatedQuestion)
    setShowQuestionEditor(false)
    setEditingQuestion(undefined)
  }

  const handleCloseEditor = () => {
    setShowQuestionEditor(false)
    setEditingQuestion(undefined)
  }

  const handlePreview = () => {
    onPreview?.()
    setShowPreviewModal(true)
  }

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Toolbar */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">アンケート作成</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="h-4 w-4 mr-1" />
                戻る
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4 mr-1" />
                進む
              </Button>

              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-1" />
                プレビュー
              </Button>

              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToWindowEdges]}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Question Types Panel */}
          <QuestionTypesPanel />

          {/* Canvas */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
            <div className="border-b px-6 pt-4">
              <TabsList>
                <TabsTrigger value="build">編集</TabsTrigger>
                <TabsTrigger value="preview">プレビュー</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="build" className="flex-1 mt-0">
              <SurveyCanvas
                questions={questions}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={setSelectedQuestionId}
                onEditQuestion={handleEditQuestion}
                onDuplicateQuestion={duplicateQuestion}
                onDeleteQuestion={deleteQuestion}
                onToggleQuestionVisibility={toggleQuestionVisibility}
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 mt-0">
              <div className="p-6">
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-6">アンケートプレビュー</h2>
                    <div className="space-y-6">
                      {questions.filter(q => q.visible).map((question, index) => (
                        <div key={question.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                              {index + 1}
                            </span>
                            <div>
                              <h3 className="font-medium">
                                {question.title}
                                {question.required && (
                                  <span className="text-destructive ml-1">*</span>
                                )}
                              </h3>
                              {question.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {question.description}
                                </p>
                              )}
                              <div className="mt-3 text-sm text-muted-foreground">
                                [{question.type}タイプの質問]
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DndContext>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        questions={questions}
        surveyTitle="プレビューアンケート"
        surveyDescription="このアンケートのプレビューです"
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
      />

      {/* Question Editor */}
      <QuestionEditorDialog
        question={editingQuestion}
        isOpen={showQuestionEditor}
        onClose={handleCloseEditor}
        onSave={handleSaveQuestion}
      />
    </div>
  )
}