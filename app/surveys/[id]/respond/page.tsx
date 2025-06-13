'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SurveyWithQuestions } from '@/types/survey'
import { SingleChoiceQuestion } from '@/components/survey/questions/SingleChoiceQuestion'
import { MultipleChoiceQuestion } from '@/components/survey/questions/MultipleChoiceQuestion'
import { TextQuestion } from '@/components/survey/questions/TextQuestion'
import { RatingQuestion } from '@/components/survey/questions/RatingQuestion'
import { MatrixQuestion } from '@/components/survey/questions/MatrixQuestion'
import { DateQuestion } from '@/components/survey/questions/DateQuestion'
import { FileQuestion } from '@/components/survey/questions/FileQuestion'
import { 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  AlertCircle,
  Sparkles,
  Activity,
  Timer,
  RefreshCw
} from 'lucide-react'

export default function SurveyResponsePage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [startTime] = useState(Date.now())

  // For now, treat all questions as one page
  const totalPages = 1
  const currentQuestions = survey?.questions || []
  const progress = survey ? ((currentPage + 1) / totalPages) * 100 : 0

  useEffect(() => {
    loadSurvey()
  }, [surveyId])

  const loadSurvey = async () => {
    try {
      setIsLoading(true)
      
      // Fetch survey data from API or Supabase directly
      const response = await fetch(`/api/surveys/${surveyId}/public`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error || 'Survey not found or not available'
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      
      // Transform the data to match expected structure
      const transformedSurvey = {
        ...data.survey,
        questions: data.survey.questions.map((question: any) => ({
          ...question,
          // Transform question_options to options
          options: question.question_options || []
        }))
      }
      
      console.log('[Respond Page] Transformed survey:', {
        surveyId: transformedSurvey.id,
        questionsCount: transformedSurvey.questions.length,
        questions: transformedSurvey.questions.map(q => ({
          id: q.id,
          type: q.question_type,
          text: q.question_text,
          optionsCount: q.options?.length || 0,
          options: q.options?.map((o: any) => ({ id: o.id, text: o.option_text }))
        }))
      })
      
      setSurvey(transformedSurvey)
      
    } catch (error) {
      console.error('Error loading survey:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to load survey')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponseChange = (questionId: string, value: any) => {
    console.log('[Respond Page] Response change:', { 
      questionId, 
      value,
      valueType: typeof value,
      isArray: Array.isArray(value)
    })
    console.log('[Respond Page] Current responses before update:', responses)
    
    setResponses(prev => {
      const newResponses = {
        ...prev,
        [questionId]: value
      }
      console.log('[Respond Page] New responses after update:', newResponses)
      return newResponses
    })
    
    // Clear error when user provides input
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateCurrentPage = () => {
    const newErrors: Record<string, string> = {}
    
    currentQuestions.forEach(question => {
      if (question.is_required && !responses[question.id]) {
        newErrors[question.id] = 'この質問は必須です'
      }
      
      // Additional validation based on question type
      const value = responses[question.id]
      if (value) {
        switch (question.question_type) {
          case 'multiple_choice':
            if (Array.isArray(value) && value.length === 0) {
              newErrors[question.id] = '最低1つは選択してください'
            }
            break
          case 'text':
          case 'textarea':
            const settings = question.settings as any
            if (settings?.minLength && value.length < settings.minLength) {
              newErrors[question.id] = `最低${settings.minLength}文字以上入力してください`
            }
            if (settings?.maxLength && value.length > settings.maxLength) {
              newErrors[question.id] = `最大${settings.maxLength}文字以内で入力してください`
            }
            break
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentPage()) {
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleSubmit = async () => {
    if (!validateCurrentPage()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses,
          timeSpent: Math.floor((Date.now() - startTime) / 1000)
        })
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.validationErrors) {
          setErrors(result.validationErrors)
        }
        throw new Error(result.error || 'Failed to submit response')
      }

      setIsSubmitted(true)
      
    } catch (error) {
      console.error('Error submitting response:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit response')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: any) => {
    const commonProps = {
      question,
      value: responses[question.id],
      onChange: (value: any) => handleResponseChange(question.id, value),
      disabled: false,
      error: errors[question.id]
    }

    switch (question.question_type) {
      case 'single_choice':
        return <SingleChoiceQuestion {...commonProps} />
      case 'multiple_choice':
        return <MultipleChoiceQuestion {...commonProps} />
      case 'text':
      case 'textarea':
        return <TextQuestion {...commonProps} />
      case 'rating':
        return <RatingQuestion {...commonProps} />
      case 'matrix':
        return <MatrixQuestion {...commonProps} />
      case 'date':
        return <DateQuestion {...commonProps} />
      case 'file':
        return <FileQuestion {...commonProps} />
      default:
        return (
          <div className="text-muted-foreground italic">
            未対応の質問タイプ: {question.question_type}
          </div>
        )
    }
  }

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

  if (!survey || submitError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-center space-y-4 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CosmicCard variant="glass" className="p-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <div className="text-lg font-semibold text-destructive">エラーが発生しました</div>
            <div className="text-muted-foreground mt-2">{submitError || 'アンケートが見つかりません'}</div>
            <CosmicButton 
              onClick={() => window.location.reload()} 
              variant="nebula"
              className="mt-6"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              再試行
            </CosmicButton>
          </CosmicCard>
        </motion.div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Static background effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-[150%] h-[150%] bg-gradient-to-br from-[var(--cosmic-aurora)]/8 to-transparent rounded-full" />
        </div>

        <motion.div 
          className="text-center space-y-6 max-w-md z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          <CosmicCard variant="aurora" className="p-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.2, 
                duration: 0.8,
                type: "spring",
                stiffness: 200
              }}
            >
              <CheckCircle className="h-20 w-20 text-[var(--cosmic-aurora)] mx-auto mb-6" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-2xl font-bold text-foreground mb-3">
                ご回答ありがとうございました
              </h1>
              <p className="text-muted-foreground">
                アンケートへのご協力ありがとうございます。<br />
                回答が正常に送信されました。
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <CosmicButton 
                onClick={() => window.close()} 
                variant="glass"
                className="w-full"
                icon={<Sparkles className="w-4 h-4" />}
              >
                ページを閉じる
              </CosmicButton>
            </motion.div>
          </CosmicCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Static background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[60%] h-[60%] bg-gradient-to-bl from-[var(--cosmic-nebula)]/8 to-transparent rounded-full" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[50%] h-[50%] bg-gradient-to-tr from-[var(--cosmic-star)]/8 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto py-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CosmicCard variant="nebula" className="overflow-hidden">
              {/* Header */}
              <div className="p-8 pb-0">
                <div className="space-y-6">
                  {/* Time indicator */}
                  <motion.div 
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Timer className="w-4 h-4" />
                    <span>回答開始から {Math.floor((Date.now() - startTime) / 60000)} 分経過</span>
                  </motion.div>

                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-3">
                      {survey.title}
                    </h1>
                    {survey.description && (
                      <p className="text-muted-foreground text-lg">
                        {survey.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">進捗状況</span>
                      <motion.span 
                        className="font-medium text-[var(--cosmic-aurora)]"
                        key={progress}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        {Math.round(progress)}%
                      </motion.span>
                    </div>
                    <div className="relative h-3 bg-card/50 rounded-full overflow-hidden border border-border/50">
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-[var(--cosmic-nebula)] via-[var(--cosmic-star)] to-[var(--cosmic-aurora)]"
                        initial={{ x: "-100%" }}
                        animate={{ x: `${progress - 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Error Alert */}
                <AnimatePresence>
                  {Object.keys(errors).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6"
                    >
                      <Alert className="border-destructive/50 bg-destructive/10">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                          いくつかの項目に入力エラーがあります。確認して修正してください。
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Questions */}
                <div className="space-y-8">
                  <AnimatePresence mode="wait">
                    {currentQuestions.map((question, index) => (
                      <motion.div 
                        key={question.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-4"
                      >
                        <div className="flex items-start gap-4">
                          <motion.div 
                            className="flex-shrink-0"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] p-0.5">
                              <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center font-medium text-sm">
                                {index + 1}
                              </div>
                            </div>
                          </motion.div>
                          <div className="flex-1">
                            <CosmicCard variant="glass" className="p-6">
                              {renderQuestion(question)}
                            </CosmicCard>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <motion.div 
                  className="flex justify-between items-center mt-12 pt-8 border-t border-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CosmicButton
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    variant="glass"
                    icon={<ArrowLeft className="h-4 w-4" />}
                  >
                    前へ
                  </CosmicButton>

                  <span className="text-sm text-muted-foreground font-medium">
                    {currentPage + 1} / {totalPages}
                  </span>

                  <CosmicButton
                    onClick={handleNext}
                    disabled={isSubmitting}
                    variant={currentPage === totalPages - 1 ? "cosmic" : "nebula"}
                    icon={currentPage === totalPages - 1 ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  >
                    {isSubmitting ? (
                      '送信中...'
                    ) : currentPage === totalPages - 1 ? (
                      '送信'
                    ) : (
                      '次へ'
                    )}
                  </CosmicButton>
                </motion.div>
              </div>
            </CosmicCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}