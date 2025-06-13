import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { Input } from '@/components/ui/input'
import { PlusCircle, Search, Filter } from 'lucide-react'

interface SurveyListHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
}

export function SurveyListHeader({ 
  searchTerm, 
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: SurveyListHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title and Action */}
      <div className="flex items-center justify-between">
        <motion.h1 
          className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--cosmic-nebula)] via-[var(--cosmic-star)] to-[var(--cosmic-aurora)]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          アンケート一覧
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/surveys/new">
            <CosmicButton variant="nebula" icon={<PlusCircle className="h-4 w-4" />}>
              新しいアンケートを作成
            </CosmicButton>
          </Link>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="アンケートを検索..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-border/50 rounded-md bg-card/50 backdrop-blur-sm text-foreground focus:border-primary/50 appearance-none cursor-pointer"
          >
            <option value="all" className="bg-card text-foreground">全てのステータス</option>
            <option value="draft" className="bg-card text-foreground">下書き</option>
            <option value="published" className="bg-card text-foreground">公開中</option>
            <option value="closed" className="bg-card text-foreground">終了</option>
            <option value="archived" className="bg-card text-foreground">アーカイブ</option>
          </select>
        </div>
      </motion.div>
    </div>
  )
}