'use client'

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'
import { Download, Maximize } from 'lucide-react'

export interface ChartData {
  [key: string]: any
}

export interface ChartConfig {
  title?: string
  description?: string
  width?: number | string
  height?: number | string
  showLegend?: boolean
  showTooltip?: boolean
  colors?: string[]
  className?: string
}

interface BaseChartProps {
  data: ChartData[]
  config?: ChartConfig
  isLoading?: boolean
  error?: string
  onExport?: () => void
  onExpand?: () => void
  children: React.ReactNode
  className?: string
}

const DEFAULT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
]

export const BaseChart: React.FC<BaseChartProps> = ({
  data,
  config = {},
  isLoading = false,
  error,
  onExport,
  onExpand,
  children,
  className
}) => {
  const {
    title,
    description,
    width = '100%',
    height = 400,
    showLegend = true,
    showTooltip = true,
    colors = DEFAULT_COLORS,
    className: configClassName
  } = config

  const isEmpty = !data || data.length === 0

  if (isLoading) {
    return (
      <Card className={cn('p-6', className, configClassName)}>
        <div className="flex items-center justify-center" style={{ height }}>
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('p-6', className, configClassName)}>
        <div className="flex items-center justify-center text-destructive" style={{ height }}>
          <div className="text-center">
            <p className="font-medium">エラーが発生しました</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (isEmpty) {
    return (
      <Card className={cn('p-6', className, configClassName)}>
        <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
          <div className="text-center">
            <p className="font-medium">データがありません</p>
            <p className="text-sm mt-1">表示するデータがまだありません。</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn(className, configClassName)}>
      {(title || description || onExport || onExpand) && (
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              {title && <CardTitle className="text-lg">{title}</CardTitle>}
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
            {(onExport || onExpand) && (
              <div className="flex gap-2">
                {onExpand && (
                  <Button variant="outline" size="icon" onClick={onExpand}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                )}
                {onExport && (
                  <Button variant="outline" size="icon" onClick={onExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width={width} height={height}>
          {React.isValidElement(children) ? children : <div />}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Utility functions for chart data processing
export const processChartData = (data: any[], valueKey: string, labelKey: string = 'label') => {
  return data.map((item, index) => ({
    ...item,
    name: item[labelKey] || item.name || `Item ${index + 1}`,
    value: item[valueKey] || item.value || 0,
    fill: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }))
}

export const calculatePercentages = (data: ChartData[]) => {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0)
  return data.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value || 0) / total * 100).toFixed(1) : 0
  }))
}

// Custom tooltip component
export const CustomTooltip: React.FC<{
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: any, name: string) => [string, string]
}> = ({ active, payload, label, formatter }) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      {label && (
        <p className="font-medium text-sm mb-2">{label}</p>
      )}
      {payload.map((entry, index) => {
        const [displayValue, displayName] = formatter 
          ? formatter(entry.value, entry.name)
          : [entry.value, entry.name]
        
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{displayName}:</span>
            <span className="font-medium">{displayValue}</span>
          </div>
        )
      })}
    </div>
  )
}

// Custom legend component
export const CustomLegend: React.FC<{
  payload?: any[]
  align?: 'left' | 'center' | 'right'
}> = ({ payload, align = 'center' }) => {
  if (!payload || payload.length === 0) {
    return null
  }

  return (
    <div className={cn(
      'flex flex-wrap gap-4 mt-4',
      align === 'center' && 'justify-center',
      align === 'right' && 'justify-end'
    )}>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}