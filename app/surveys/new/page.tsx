'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SurveyBasicForm } from '@/components/survey/SurveyBasicForm'
import { surveyService } from '@/lib/supabase/surveys'
import { SurveyFormData } from '@/lib/validations/survey'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { ArrowLeft, Sparkles, FileText } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

export default function NewSurveyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [currentSurveyId, setCurrentSurveyId] = useState<string | null>(null)
  
  const userId = user?.id

  const handleCreateSurvey = async (data: SurveyFormData) => {
    if (!userId) {
      toast.error('ログインが必要です')
      router.push('/login')
      return
    }

    try {
      setIsLoading(true)
      const surveyData = { ...data, questions: data.questions || [] }
      const { data: survey, error } = await surveyService.createSurvey(surveyData, userId)
      
      if (error) throw error
      
      if (survey) {
        toast.success('アンケートが作成されました')
        // Redirect to edit page to continue adding questions
        router.push(`/surveys/${survey.id}/edit`)
      }
    } catch (err) {
      console.error('Survey creation error:', err)
      toast.error(err instanceof Error ? err.message : 'アンケートの作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = async (data: SurveyFormData) => {
    if (!userId) return

    try {
      if (currentSurveyId) {
        // Update existing draft
        const { error } = await surveyService.saveDraft(currentSurveyId, data, userId)
        if (error) throw error
      } else {
        // Create new draft
        const surveyData = { ...data, questions: data.questions || [] }
        const { data: survey, error } = await surveyService.createSurvey(surveyData, userId)
        if (error) throw error
        if (survey) {
          setCurrentSurveyId(survey.id)
        }
      }
    } catch (err) {
      console.error('Draft save failed:', err)
    }
  }

  // Auto-save functionality - disabled for now to avoid loops
  const saveStatus = 'idle'

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Static gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--cosmic-nebula)]/4 via-transparent to-[var(--cosmic-aurora)]/4" />
        
        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--cosmic-star)]/2 to-transparent" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255,255,255) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] p-0.5">
                  <div className="w-full h-full rounded-[14px] bg-background/90 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-foreground" />
                  </div>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] opacity-50 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--cosmic-nebula)] via-[var(--cosmic-star)] to-[var(--cosmic-aurora)]">
                  新しいアンケートを作成
                </h1>
                <p className="text-muted-foreground mt-1">
                  まずはアンケートの基本情報を入力してください
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CosmicCard variant="nebula" className="p-8">
              <div className="space-y-6">
                {/* Progress Indicator */}
                <motion.div 
                  className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
                      1
                    </div>
                    <span className="font-medium text-foreground">基本情報</span>
                  </div>
                  <div className="h-px bg-border/50 flex-1" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium text-sm">
                      2
                    </div>
                    <span>質問作成</span>
                  </div>
                  <div className="h-px bg-border/50 flex-1" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium text-sm">
                      3
                    </div>
                    <span>公開設定</span>
                  </div>
                </motion.div>

                <SurveyBasicForm
                  onSubmit={handleCreateSurvey}
                  onSaveDraft={handleSaveDraft}
                  isLoading={isLoading}
                  saveStatus={saveStatus}
                />
              </div>
            </CosmicCard>
          </motion.div>

          {/* Back Button */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <CosmicButton
              variant="glass"
              size="sm"
              onClick={() => router.back()}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              戻る
            </CosmicButton>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <CosmicCard variant="glass" className="p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-5 h-5 text-[var(--cosmic-solar)] flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">ヒント</h3>
                  <p className="text-sm text-muted-foreground">
                    アンケートのタイトルは、回答者にとって分かりやすく魅力的なものにしましょう。
                    説明文では、アンケートの目的や所要時間を明記すると回答率が向上します。
                  </p>
                </div>
              </div>
            </CosmicCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}