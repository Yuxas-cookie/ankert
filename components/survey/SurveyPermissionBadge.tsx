'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Globe, Lock, Users, User } from 'lucide-react'
import type { SurveyPermissionType } from '@/lib/validations/survey-permissions'

interface SurveyPermissionBadgeProps {
  permissionType: SurveyPermissionType
  hasPassword?: boolean
  userCount?: number
  isActive?: boolean
}

const permissionConfig = {
  public: {
    label: '一般公開',
    icon: Globe,
    color: 'default' as const,
    description: '誰でも回答できます'
  },
  url_access: {
    label: 'URL限定',
    icon: Lock,
    color: 'secondary' as const,
    description: 'URLを知っている人のみ回答できます'
  },
  authenticated: {
    label: 'ログイン必須',
    icon: User,
    color: 'outline' as const,
    description: 'ログインユーザーのみ回答できます'
  },
  restricted: {
    label: '特定ユーザー',
    icon: Users,
    color: 'destructive' as const,
    description: '指定されたユーザーのみ回答できます'
  }
}

export function SurveyPermissionBadge({ 
  permissionType, 
  hasPassword = false, 
  userCount,
  isActive = true 
}: SurveyPermissionBadgeProps) {
  const config = permissionConfig[permissionType]
  const Icon = config.icon

  const badgeContent = (
    <Badge 
      variant={config.color} 
      className={`flex items-center gap-1 ${!isActive ? 'opacity-50' : ''}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
      {hasPassword && <Lock className="h-3 w-3 ml-1" />}
      {permissionType === 'restricted' && userCount !== undefined && (
        <span className="ml-1">({userCount}名)</span>
      )}
    </Badge>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p>{config.description}</p>
            {hasPassword && <p className="text-xs">パスワード保護あり</p>}
            {!isActive && <p className="text-xs text-yellow-500">期間外または無効</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}