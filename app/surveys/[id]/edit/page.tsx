'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SurveyBasicForm } from '@/components/survey/SurveyBasicForm'
import { QuestionList } from '@/components/survey/editor/QuestionList'
import { QuestionPreview } from '@/components/survey/preview/QuestionPreview'
import { SurveyPreview } from '@/components/survey/preview/SurveyPreview'
import { PreviewModal } from '@/components/survey/preview/PreviewModal'
import { TeamManagement } from '@/components/team/TeamManagement'
import { surveyService } from '@/lib/supabase/surveys'
import { questionService } from '@/lib/supabase/questions'
import { useAutoSave } from '@/lib/hooks/useAutoSave'
import { useAuth } from '@/lib/hooks/useAuth'
import { SurveyWithQuestions } from '@/types/survey'
import { SurveyFormData, QuestionFormData } from '@/lib/validations/survey'
import { toast } from 'sonner'
import { 
  Eye, 
  Settings, 
  Save, 
  ExternalLink, 
  TestTube,
  ArrowLeft,
  Sparkles,
  Activity,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react'

export default function SurveyEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [questions, setQuestions] = useState<(QuestionFormData & { id: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('editor')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const userId = user?.id

  useEffect(() => {
    if (!userId) {
      toast.error('ログインが必要です')
      router.push('/login')
      return
    }
    if (surveyId) {
      loadSurvey()
    }
  }, [surveyId, userId, router])

  const loadSurvey = async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      const { data, error } = await surveyService.getSurveyById(surveyId, userId)
      
      if (error) throw error
      
      if (data) {
        setSurvey(data)
        
        // Convert questions to form data
        const questionFormData = data.questions.map(q => ({
          id: q.id,
          type: q.question_type as any,
          text: q.question_text,
          required: q.is_required,
          settings: (q.settings as any) || {},
          options: q.options?.map(opt => opt.option_text) || []
        }))
        
        setQuestions(questionFormData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSurveyUpdate = async (data: SurveyFormData) => {
    if (!userId) {
      toast.error('ログインが必要です')
      return
    }
    
    try {
      setIsSaving(true)
      const { error } = await surveyService.updateSurvey(surveyId, data, userId)
      
      if (error) throw error
      
      // Update local state
      if (survey) {
        setSurvey({
          ...survey,
          title: data.title,
          description: data.description || undefined
        })
      }
      setLastSaved(new Date())
      toast.success('保存しました')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async (data: SurveyFormData) => {
    if (!userId) return
    
    try {
      await surveyService.saveDraft(surveyId, data, userId)
      setLastSaved(new Date())
    } catch (err) {
      console.error('Draft save failed:', err)
    }
  }

  const handleQuestionsChange = React.useCallback((newQuestionsOrUpdater: ((prev: (QuestionFormData & { id: string })[]) => (QuestionFormData & { id: string })[]) | (QuestionFormData & { id: string })[]) => {
    if (typeof newQuestionsOrUpdater === 'function') {
      setQuestions(newQuestionsOrUpdater)
    } else {
      setQuestions(newQuestionsOrUpdater)
    }
  }, [])

  const handleSaveQuestions = async () => {
    try {
      setIsSaving(true)
      
      // Save each question
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        
        if (question.id.startsWith('question-')) {
          // New question
          await questionService.createQuestion(surveyId, question, i)
        } else {
          // Existing question
          await questionService.updateQuestion(question.id, question)
        }
      }
      
      // Refresh survey data
      await loadSurvey()
      setLastSaved(new Date())
      
      toast.success('質問を保存しました')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '質問の保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!userId) {
      toast.error('ログインが必要です')
      return
    }
    
    if (!confirm('このアンケートを公開してもよろしいですか？')) return

    try {
      setIsSaving(true)
      const { error } = await surveyService.publishSurvey(surveyId, userId)
      
      if (error) throw error
      
      toast.success('アンケートを公開しました')
      router.push(`/surveys/${surveyId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '公開に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save functionality - temporarily disabled to fix infinite loop
  // const { saveStatus } = useAutoSave({
  //   data: { title: survey?.title || '', description: survey?.description || '' },
  //   onSave: handleSaveDraft,
  //   delay: 3000,
  //   enabled: !!survey && !isSaving
  // })
  const saveStatus = 'idle' as const

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-full h-full text-[var(--cosmic-aurora)]" />
          </motion.div>
          <p className="text-lg text-muted-foreground">読み込み中...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !survey) {
    // エラーメッセージをより具体的に
    let errorMessage = 'アンケートが見つかりません'
    let errorDetail = ''
    
    if (error) {
      if (error.includes('Row not found')) {
        errorMessage = 'アンケートへのアクセス権限がありません'
        errorDetail = 'このアンケートを編集するには、作成者としてログインする必要があります。'
      } else {
        errorMessage = 'エラーが発生しました'
        errorDetail = error
      }
    }
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CosmicCard variant="glass" className="p-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <div className="text-lg font-semibold text-destructive">{errorMessage}</div>
            {errorDetail && (
              <div className="text-muted-foreground mt-2 text-sm">{errorDetail}</div>
            )}
            <div className="mt-6 space-y-3">
              <Link href="/surveys">
                <CosmicButton variant="nebula" className="w-full">
                  アンケート一覧に戻る
                </CosmicButton>
              </Link>
              <Link href="/surveys/new">
                <CosmicButton variant="glass" className="w-full">
                  新しいアンケートを作成
                </CosmicButton>
              </Link>
            </div>
          </CosmicCard>
        </motion.div>
      </div>
    )
  }

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

      <div className="container mx-auto py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href={`/surveys/${surveyId}`}>
              <CosmicButton 
                variant="glass" 
                size="sm" 
                className="mb-4"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                アンケート詳細に戻る
              </CosmicButton>
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--cosmic-nebula)] via-[var(--cosmic-star)] to-[var(--cosmic-aurora)]">
                  アンケート編集
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{survey.title}</span>
                  </div>
                  {lastSaved && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-[var(--cosmic-aurora)]" />
                      <span>最終保存: {lastSaved.toLocaleTimeString('ja-JP')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <CosmicButton
                  onClick={() => setShowPreviewModal(true)}
                  disabled={questions.length === 0}
                  variant="glass"
                  icon={<Eye className="h-4 w-4" />}
                >
                  プレビュー
                </CosmicButton>
                <Link href={`/surveys/${surveyId}/preview`} target="_blank">
                  <CosmicButton
                    disabled={questions.length === 0}
                    variant="glass"
                    icon={<ExternalLink className="h-4 w-4" />}
                  >
                    新しいタブで表示
                  </CosmicButton>
                </Link>
                <CosmicButton
                  onClick={handleSaveQuestions}
                  disabled={isSaving}
                  variant="nebula"
                  icon={<Save className="h-4 w-4" />}
                >
                  {isSaving ? '保存中...' : '保存'}
                </CosmicButton>
                <CosmicButton
                  onClick={handlePublish}
                  disabled={isSaving || questions.length === 0}
                  variant="cosmic"
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  公開
                </CosmicButton>
              </motion.div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="editor" className="gap-2 data-[state=active]:bg-primary/20">
                <Settings className="h-4 w-4" />
                編集
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-primary/20">
                <Eye className="h-4 w-4" />
                プレビュー
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-primary/20">
                <UserPlus className="h-4 w-4" />
                チーム管理
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {/* Basic Info */}
                <div className="lg:col-span-2">
                  <CosmicCard variant="nebula" className="h-full">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] p-0.5">
                          <div className="w-full h-full rounded-md bg-background/90 flex items-center justify-center">
                            <Settings className="w-4 h-4" />
                          </div>
                        </div>
                        基本情報
                      </h2>
                      <SurveyBasicForm
                        initialData={{
                          title: survey.title,
                          description: survey.description || '',
                          questions: []
                        }}
                        onSubmit={handleSurveyUpdate}
                        onSaveDraft={handleSaveDraft}
                        isLoading={isSaving}
                        saveStatus={saveStatus}
                      />
                    </div>
                  </CosmicCard>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <CosmicCard variant="aurora">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-foreground mb-4">統計</h2>
                      <div className="space-y-4">
                        <motion.div 
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-[var(--cosmic-star)]" />
                            <span className="text-muted-foreground">質問数</span>
                          </div>
                          <span className="text-lg font-semibold text-foreground">{questions.length}</span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[var(--cosmic-aurora)]" />
                            <span className="text-muted-foreground">必須質問</span>
                          </div>
                          <span className="text-lg font-semibold text-foreground">
                            {questions.filter(q => q.required).length}
                          </span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-[var(--cosmic-solar)]" />
                            <span className="text-muted-foreground">回答数</span>
                          </div>
                          <span className="text-lg font-semibold text-foreground">0</span>
                        </motion.div>
                      </div>
                    </div>
                  </CosmicCard>

                  {/* Status Card */}
                  <CosmicCard variant="glass">
                    <div className="p-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">ステータス</h3>
                      <Badge 
                        variant={survey.status === 'published' ? 'default' : 'secondary'}
                        className={survey.status === 'published' 
                          ? 'bg-[var(--cosmic-aurora)]/10 text-[var(--cosmic-aurora)] border-[var(--cosmic-aurora)]/20' 
                          : 'bg-[var(--cosmic-solar)]/10 text-[var(--cosmic-solar)] border-[var(--cosmic-solar)]/20'
                        }
                      >
                        {survey.status === 'published' ? '公開中' : '下書き'}
                      </Badge>
                      <div className="mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>作成日: {new Date(survey.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>
                  </CosmicCard>
                </div>
              </motion.div>

              {/* Questions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <QuestionList
                  questions={questions}
                  onQuestionsChange={handleQuestionsChange}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <CosmicCard variant="nebula">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-foreground">アンケートプレビュー</h2>
                      <div className="flex gap-3">
                        <CosmicButton
                          onClick={() => setShowPreviewModal(true)}
                          disabled={questions.length === 0}
                          variant="glass"
                          size="sm"
                          icon={<TestTube className="h-4 w-4" />}
                        >
                          インタラクティブテスト
                        </CosmicButton>
                        <Link href={`/surveys/${surveyId}/preview`} target="_blank">
                          <CosmicButton
                            disabled={questions.length === 0}
                            variant="glass"
                            size="sm"
                            icon={<ExternalLink className="h-4 w-4" />}
                          >
                            新しいタブで表示
                          </CosmicButton>
                        </Link>
                      </div>
                    </div>
                    
                    {questions.length === 0 ? (
                      <motion.div 
                        className="text-center py-20"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--cosmic-nebula)]/20 to-[var(--cosmic-star)]/20 flex items-center justify-center">
                          <FileText className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-lg">まだ質問が追加されていません</p>
                        <p className="text-sm text-muted-foreground mt-2">「編集」タブで質問を追加してください</p>
                      </motion.div>
                    ) : (
                      <SurveyPreview
                        survey={{
                          ...survey,
                          questions: questions.map((question, index) => ({
                            id: question.id,
                            survey_id: surveyId,
                            question_type: question.type,
                            question_text: question.text,
                            is_required: question.required,
                            order_index: index,
                            settings: question.settings as any,
                            created_at: '',
                            updated_at: '',
                            options: question.options?.map((opt, i) => ({
                              id: `${question.id}-option-${i}`,
                              question_id: question.id,
                              option_text: opt,
                              order_index: i,
                              created_at: ''
                            })) || []
                          }))
                        }}
                        mode="preview"
                      />
                    )}
                  </div>
                </CosmicCard>
              </motion.div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <CosmicCard variant="nebula">
                  <div className="p-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">チーム管理</h2>
                    <TeamManagement resourceId={surveyId} resourceType="survey" />
                  </div>
                </CosmicCard>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Preview Modal */}
          <AnimatePresence>
            {showPreviewModal && (
              <PreviewModal
                survey={{
                  ...survey,
                  questions: questions.map((question, index) => ({
                    id: question.id,
                    survey_id: surveyId,
                    question_type: question.type,
                    question_text: question.text,
                    is_required: question.required,
                    order_index: index,
                    settings: question.settings as any,
                    created_at: '',
                    updated_at: '',
                    options: question.options?.map((opt, i) => ({
                      id: `${question.id}-option-${i}`,
                      question_id: question.id,
                      option_text: opt,
                      order_index: i,
                      created_at: ''
                    })) || []
                  }))
                }}
                open={showPreviewModal}
                onOpenChange={setShowPreviewModal}
                initialMode="test"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}