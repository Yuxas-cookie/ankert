'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface LikertResponse {
  value: number
  label: string
  count: number
  percentage: number
}

interface LikertScaleChartProps {
  responses: LikertResponse[]
  question?: string
  totalResponses: number
  scaleType?: 'agreement' | 'satisfaction' | 'frequency' | 'importance' | 'custom'
  showNPS?: boolean
  variant?: 'stacked' | 'grouped' | 'horizontal'
  className?: string
}

const SCALE_COLORS = {
  agreement: [
    '#dc2626', // 強く反対
    '#ea580c', // 反対
    '#d97706', // どちらでもない
    '#65a30d', // 賛成
    '#16a34a'  // 強く賛成
  ],
  satisfaction: [
    '#dc2626', // 非常に不満
    '#ea580c', // 不満
    '#d97706', // 普通
    '#65a30d', // 満足
    '#16a34a'  // 非常に満足
  ],
  frequency: [
    '#dc2626', // 全くない
    '#ea580c', // めったにない
    '#d97706', // 時々
    '#65a30d', // よくある
    '#16a34a'  // いつも
  ],
  importance: [
    '#6b7280', // 重要でない
    '#9ca3af', // あまり重要でない
    '#d97706', // 普通
    '#65a30d', // 重要
    '#16a34a'  // 非常に重要
  ],
  custom: [
    '#dc2626',
    '#ea580c',
    '#d97706',
    '#65a30d',
    '#16a34a'
  ]
}

const calculateNPS = (responses: LikertResponse[]): { score: number; promoters: number; detractors: number; passives: number } => {
  const total = responses.reduce((sum, r) => sum + r.count, 0)
  
  if (total === 0) {
    return { score: 0, promoters: 0, detractors: 0, passives: 0 }
  }

  let promoters = 0
  let detractors = 0
  let passives = 0

  responses.forEach(response => {
    if (response.value >= 9) {
      promoters += response.count
    } else if (response.value <= 6) {
      detractors += response.count
    } else {
      passives += response.count
    }
  })

  const score = ((promoters - detractors) / total) * 100

  return {
    score: Math.round(score),
    promoters: Math.round((promoters / total) * 100),
    detractors: Math.round((detractors / total) * 100),
    passives: Math.round((passives / total) * 100)
  }
}

const calculateSentiment = (responses: LikertResponse[]): { positive: number; neutral: number; negative: number; average: number } => {
  const total = responses.reduce((sum, r) => sum + r.count, 0)
  const maxValue = Math.max(...responses.map(r => r.value))
  const midpoint = Math.ceil(maxValue / 2)

  if (total === 0) {
    return { positive: 0, neutral: 0, negative: 0, average: 0 }
  }

  let positive = 0
  let neutral = 0
  let negative = 0
  let weightedSum = 0

  responses.forEach(response => {
    weightedSum += response.value * response.count
    
    if (response.value > midpoint) {
      positive += response.count
    } else if (response.value < midpoint) {
      negative += response.count
    } else {
      neutral += response.count
    }
  })

  const average = weightedSum / total

  return {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
    average: Number(average.toFixed(2))
  }
}

export const LikertScaleChart: React.FC<LikertScaleChartProps> = ({
  responses,
  question,
  totalResponses,
  scaleType = 'agreement',
  showNPS = false,
  variant = 'grouped',
  className
}) => {
  const colors = SCALE_COLORS[scaleType]
  const sentiment = calculateSentiment(responses)
  const nps = showNPS ? calculateNPS(responses) : null

  const maxValue = Math.max(...responses.map(r => r.value))
  const isNPSScale = maxValue === 10 && responses.length === 10

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm">{data.label}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">回答数: </span>
          <span className="font-medium">{data.count}件</span>
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">割合: </span>
          <span className="font-medium">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    )
  }

  const getSentimentIcon = () => {
    if (sentiment.positive > sentiment.negative) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (sentiment.negative > sentiment.positive) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return <Minus className="h-4 w-4 text-yellow-600" />
  }

  const getSentimentColor = () => {
    if (sentiment.positive > sentiment.negative) return 'text-green-600'
    if (sentiment.negative > sentiment.positive) return 'text-red-600'
    return 'text-yellow-600'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{question || 'リッカート尺度分析'}</CardTitle>
            <CardDescription>
              総回答数: {totalResponses.toLocaleString()}件
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getSentimentIcon()}
            <span className={cn('text-sm font-medium', getSentimentColor())}>
              平均: {sentiment.average}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={responses}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout={variant === 'horizontal' ? 'horizontal' : 'vertical'}
            >
              <CartesianGrid strokeDasharray="3 3" />
              
              {variant === 'horizontal' ? (
                <>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="label" width={80} />
                </>
              ) : (
                <>
                  <XAxis dataKey="label" />
                  <YAxis />
                </>
              )}

              <Tooltip content={<CustomTooltip />} />
              
              <Bar dataKey="count" radius={4}>
                {responses.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {sentiment.positive}%
            </div>
            <div className="text-sm text-muted-foreground">ポジティブ</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {sentiment.neutral}%
            </div>
            <div className="text-sm text-muted-foreground">ニュートラル</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {sentiment.negative}%
            </div>
            <div className="text-sm text-muted-foreground">ネガティブ</div>
          </div>
        </div>

        {/* NPS Score */}
        {nps && isNPSScale && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-3">Net Promoter Score (NPS)</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{nps.score}</div>
                <div className="text-sm text-muted-foreground">NPS</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">{nps.promoters}%</div>
                <div className="text-xs text-muted-foreground">推奨者</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-600">{nps.passives}%</div>
                <div className="text-xs text-muted-foreground">中立者</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">{nps.detractors}%</div>
                <div className="text-xs text-muted-foreground">批判者</div>
              </div>
            </div>
            
            <div className="mt-2">
              <Badge 
                variant={
                  nps.score >= 50 ? 'default' :
                  nps.score >= 0 ? 'secondary' : 'destructive'
                }
              >
                {nps.score >= 50 ? 'Excellent' :
                 nps.score >= 0 ? 'Good' : 'Poor'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Utility function to process Likert scale responses
export const processLikertResponses = (
  responses: Array<{ value: number }>,
  scaleLabels: string[]
): LikertResponse[] => {
  const total = responses.length
  const counts: Record<number, number> = {}

  // Count responses for each value
  responses.forEach(response => {
    counts[response.value] = (counts[response.value] || 0) + 1
  })

  // Create response array
  return scaleLabels.map((label, index) => {
    const value = index + 1
    const count = counts[value] || 0
    const percentage = total > 0 ? (count / total) * 100 : 0

    return {
      value,
      label,
      count,
      percentage
    }
  })
}