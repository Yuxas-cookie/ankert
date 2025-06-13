'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { 
  PlusCircle, 
  FileText, 
  BarChart3, 
  Activity,
  Sparkles,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({
    totalSurveys: 12,
    totalResponses: 348,
    activeUsers: 89,
    avgCompletionRate: 76
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  const dashboardCards = [
    {
      title: 'アンケート作成',
      description: '新しいアンケートを作成して回答を収集しましょう',
      icon: PlusCircle,
      href: '/surveys/new',
      variant: 'nebula' as const,
      action: '新規作成',
      color: 'from-[var(--cosmic-nebula)] to-[var(--cosmic-star)]'
    },
    {
      title: '作成済みアンケート',
      description: 'これまでに作成したアンケートを管理',
      icon: FileText,
      href: '/surveys',
      variant: 'aurora' as const,
      action: '一覧を見る',
      color: 'from-[var(--cosmic-aurora)] to-[var(--cosmic-star)]'
    },
    {
      title: '回答分析',
      description: '収集した回答の分析とレポート表示',
      icon: BarChart3,
      href: '/surveys',
      variant: 'titanium' as const,
      action: '分析を開始',
      color: 'from-[var(--cosmic-galaxy)] to-[var(--cosmic-nebula)]'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Static Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--cosmic-nebula)]/6 via-transparent to-[var(--cosmic-star)]/5" />
        
        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--cosmic-aurora)]/4 to-transparent" />
        
        {/* Accent gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-bl from-[var(--cosmic-solar)]/3 via-transparent to-[var(--cosmic-galaxy)]/4" />
      </div>

      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--cosmic-nebula)] via-[var(--cosmic-star)] to-[var(--cosmic-aurora)]">
              ダッシュボード
            </h1>
            <motion.div
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
              whileHover={{ scale: 1.02 }}
            >
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono text-foreground">
                {currentTime.toLocaleTimeString('ja-JP', { hour12: false })}
              </span>
            </motion.div>
          </div>
          <p className="text-lg text-muted-foreground">
            ようこそ、<span className="text-foreground font-medium">{user?.email}</span> さん
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { label: 'アンケート数', value: stats.totalSurveys, icon: FileText, trend: '+12%', color: 'text-[var(--cosmic-nebula)]' },
            { label: '総回答数', value: stats.totalResponses, icon: Activity, trend: '+24%', color: 'text-[var(--cosmic-star)]' },
            { label: 'アクティブユーザー', value: stats.activeUsers, icon: Users, trend: '+8%', color: 'text-[var(--cosmic-aurora)]' },
            { label: '完了率', value: `${stats.avgCompletionRate}%`, icon: TrendingUp, trend: '+5%', color: 'text-[var(--cosmic-solar)]' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <CosmicCard variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-xs text-[var(--cosmic-aurora)]">{stat.trend}</span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CosmicCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link href={card.href}>
                <CosmicCard variant={card.variant} className="h-full p-8 group cursor-pointer">
                  <div className="flex flex-col h-full">
                    {/* Icon with gradient background */}
                    <div className="relative mb-6">
                      <motion.div 
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} p-0.5`}
                        whileHover={{ rotate: 5, scale: 1.05 }}
                      >
                        <div className="w-full h-full rounded-[14px] bg-background/90 flex items-center justify-center">
                          <card.icon className="w-8 h-8 text-foreground" />
                        </div>
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50 blur-xl"
                        style={{
                          background: `linear-gradient(to bottom right, ${card.color})`,
                        }}
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
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 flex-grow">
                      {card.description}
                    </p>
                    
                    {/* Action Button */}
                    <div className="flex items-center gap-2 text-primary">
                      <span className="font-medium">{card.action}</span>
                      <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                    </div>
                  </div>
                </CosmicCard>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>最終ログイン: 今日</span>
          </div>
          <CosmicButton variant="glass" size="sm" onClick={handleSignOut}>
            ログアウト
          </CosmicButton>
        </motion.div>
      </div>
    </div>
  )
}