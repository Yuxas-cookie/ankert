'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, Copy, GripVertical } from 'lucide-react'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { questionValidationSchema, type QuestionFormData } from '@/lib/validations/survey'
import { OptionsEditor } from './OptionsEditor'
import { cn } from '@/lib/utils'

interface QuestionEditorProps {
  question?: QuestionFormData & { id?: string }
  index: number
  onUpdate: (data: QuestionFormData) => void
  onDelete: () => void
  onDuplicate: () => void
  isDragging?: boolean
  className?: string
}

const questionTypeLabels: Record<string, string> = {
  single_choice: '単一選択（ラジオボタン）',
  multiple_choice: '複数選択（チェックボックス）',
  text: '短文回答',
  textarea: '長文回答',
  rating: '評価スケール',
  matrix: 'マトリックス',
  date: '日付選択',
  file: 'ファイルアップロード'
}

export function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  isDragging = false,
  className
}: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const {
    register,
    watch,
    setValue,
    formState: { errors }
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionValidationSchema),
    defaultValues: {
      type: question?.type || 'single_choice',
      text: question?.text || '',
      required: question?.required || false,
      settings: question?.settings || {},
      options: question?.options || []
    }
  })

  const watchedData = watch()
  const questionType = watchedData.type

  // Stable reference for onUpdate to prevent infinite loops
  const stableOnUpdate = React.useRef(onUpdate)
  stableOnUpdate.current = onUpdate

  // Notify parent of changes - prevent infinite loops by comparing previous data
  const prevDataRef = React.useRef<QuestionFormData>()
  React.useEffect(() => {
    const currentData = JSON.stringify(watchedData)
    const prevData = JSON.stringify(prevDataRef.current)
    
    if (currentData !== prevData) {
      prevDataRef.current = watchedData
      stableOnUpdate.current(watchedData)
    }
  }, [watchedData]) // Remove onUpdate from dependencies

  const handleTypeChange = (type: string) => {
    setValue('type', type as any)
    
    // Reset type-specific data when changing types
    if (!['single_choice', 'multiple_choice'].includes(type)) {
      setValue('options', [])
    }
    if (type !== 'rating') {
      setValue('settings.ratingScale', undefined)
    }
    if (type !== 'matrix') {
      setValue('settings.matrix', undefined)
    }
    if (type !== 'file') {
      setValue('settings.file', undefined)
    }
  }

  const handleOptionsChange = (options: string[]) => {
    setValue('options', options)
  }

  const showOptionsEditor = ['single_choice', 'multiple_choice'].includes(questionType)

  return (
    <Card className={cn(
      'transition-all duration-200 bg-card/80 backdrop-blur-md border border-border/20 shadow-lg shadow-primary/5',
      'hover:shadow-xl hover:shadow-primary/10 hover:border-border/30',
      isDragging && 'opacity-50 rotate-2 scale-105 shadow-2xl',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-move">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Q{index + 1}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 justify-start text-left text-foreground hover:bg-background/50"
          >
            {watchedData.text || 'New Question'}
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-background/50"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="bg-background/10 border-t border-border/10">
          <div className="space-y-4">
            {/* Question Type */}
            <div>
              <Label htmlFor={`question-type-${index}`} className="text-foreground font-medium">質問タイプ</Label>
              <Select value={questionType} onValueChange={handleTypeChange}>
                <SelectTrigger className="bg-background/50 border-border/50 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {Object.entries(questionTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-foreground hover:bg-background/50">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Text */}
            <div>
              <Label htmlFor={`question-text-${index}`} className="text-foreground font-medium">
                質問文 <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`question-text-${index}`}
                {...register('text')}
                placeholder="質問文を入力してください"
                className={`bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground ${errors.text ? 'border-destructive' : ''}`}
              />
              {errors.text && (
                <p className="text-destructive text-sm mt-1">{errors.text.message}</p>
              )}
            </div>

            {/* Required Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id={`question-required-${index}`}
                checked={watchedData.required}
                onCheckedChange={(checked) => setValue('required', checked)}
              />
              <Label htmlFor={`question-required-${index}`} className="text-foreground">必須回答</Label>
            </div>

            {/* Options Editor for choice questions */}
            {showOptionsEditor && (
              <div>
                <Label className="text-foreground font-medium">選択肢</Label>
                <OptionsEditor
                  options={watchedData.options || []}
                  onChange={handleOptionsChange}
                  questionType={questionType}
                />
              </div>
            )}

            {/* Type-specific settings */}
            {questionType === 'rating' && (
              <div className="space-y-3 p-4 bg-background/20 rounded-xl border border-border/20 shadow-sm">
                <Label className="text-foreground font-medium">評価スケール設定</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`rating-min-${index}`} className="text-foreground">最小値</Label>
                    <Input
                      id={`rating-min-${index}`}
                      type="number"
                      defaultValue={watchedData.settings?.ratingScale?.min || 1}
                      onChange={(e) => setValue('settings.ratingScale.min', parseInt(e.target.value))}
                      className="bg-background/50 border-border/50 text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rating-max-${index}`} className="text-foreground">最大値</Label>
                    <Input
                      id={`rating-max-${index}`}
                      type="number"
                      defaultValue={watchedData.settings?.ratingScale?.max || 5}
                      onChange={(e) => setValue('settings.ratingScale.max', parseInt(e.target.value))}
                      className="bg-background/50 border-border/50 text-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`rating-label-min-${index}`} className="text-foreground">最小値ラベル</Label>
                    <Input
                      id={`rating-label-min-${index}`}
                      placeholder="例: 全くそう思わない"
                      defaultValue={watchedData.settings?.ratingScale?.labels?.[0] || ''}
                      onChange={(e) => {
                        const labels = [...(watchedData.settings?.ratingScale?.labels || ['', ''])]
                        labels[0] = e.target.value
                        setValue('settings.ratingScale.labels', labels)
                      }}
                      className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rating-label-max-${index}`} className="text-foreground">最大値ラベル</Label>
                    <Input
                      id={`rating-label-max-${index}`}
                      placeholder="例: とてもそう思う"
                      defaultValue={watchedData.settings?.ratingScale?.labels?.[1] || ''}
                      onChange={(e) => {
                        const labels = [...(watchedData.settings?.ratingScale?.labels || ['', ''])]
                        labels[1] = e.target.value
                        setValue('settings.ratingScale.labels', labels)
                      }}
                      className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            )}

            {questionType === 'matrix' && (
              <div className="space-y-3 p-4 bg-background/20 rounded-xl border border-border/20 shadow-sm">
                <Label className="text-foreground font-medium">マトリックス設定</Label>
                <div>
                  <Label className="text-foreground">行（質問項目）</Label>
                  <div className="space-y-2">
                    {(watchedData.settings?.matrix?.rows || ['']).map((row: string, i: number) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={row}
                          placeholder={`行 ${i + 1}`}
                          onChange={(e) => {
                            const rows = [...(watchedData.settings?.matrix?.rows || [])]
                            rows[i] = e.target.value
                            setValue('settings.matrix.rows', rows)
                          }}
                          className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const rows = (watchedData.settings?.matrix?.rows || []).filter((_: any, idx: number) => idx !== i)
                            setValue('settings.matrix.rows', rows)
                          }}
                          className="bg-background/50 border-border/50 text-foreground hover:bg-background/80"
                        >
                          削除
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const rows = [...(watchedData.settings?.matrix?.rows || []), '']
                        setValue('settings.matrix.rows', rows)
                      }}
                      className="bg-background/50 border-border/50 text-foreground hover:bg-background/80"
                    >
                      行を追加
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>列（回答選択肢）</Label>
                  <div className="space-y-2">
                    {(watchedData.settings?.matrix?.columns || ['']).map((column: string, i: number) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={column}
                          placeholder={`列 ${i + 1}`}
                          onChange={(e) => {
                            const columns = [...(watchedData.settings?.matrix?.columns || [])]
                            columns[i] = e.target.value
                            setValue('settings.matrix.columns', columns)
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const columns = (watchedData.settings?.matrix?.columns || []).filter((_: any, idx: number) => idx !== i)
                            setValue('settings.matrix.columns', columns)
                          }}
                        >
                          削除
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const columns = [...(watchedData.settings?.matrix?.columns || []), '']
                        setValue('settings.matrix.columns', columns)
                      }}
                    >
                      列を追加
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {questionType === 'date' && (
              <div className="space-y-3 p-4 bg-background/20 rounded-xl border border-border/20 shadow-sm">
                <Label className="text-foreground font-medium">日付設定</Label>
                <div>
                  <Label htmlFor={`date-mode-${index}`} className="text-foreground">日付モード</Label>
                  <Select
                    value={(watchedData.settings as any)?.date?.mode || 'date'}
                    onValueChange={(value) => setValue('settings', { ...(watchedData.settings || {}), date: { ...(watchedData.settings as any)?.date, mode: value }} as any)}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="date" className="text-foreground hover:bg-background/50">日付のみ</SelectItem>
                      <SelectItem value="time" className="text-foreground hover:bg-background/50">時刻のみ</SelectItem>
                      <SelectItem value="datetime" className="text-foreground hover:bg-background/50">日時</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {questionType === 'file' && (
              <div className="space-y-3 p-4 bg-background/20 rounded-xl border border-border/20 shadow-sm">
                <Label className="text-foreground font-medium">ファイルアップロード設定</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`file-max-size-${index}`}>最大ファイルサイズ（MB）</Label>
                    <Input
                      id={`file-max-size-${index}`}
                      type="number"
                      defaultValue={((watchedData.settings as any)?.file?.maxSize || 10485760) / 1024 / 1024}
                      onChange={(e) => setValue('settings', { ...(watchedData.settings || {}), file: { ...(watchedData.settings as any)?.file, maxSize: parseInt(e.target.value) * 1024 * 1024 }} as any)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`file-max-files-${index}`}>最大ファイル数</Label>
                    <Input
                      id={`file-max-files-${index}`}
                      type="number"
                      defaultValue={(watchedData.settings as any)?.file?.maxFiles || 1}
                      onChange={(e) => setValue('settings', { ...(watchedData.settings || {}), file: { ...(watchedData.settings as any)?.file, maxFiles: parseInt(e.target.value) }} as any)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`file-types-${index}`}>許可するファイル形式（カンマ区切り）</Label>
                  <Input
                    id={`file-types-${index}`}
                    placeholder="例: image/*, .pdf, .docx"
                    defaultValue={(watchedData.settings as any)?.file?.allowedTypes?.join(', ') || ''}
                    onChange={(e) => setValue('settings', { ...(watchedData.settings || {}), file: { ...(watchedData.settings as any)?.file, allowedTypes: e.target.value.split(',').map(s => s.trim()) }} as any)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}