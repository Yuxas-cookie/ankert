'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SurveyPreview } from './SurveyPreview'
import { SurveyWithQuestions } from '@/types/survey'
import { Question } from '../builder/QuestionCard'
import { cn } from '@/lib/utils'
import { 
  Eye, 
  TestTube,
  Smartphone, 
  Tablet, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  X,
  RotateCcw 
} from 'lucide-react'

interface PreviewModalProps {
  survey?: SurveyWithQuestions
  questions?: Question[]
  surveyTitle?: string
  surveyDescription?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: 'preview' | 'test' | 'validation'
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'
type ViewMode = 'preview' | 'test' | 'validation'

interface ValidationIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  questionId?: string
  message: string
  suggestion?: string
}

export function PreviewModal({
  survey,
  questions = [],
  surveyTitle = 'アンケートタイトル',
  surveyDescription = 'アンケートの説明文です',
  open,
  onOpenChange,
  initialMode = 'preview'
}: PreviewModalProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])

  // Use either survey or questions to build the preview
  const previewQuestions = survey?.questions || questions.filter(q => q.visible).map(q => ({
    id: q.id,
    question_type: q.type,
    question_text: q.title,
    is_required: q.required,
    settings: q.settings || {},
    order_index: q.orderIndex
  }))

  const previewSurvey = survey || {
    id: 'preview',
    title: surveyTitle,
    description: surveyDescription,
    questions: previewQuestions
  }

  // Validation logic
  const validateSurvey = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = []
    const questionsToValidate = questions.length > 0 ? questions : survey?.questions || []

    // Check if survey has questions
    if (questionsToValidate.length === 0) {
      issues.push({
        id: 'no-questions',
        type: 'error',
        message: 'アンケートに質問がありません',
        suggestion: '最低1つの質問を追加してください'
      })
    }

    // Check individual questions
    questionsToValidate.forEach((question: any, index: number) => {
      const questionText = question.title || question.question_text
      const questionType = question.type || question.question_type
      const isRequired = question.required !== undefined ? question.required : question.is_required
      const visible = question.visible !== undefined ? question.visible : true

      // Empty title
      if (!questionText?.trim()) {
        issues.push({
          id: `empty-title-${question.id}`,
          type: 'error',
          questionId: question.id,
          message: `質問 ${index + 1}: タイトルが空です`,
          suggestion: '質問文を入力してください'
        })
      }

      // Choice questions without options
      if (['single-choice', 'single_choice', 'multiple-choice', 'multiple_choice'].includes(questionType)) {
        const options = question.settings?.options || []
        if (options.length < 2) {
          issues.push({
            id: `insufficient-options-${question.id}`,
            type: 'error',
            questionId: question.id,
            message: `質問 ${index + 1}: 選択肢が不足しています`,
            suggestion: '最低2つの選択肢を追加してください'
          })
        }
        
        // Empty options
        const emptyOptions = options.filter((opt: string) => !opt?.trim())
        if (emptyOptions.length > 0) {
          issues.push({
            id: `empty-options-${question.id}`,
            type: 'warning',
            questionId: question.id,
            message: `質問 ${index + 1}: 空の選択肢があります`,
            suggestion: '選択肢のテキストを入力してください'
          })
        }
      }

      // Rating scale validation
      if (questionType === 'rating') {
        const minRating = question.settings?.minRating || 1
        const maxRating = question.settings?.maxRating || 5
        
        if (minRating >= maxRating) {
          issues.push({
            id: `invalid-rating-range-${question.id}`,
            type: 'error',
            questionId: question.id,
            message: `質問 ${index + 1}: 評価範囲が無効です`,
            suggestion: '最大値は最小値より大きく設定してください'
          })
        }
      }

      // Hidden questions warning (only for questions from builder)
      if (visible === false) {
        issues.push({
          id: `hidden-question-${question.id}`,
          type: 'info',
          questionId: question.id,
          message: `質問 ${index + 1}: 非表示になっています`,
          suggestion: '質問を表示する場合は、表示設定を有効にしてください'
        })
      }
    })

    // Check for accessibility issues
    const requiredQuestions = questionsToValidate.filter((q: any) => 
      q.required !== undefined ? q.required : q.is_required
    )
    if (requiredQuestions.length === questionsToValidate.length && questionsToValidate.length > 5) {
      issues.push({
        id: 'too-many-required',
        type: 'warning',
        message: '必須質問が多すぎます',
        suggestion: '回答者の負担を考慮して、一部の質問を任意にすることを検討してください'
      })
    }

    return issues
  }

  React.useEffect(() => {
    if (viewMode === 'validation') {
      const issues = validateSurvey()
      setValidationIssues(issues)
    }
  }, [viewMode, questions, survey])

  const handleTestSubmit = (responses: Record<string, any>) => {
    console.log('Test responses:', responses)
    // Here you could send to a test endpoint or just log
  }

  const getDeviceStyles = () => {
    switch (deviceType) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      case 'desktop':
        return 'max-w-4xl mx-auto'
      default:
        return 'max-w-4xl mx-auto'
    }
  }

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      case 'desktop':
        return <Monitor className="h-4 w-4" />
    }
  }

  const getIssueIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getIssueColor = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error':
        return 'text-destructive'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
    }
  }

  const errorCount = validationIssues.filter(i => i.type === 'error').length
  const warningCount = validationIssues.filter(i => i.type === 'warning').length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">アンケートプレビュー</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {previewQuestions.length}個の質問
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <TabsList>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  プレビュー
                </TabsTrigger>
                <TabsTrigger value="test" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  テスト
                </TabsTrigger>
                <TabsTrigger value="validation" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  検証
                  {(errorCount > 0 || warningCount > 0) && (
                    <Badge variant={errorCount > 0 ? 'destructive' : 'secondary'} className="ml-1">
                      {errorCount + warningCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {(viewMode === 'preview' || viewMode === 'test') && (
              <div className="flex items-center gap-2">
                {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map((type) => (
                  <Button
                    key={type}
                    onClick={() => setDeviceType(type)}
                    variant={deviceType === type ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                  >
                    {getDeviceIcon(type)}
                    {type === 'mobile' ? 'モバイル' : type === 'tablet' ? 'タブレット' : 'デスクトップ'}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {(viewMode === 'preview' || viewMode === 'test') ? (
            <div className="h-full overflow-y-auto p-6">
              <div className={getDeviceStyles()}>
                <SurveyPreview
                  survey={previewSurvey as any}
                  mode={viewMode}
                  onTestSubmit={handleTestSubmit}
                />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Validation Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      検証結果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validationIssues.length === 0 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>問題は見つかりませんでした</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          {errorCount > 0 && (
                            <div className="flex items-center gap-1 text-destructive">
                              <AlertTriangle className="h-4 w-4" />
                              エラー: {errorCount}
                            </div>
                          )}
                          {warningCount > 0 && (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <AlertTriangle className="h-4 w-4" />
                              警告: {warningCount}
                            </div>
                          )}
                        </div>
                        
                        {errorCount > 0 && (
                          <p className="text-sm text-muted-foreground">
                            エラーを修正してからアンケートを公開してください
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Issues List */}
                {validationIssues.length > 0 && (
                  <div className="space-y-3">
                    {validationIssues.map((issue) => (
                      <Card key={issue.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {getIssueIcon(issue.type)}
                            <div className="flex-1">
                              <p className={cn('font-medium', getIssueColor(issue.type))}>
                                {issue.message}
                              </p>
                              {issue.suggestion && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  💡 {issue.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* No Issues */}
                {validationIssues.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">アンケートは公開可能です</h3>
                      <p className="text-muted-foreground">
                        問題は見つかりませんでした。安心してアンケートを公開できます。
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
          {viewMode === 'validation' && (
            <Button 
              onClick={() => setValidationIssues(validateSurvey())}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              再検証
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}