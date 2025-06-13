'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SurveyCard } from '@/components/survey/SurveyCard'
import { SurveyListHeader } from '@/components/survey/SurveyListHeader'
import { SurveyEmptyState } from '@/components/survey/SurveyEmptyState'
import { SurveyLoadingState } from '@/components/survey/SurveyLoadingState'
import { surveyService } from '@/lib/supabase/surveys'
import { Survey } from '@/types/survey'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SurveysPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Survey['status']>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  

  const userId = user?.id

  useEffect(() => {
    if (!userId) {
      router.push('/login')
      return
    }
    loadSurveys()
  }, [userId, router])

  useEffect(() => {
    filterSurveys()
  }, [surveys, searchTerm, statusFilter])

  const loadSurveys = async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      const { data, error } = await surveyService.getSurveys(userId)
      
      if (error) throw error
      
      setSurveys(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const filterSurveys = () => {
    let filtered = surveys

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(survey =>
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(survey => survey.status === statusFilter)
    }

    setFilteredSurveys(filtered)
  }

  const handleEdit = (id: string) => {
    // Navigate to edit page using Next.js router
    router.push(`/surveys/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このアンケートを削除してもよろしいですか？')) return

    try {
      if (!userId) {
        throw new Error('ユーザーIDが見つかりません')
      }
      const { error } = await surveyService.deleteSurvey(id, userId)
      if (error) throw error
      
      // Remove from local state
      setSurveys(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      if (!userId) {
        throw new Error('ユーザーIDが見つかりません')
      }
      const { data, error } = await surveyService.duplicateSurvey(id, userId)
      if (error) throw error
      
      if (data) {
        setSurveys(prev => [data, ...prev])
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '複製に失敗しました')
    }
  }

  const handlePublish = async (id: string) => {
    if (!confirm('このアンケートを公開してもよろしいですか？')) return

    try {
      if (!userId) {
        throw new Error('ユーザーIDが見つかりません')
      }
      const { data, error } = await surveyService.publishSurvey(id, userId)
      if (error) throw error
      
      if (data) {
        setSurveys(prev => prev.map(s => s.id === id ? data : s))
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '公開に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <SurveyListHeader
          searchTerm=""
          onSearchChange={() => {}}
          statusFilter="all"
          onStatusFilterChange={() => {}}
        />
        <div className="mt-8">
          <SurveyLoadingState />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {error}
          </AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <CosmicButton onClick={loadSurveys} variant="glass" icon={<RefreshCw className="w-4 h-4" />}>
            再読み込み
          </CosmicButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Static Background */}
      <div className="fixed inset-0 bg-background -z-10" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Primary gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--cosmic-star)]/6 via-transparent to-[var(--cosmic-nebula)]/5" />
        
        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--cosmic-aurora)]/3 to-transparent" />
        
        {/* Accent gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-bl from-[var(--cosmic-solar)]/2 via-transparent to-[var(--cosmic-galaxy)]/3" />
      </div>

      <div className="relative container mx-auto py-8 px-4">
        {/* Header with cosmic effects */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <SurveyListHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => setStatusFilter(value as any)}
          />
        </motion.div>

        {/* Survey Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: '全アンケート', value: surveys.length, color: 'text-[var(--cosmic-star)]' },
            { label: '公開中', value: surveys.filter(s => s.status === 'published').length, color: 'text-[var(--cosmic-aurora)]' },
            { label: '下書き', value: surveys.filter(s => s.status === 'draft').length, color: 'text-[var(--cosmic-solar)]' },
            { label: 'アーカイブ', value: surveys.filter(s => s.status === 'archived').length, color: 'text-muted-foreground' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <CosmicCard variant="glass" className="p-4 text-center">
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CosmicCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Survey Grid */}
        <div className="mt-8">
          {filteredSurveys.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <SurveyEmptyState 
                hasSurveys={surveys.length > 0} 
                searchTerm={searchTerm}
              />
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {filteredSurveys.map((survey, index) => (
                  <motion.div
                    key={survey.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <SurveyCard
                      survey={survey}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      onPublish={handlePublish}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Floating action button */}
        <motion.div
          className="fixed bottom-8 right-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.6 }}
        >
          <CosmicButton 
            variant="nebula" 
            size="lg"
            icon={<Sparkles className="w-5 h-5" />}
            className="shadow-2xl"
            onClick={() => router.push('/surveys/new')}
          >
            新規作成
          </CosmicButton>
        </motion.div>
      </div>
    </div>
  )
}