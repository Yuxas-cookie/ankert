'use client'

import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { BaseChart, ChartConfig, ChartData, CustomTooltip, CustomLegend } from './BaseChart'

export interface BarChartProps {
  data: ChartData[]
  config?: ChartConfig & {
    xAxisKey?: string
    yAxisKey?: string
    orientation?: 'horizontal' | 'vertical'
    showGrid?: boolean
    showValues?: boolean
    stacked?: boolean
    grouped?: boolean
    barSize?: number
  }
  isLoading?: boolean
  error?: string
  onExport?: () => void
  onExpand?: () => void
  className?: string
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  config = {},
  isLoading,
  error,
  onExport,
  onExpand,
  className
}) => {
  const {
    xAxisKey = 'name',
    yAxisKey = 'value',
    orientation = 'vertical',
    showGrid = true,
    showValues = false,
    stacked = false,
    grouped = false,
    barSize,
    colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'],
    showTooltip = true,
    showLegend = true,
    ...baseConfig
  } = config

  // Process data for multiple series if needed
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    
    // If data has multiple value keys, we need to handle multiple series
    const firstItem = data[0]
    const valueKeys = Object.keys(firstItem).filter(key => 
      key !== xAxisKey && typeof firstItem[key] === 'number'
    )

    if (valueKeys.length <= 1) {
      // Single series
      return data.map(item => ({
        ...item,
        [yAxisKey]: item[yAxisKey] || item[valueKeys[0]] || 0
      }))
    }

    // Multiple series - return as is
    return data
  }, [data, xAxisKey, yAxisKey])

  // Determine if we have multiple series
  const firstItem = processedData[0] || {}
  const valueKeys = Object.keys(firstItem).filter(key => 
    key !== xAxisKey && typeof firstItem[key] === 'number'
  )
  const isMultipleSeries = valueKeys.length > 1

  const formatTooltip = (value: any, name: string): [string, string] => {
    if (typeof value === 'number') {
      return [value.toLocaleString(), name]
    }
    return [String(value), name]
  }

  const renderBars = () => {
    if (isMultipleSeries) {
      return valueKeys.map((key, index) => (
        <Bar
          key={key}
          dataKey={key}
          fill={colors[index % colors.length]}
          stackId={stacked ? 'stack' : undefined}
          maxBarSize={barSize}
        />
      ))
    }

    return (
      <Bar
        dataKey={yAxisKey}
        fill={colors[0]}
        maxBarSize={barSize}
      />
    )
  }

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
      <RechartsBarChart
        data={processedData}
        layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        
        {orientation === 'horizontal' ? (
          <>
            <XAxis type="number" />
            <YAxis type="category" dataKey={xAxisKey} width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey={xAxisKey} />
            <YAxis />
          </>
        )}

        {showTooltip && (
          <Tooltip 
            content={<CustomTooltip formatter={formatTooltip} />}
          />
        )}

        {showLegend && isMultipleSeries && (
          <Legend content={<CustomLegend />} />
        )}

        {renderBars()}
      </RechartsBarChart>
    </BaseChart>
  )
}

// Specialized bar chart for survey responses
export interface SurveyBarChartProps {
  responses: Array<{
    option: string
    count: number
    percentage?: number
  }>
  question?: string
  totalResponses?: number
  showPercentage?: boolean
  config?: ChartConfig
  className?: string
}

export const SurveyBarChart: React.FC<SurveyBarChartProps> = ({
  responses,
  question,
  totalResponses,
  showPercentage = true,
  config = {},
  className
}) => {
  const processedData = React.useMemo(() => {
    const total = totalResponses || responses.reduce((sum, item) => sum + item.count, 0)
    
    return responses.map((response, index) => ({
      name: response.option,
      count: response.count,
      percentage: total > 0 ? (response.count / total * 100) : 0,
      fill: config.colors?.[index % (config.colors?.length || 1)] || `hsl(${index * 360 / responses.length}, 70%, 60%)`
    }))
  }, [responses, totalResponses, config.colors])

  const formatTooltip = (value: any, name: string) => {
    if (name === 'count') {
      const dataPoint = processedData.find(d => d.count === value)
      const percentage = dataPoint?.percentage.toFixed(1) || '0'
      return [`${value}件 (${percentage}%)`, '回答数']
    }
    return [value, name]
  }

  const chartConfig: ChartConfig = {
    title: question,
    description: totalResponses ? `総回答数: ${totalResponses}件` : undefined,
    ...config
  }

  return (
    <BarChart
      data={processedData}
      config={{
        ...chartConfig,
        yAxisKey: 'count',
        showValues: true,
        barSize: 50
      }}
      className={className}
    />
  )
}