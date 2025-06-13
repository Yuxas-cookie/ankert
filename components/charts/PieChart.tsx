'use client'

import React from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { BaseChart, ChartConfig, ChartData, CustomTooltip, CustomLegend } from './BaseChart'

export interface PieChartProps {
  data: ChartData[]
  config?: ChartConfig & {
    valueKey?: string
    labelKey?: string
    innerRadius?: number
    outerRadius?: number
    showLabels?: boolean
    showValues?: boolean
    showPercentages?: boolean
    variant?: 'pie' | 'donut'
  }
  isLoading?: boolean
  error?: string
  onExport?: () => void
  onExpand?: () => void
  className?: string
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  config = {},
  isLoading,
  error,
  onExport,
  onExpand,
  className
}) => {
  const {
    valueKey = 'value',
    labelKey = 'name',
    innerRadius = 0,
    outerRadius = 80,
    showLabels = true,
    showValues = false,
    showPercentages = true,
    variant = 'pie',
    colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
    showTooltip = true,
    showLegend = true,
    ...baseConfig
  } = config

  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    
    const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0)
    
    return data.map((item, index) => ({
      ...item,
      name: item[labelKey] || item.name || `Item ${index + 1}`,
      value: item[valueKey] || 0,
      percentage: total > 0 ? ((item[valueKey] || 0) / total * 100) : 0,
      fill: colors[index % colors.length]
    }))
  }, [data, valueKey, labelKey, colors])

  const formatTooltip = (value: any, name: string): [string, string] => {
    if (typeof value === 'number') {
      return [value.toLocaleString(), name]
    }
    return [String(value), name]
  }

  const renderCustomLabel = (entry: any) => {
    if (!showLabels) return null
    
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2
    const x = entry.cx + radius * Math.cos(-entry.midAngle * Math.PI / 180)
    const y = entry.cy + radius * Math.sin(-entry.midAngle * Math.PI / 180)

    let label = entry.name
    if (showValues) {
      label += `: ${entry.value}`
    }
    if (showPercentages) {
      label += ` (${entry.percentage.toFixed(1)}%)`
    }

    return (
      <text
        x={x}
        y={y}
        fill={entry.fill}
        textAnchor={x > entry.cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        className="fill-foreground"
      >
        {label}
      </text>
    )
  }

  const actualInnerRadius = variant === 'donut' ? Math.max(innerRadius, 40) : innerRadius

  return (
    <BaseChart
      data={processedData}
      config={baseConfig}
      isLoading={isLoading}
      error={error}
      onExport={onExport}
      onExpand={onExpand}
      className={className}
    >
      <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderCustomLabel : false}
          outerRadius={outerRadius}
          innerRadius={actualInnerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>

        {showTooltip && (
          <Tooltip 
            content={<CustomTooltip formatter={formatTooltip} />}
          />
        )}

        {showLegend && (
          <Legend content={<CustomLegend />} />
        )}
      </RechartsPieChart>
    </BaseChart>
  )
}

// Specialized donut chart component
export const DonutChart: React.FC<Omit<PieChartProps, 'config'> & { config?: Omit<PieChartProps['config'], 'variant'> }> = (props) => {
  return (
    <PieChart
      {...props}
      config={{
        ...props.config,
        variant: 'donut',
        innerRadius: 50,
        outerRadius: 100
      }}
    />
  )
}

// Survey-specific pie chart for response distribution
export interface SurveyPieChartProps {
  responses: Array<{
    option: string
    count: number
  }>
  question?: string
  totalResponses?: number
  variant?: 'pie' | 'donut'
  config?: ChartConfig
  className?: string
}

export const SurveyPieChart: React.FC<SurveyPieChartProps> = ({
  responses,
  question,
  totalResponses,
  variant = 'donut',
  config = {},
  className
}) => {
  const total = totalResponses || responses.reduce((sum, item) => sum + item.count, 0)
  
  const processedData = responses.map((response, index) => ({
    name: response.option,
    value: response.count,
    percentage: total > 0 ? (response.count / total * 100) : 0,
    fill: config.colors?.[index % (config.colors?.length || 1)] || 
          `hsl(${index * 360 / responses.length}, 70%, 60%)`
  }))

  const chartConfig: ChartConfig = {
    title: question,
    description: totalResponses ? `総回答数: ${totalResponses}件` : undefined,
    ...config
  }

  // Center label for donut chart
  const CenterLabel = variant === 'donut' ? (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold">{total}</div>
        <div className="text-sm text-muted-foreground">総回答数</div>
      </div>
    </div>
  ) : null

  return (
    <div className="relative">
      <PieChart
        data={processedData}
        config={{
          ...chartConfig,
          variant,
          showLabels: variant === 'pie',
          showPercentages: true
        }}
        className={className}
      />
      {CenterLabel}
    </div>
  )
}