'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingDown, Users, AlertTriangle } from 'lucide-react'

export interface FunnelStep {
  id: string
  label: string
  count: number
  percentage: number
  dropoffRate?: number
}

interface ResponseFunnelProps {
  steps: FunnelStep[]
  title?: string
  totalStarted: number
  variant?: 'default' | 'compact'
  onStepClick?: (step: FunnelStep) => void
  className?: string
}

const FunnelBar: React.FC<{
  step: FunnelStep
  maxCount: number
  index: number
  onClick?: () => void
  variant: 'default' | 'compact'
}> = ({ step, maxCount, index, onClick, variant }) => {
  const width = maxCount > 0 ? (step.count / maxCount) * 100 : 0
  const isLowConversion = step.percentage < 50
  const hasSignificantDropoff = (step.dropoffRate || 0) > 30

  return (
    <div 
      className={cn(
        'group relative',
        onClick && 'cursor-pointer hover:bg-muted/50',
        variant === 'compact' ? 'p-2' : 'p-4'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {index + 1}
          </span>
          {hasSignificantDropoff && (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">
            {step.count.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {step.percentage.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mb-2">
        <h4 className={cn(
          'font-medium truncate',
          variant === 'compact' ? 'text-sm' : 'text-base'
        )}>
          {step.label}
        </h4>
      </div>

      {/* Progress bar */}
      <div className="relative h-6 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 rounded-full',
            isLowConversion 
              ? 'bg-gradient-to-r from-red-500 to-orange-500'
              : step.percentage > 80
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          )}
          style={{ width: `${width}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white mix-blend-difference">
            {step.count.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Dropout indicator */}
      {step.dropoffRate && step.dropoffRate > 0 && variant === 'default' && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingDown className="h-3 w-3" />
          <span>離脱率: {step.dropoffRate.toFixed(1)}%</span>
        </div>
      )}
    </div>
  )
}

export const ResponseFunnel: React.FC<ResponseFunnelProps> = ({
  steps,
  title = 'アンケート回答フロー',
  totalStarted,
  variant = 'default',
  onStepClick,
  className
}) => {
  const maxCount = Math.max(...steps.map(step => step.count))
  const completionRate = totalStarted > 0 
    ? ((steps[steps.length - 1]?.count || 0) / totalStarted * 100)
    : 0

  const overallDropoffPoints = steps.filter(step => (step.dropoffRate || 0) > 20)

  return (
    <Card className={cn(className)}>
      <CardHeader className={variant === 'compact' ? 'pb-3' : undefined}>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className={variant === 'compact' ? 'text-lg' : undefined}>
              {title}
            </CardTitle>
            <CardDescription>
              総開始数: {totalStarted.toLocaleString()}件 
              | 完了率: {completionRate.toFixed(1)}%
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">回答者の流れ</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={variant === 'compact' ? 'pt-0' : undefined}>
        <div className="space-y-1">
          {steps.map((step, index) => (
            <FunnelBar
              key={step.id}
              step={step}
              maxCount={maxCount}
              index={index}
              onClick={onStepClick ? () => onStepClick(step) : undefined}
              variant={variant}
            />
          ))}
        </div>

        {/* Summary section */}
        {variant === 'default' && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {completionRate.toFixed(1)}%
                </div>
                <div className="text-muted-foreground">完了率</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {steps.length}
                </div>
                <div className="text-muted-foreground">総ステップ数</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {overallDropoffPoints.length}
                </div>
                <div className="text-muted-foreground">課題ポイント</div>
              </div>
            </div>

            {overallDropoffPoints.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  改善推奨ポイント
                </h5>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {overallDropoffPoints.map((step, index) => (
                    <li key={step.id} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      <span>
                        {step.label}: 離脱率 {step.dropoffRate?.toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Utility function to calculate funnel data from responses
export const calculateFunnelData = (
  questions: Array<{ id: string; title: string; required: boolean }>,
  responses: Array<{ answers: Array<{ questionId: string }> }>
): FunnelStep[] => {
  const totalStarted = responses.length

  return questions.map((question, index) => {
    const answeredCount = responses.filter(response =>
      response.answers.some(answer => answer.questionId === question.id)
    ).length

    const percentage = totalStarted > 0 ? (answeredCount / totalStarted) * 100 : 0
    
    // Calculate dropoff rate compared to previous step
    let dropoffRate = 0
    if (index > 0) {
      const previousCount = responses.filter(response =>
        response.answers.some(answer => answer.questionId === questions[index - 1].id)
      ).length
      
      if (previousCount > 0) {
        dropoffRate = ((previousCount - answeredCount) / previousCount) * 100
      }
    } else {
      // First question dropoff is those who started but didn't answer
      dropoffRate = totalStarted > 0 ? ((totalStarted - answeredCount) / totalStarted) * 100 : 0
    }

    return {
      id: question.id,
      label: question.title,
      count: answeredCount,
      percentage,
      dropoffRate: Math.max(0, dropoffRate)
    }
  })
}