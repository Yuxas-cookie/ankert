'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { surveyFormSchema, type SurveyFormData } from '@/lib/validations/survey'
import { Save, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'

interface SurveyBasicFormProps {
  initialData?: Partial<SurveyFormData>
  onSubmit: (data: SurveyFormData) => Promise<void>
  onSaveDraft?: (data: SurveyFormData) => Promise<void>
  isLoading?: boolean
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

export function SurveyBasicForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isLoading = false,
  saveStatus = 'idle'
}: SurveyBasicFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      questions: initialData?.questions || []
    },
    mode: 'onChange'
  })

  const watchedData = watch()

  // Auto-save effect
  const stableOnSaveDraft = React.useRef(onSaveDraft)
  stableOnSaveDraft.current = onSaveDraft

  React.useEffect(() => {
    if (stableOnSaveDraft.current && isValid && watchedData.title) {
      const timeoutId = setTimeout(() => {
        stableOnSaveDraft.current?.(watchedData)
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [watchedData.title, watchedData.description, isValid]) // Remove onSaveDraft from dependencies

  const getSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: '保存中...', icon: Save, color: 'text-[var(--cosmic-star)]' }
      case 'saved':
        return { text: '保存済み', icon: CheckCircle, color: 'text-[var(--cosmic-aurora)]' }
      case 'error':
        return { text: '保存エラー', icon: AlertCircle, color: 'text-destructive' }
      default:
        return null
    }
  }

  const status = getSaveStatus()

  return (
    <div className="w-full">
      {/* Save Status */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-end gap-2 mb-4"
          >
            <status.icon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-sm ${status.color}`}>{status.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="title" className="block text-sm font-medium mb-2 text-foreground">
            タイトル <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            {...register('title')}
            placeholder="アンケートのタイトルを入力してください"
            className={`bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 placeholder:text-muted-foreground ${errors.title ? 'border-destructive' : ''}`}
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-foreground">
              説明文
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="アンケートの説明や目的を入力してください（任意）"
              rows={4}
              className={`bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 placeholder:text-muted-foreground ${errors.description ? 'border-destructive' : ''}`}
            />
            {errors.description && (
              <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
            )}
          </motion.div>

          <motion.div 
            className="flex gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CosmicButton
              type="submit"
              disabled={isLoading || !isValid}
              variant="cosmic"
              icon={<Sparkles className="w-4 h-4" />}
              className="flex-1"
            >
              {isLoading ? '保存中...' : '保存して続ける'}
            </CosmicButton>
            
            {onSaveDraft && (
              <CosmicButton
                type="button"
                variant="glass"
                onClick={() => onSaveDraft(watchedData)}
                disabled={!watchedData.title || saveStatus === 'saving'}
                icon={<Save className="w-4 h-4" />}
              >
                下書き保存
              </CosmicButton>
            )}
          </motion.div>
        </form>
    </div>
  )
}