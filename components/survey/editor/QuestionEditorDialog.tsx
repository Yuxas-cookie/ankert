'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Question } from '../builder/QuestionCard'
import { OptionsEditor } from './OptionsEditor'
import { cn } from '@/lib/utils'
import { X, Save, Eye } from 'lucide-react'

interface QuestionEditorDialogProps {
  question?: Question
  isOpen: boolean
  onClose: () => void
  onSave: (question: Question) => void
  onPreview?: (question: Question) => void
}

export const QuestionEditorDialog: React.FC<QuestionEditorDialogProps> = ({
  question,
  isOpen,
  onClose,
  onSave,
  onPreview
}) => {
  const [editingQuestion, setEditingQuestion] = useState<Question>({
    id: '',
    type: 'text',
    title: '',
    description: '',
    required: false,
    visible: true,
    orderIndex: 0,
    settings: {}
  })
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (question) {
      setEditingQuestion({ ...question })
      setIsDirty(false)
    }
  }, [question])

  const handleFieldChange = (field: keyof Question, value: any) => {
    setEditingQuestion(prev => ({
      ...prev,
      [field]: value
    }))
    setIsDirty(true)
  }

  const handleSettingsChange = (settings: Record<string, any>) => {
    setEditingQuestion(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }))
    setIsDirty(true)
  }

  const handleSave = () => {
    if (!editingQuestion.title.trim()) {
      alert('質問のタイトルを入力してください')
      return
    }
    
    onSave(editingQuestion)
    setIsDirty(false)
  }

  const handlePreview = () => {
    onPreview?.(editingQuestion)
  }

  const handleClose = () => {
    if (isDirty) {
      if (confirm('変更が保存されていません。閉じてもよろしいですか？')) {
        onClose()
        setIsDirty(false)
      }
    } else {
      onClose()
    }
  }

  const getQuestionTypeLabel = () => {
    const labels = {
      'text': 'テキスト入力',
      'textarea': '長文入力',
      'single-choice': '単一選択',
      'multiple-choice': '複数選択',
      'rating': '評価スケール',
      'date': '日付選択',
      'time': '時刻選択',
      'file-upload': 'ファイルアップロード',
      'matrix': 'マトリックス',
      'yes-no': 'はい/いいえ'
    }
    return labels[editingQuestion.type] || editingQuestion.type
  }

  const supportsOptions = ['single-choice', 'multiple-choice', 'matrix'].includes(editingQuestion.type)

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">質問を編集</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{getQuestionTypeLabel()}</Badge>
                {isDirty && <Badge variant="secondary">未保存</Badge>}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] px-1">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="question-title">質問文 *</Label>
              <Input
                id="question-title"
                value={editingQuestion.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="質問を入力してください"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="question-description">説明文（任意）</Label>
              <Textarea
                id="question-description"
                value={editingQuestion.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="質問の説明や補足情報を入力してください"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>必須回答</Label>
                <p className="text-sm text-muted-foreground">
                  回答者が必ず回答する必要があります
                </p>
              </div>
              <Switch
                checked={editingQuestion.required}
                onCheckedChange={(checked) => handleFieldChange('required', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>質問を表示</Label>
                <p className="text-sm text-muted-foreground">
                  アンケートで質問を表示するかどうか
                </p>
              </div>
              <Switch
                checked={editingQuestion.visible}
                onCheckedChange={(checked) => handleFieldChange('visible', checked)}
              />
            </div>
          </div>

          {/* Type-specific Settings */}
          {editingQuestion.type === 'text' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium">テキスト設定</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-length">最小文字数</Label>
                    <Input
                      id="min-length"
                      type="number"
                      min="0"
                      value={editingQuestion.settings?.minLength || ''}
                      onChange={(e) => handleSettingsChange({ minLength: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-length">最大文字数</Label>
                    <Input
                      id="max-length"
                      type="number"
                      min="1"
                      value={editingQuestion.settings?.maxLength || ''}
                      onChange={(e) => handleSettingsChange({ maxLength: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {editingQuestion.type === 'rating' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium">評価設定</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-rating">最小値</Label>
                    <Input
                      id="min-rating"
                      type="number"
                      min="1"
                      value={editingQuestion.settings?.minRating || 1}
                      onChange={(e) => handleSettingsChange({ minRating: parseInt(e.target.value) || 1 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-rating">最大値</Label>
                    <Input
                      id="max-rating"
                      type="number"
                      max="10"
                      value={editingQuestion.settings?.maxRating || 5}
                      onChange={(e) => handleSettingsChange({ maxRating: parseInt(e.target.value) || 5 })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rating-labels">ラベル</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      placeholder="最小値のラベル（例：悪い）"
                      value={editingQuestion.settings?.minLabel || ''}
                      onChange={(e) => handleSettingsChange({ minLabel: e.target.value })}
                    />
                    <Input
                      placeholder="最大値のラベル（例：良い）"
                      value={editingQuestion.settings?.maxLabel || ''}
                      onChange={(e) => handleSettingsChange({ maxLabel: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {supportsOptions && (
            <>
              <Separator />
              <OptionsEditor
                questionType={editingQuestion.type === 'single-choice' ? 'single_choice' : 'multiple_choice'}
                options={editingQuestion.settings?.options || []}
                onChange={(options) => handleSettingsChange({ options })}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          {onPreview && (
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              プレビュー
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!editingQuestion.title.trim()}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}