'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { Badge } from '@/components/ui/badge'
import { Survey } from '@/types/survey'
import { formatDate, truncateText } from '@/lib/utils'
import { 
  Edit2, 
  Trash2, 
  Copy, 
  Globe, 
  Calendar,
  RefreshCw,
  FileText,
  BarChart
} from 'lucide-react'

interface SurveyCardProps {
  survey: Survey
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onPublish?: (id: string) => void
}

export function SurveyCard({
  survey,
  onEdit,
  onDelete,
  onDuplicate,
  onPublish
}: SurveyCardProps) {
  const getStatusBadge = (status: Survey['status']) => {
    const variants = {
      draft: { 
        variant: 'secondary' as const, 
        label: '下書き',
        color: 'bg-[var(--cosmic-solar)]/10 text-[var(--cosmic-solar)] border-[var(--cosmic-solar)]/20'
      },
      published: { 
        variant: 'default' as const, 
        label: '公開中',
        color: 'bg-[var(--cosmic-aurora)]/10 text-[var(--cosmic-aurora)] border-[var(--cosmic-aurora)]/20'
      },
      closed: { 
        variant: 'destructive' as const, 
        label: '終了',
        color: 'bg-destructive/10 text-destructive border-destructive/20'
      },
      archived: { 
        variant: 'outline' as const, 
        label: 'アーカイブ',
        color: 'bg-muted/50 text-muted-foreground border-border/50'
      }
    }

    const { variant, label, color } = variants[status]
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Badge variant={variant} className={color}>
          {label}
        </Badge>
      </motion.div>
    )
  }

  const handleAction = (action: (() => void) | undefined, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    action?.()
  }

  // Get card variant based on status
  const getCardVariant = () => {
    switch (survey.status) {
      case 'published':
        return 'aurora'
      case 'draft':
        return 'nebula'
      default:
        return 'glass'
    }
  }

  return (
    <Link href={`/surveys/${survey.id}`}>
      <CosmicCard 
        variant={getCardVariant()} 
        className="h-full group transition-all duration-300 hover:shadow-2xl cursor-pointer"
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {truncateText(survey.title, 50)}
              </h3>
              {getStatusBadge(survey.status)}
            </div>
            <motion.div
              className="ml-2"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <FileText className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>

          {/* Description */}
          {survey.description && (
            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              {truncateText(survey.description, 100)}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(survey.created_at)}</span>
            </div>
            {survey.updated_at !== survey.created_at && (
              <div className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                <span>{formatDate(survey.updated_at)}</span>
              </div>
            )}
          </div>


          {/* Actions */}
          <div className="flex gap-2 flex-wrap mt-auto">
            {onEdit && (
              <CosmicButton
                size="sm"
                variant="glass"
                onClick={(e) => handleAction(() => onEdit(survey.id), e)}
                icon={<Edit2 className="w-3 h-3" />}
              >
                編集
              </CosmicButton>
            )}
            
            {survey.status === 'draft' && onPublish && (
              <CosmicButton
                size="sm"
                variant="cosmic"
                onClick={(e) => handleAction(() => onPublish(survey.id), e)}
                icon={<Globe className="w-3 h-3" />}
              >
                公開
              </CosmicButton>
            )}
            
            {onDuplicate && (
              <CosmicButton
                size="sm"
                variant="glass"
                onClick={(e) => handleAction(() => onDuplicate(survey.id), e)}
                icon={<Copy className="w-3 h-3" />}
              >
                複製
              </CosmicButton>
            )}
            
            {onDelete && (
              <motion.button
                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                onClick={(e) => handleAction(() => onDelete(survey.id), e)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Response counter (if available) */}
          {survey.status === 'published' && (
            <motion.div
              className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--cosmic-aurora)]/10 text-[var(--cosmic-aurora)]"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <BarChart className="w-3 h-3" />
              <span className="text-xs font-medium">0 回答</span>
            </motion.div>
          )}
        </div>
      </CosmicCard>
    </Link>
  )
}