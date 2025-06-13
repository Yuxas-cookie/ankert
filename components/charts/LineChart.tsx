'use client'

import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts'
import { BaseChart, ChartConfig, ChartData, CustomTooltip, CustomLegend } from './BaseChart'

export interface LineChartProps {
  data: ChartData[]
  config?: ChartConfig & {
    xAxisKey?: string
    yAxisKey?: string
    showGrid?: boolean
    showDots?: boolean
    showArea?: boolean
    smooth?: boolean
    strokeWidth?: number
    referenceLines?: Array<{
      value: number
      label?: string
      color?: string
    }>
    variant?: 'line' | 'area'
  }
  isLoading?: boolean
  error?: string
  onExport?: () => void
  onExpand?: () => void
  className?: string
}

export const LineChart: React.FC<LineChartProps> = ({
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
    showGrid = true,
    showDots = true,
    showArea = false,
    smooth = true,
    strokeWidth = 2,
    referenceLines = [],
    variant = 'line',
    colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'],
    showTooltip = true,
    showLegend = true,
    ...baseConfig
  } = config

  // Process data for multiple series if needed
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    
    const firstItem = data[0]
    const valueKeys = Object.keys(firstItem).filter(key => 
      key !== xAxisKey && typeof firstItem[key] === 'number'
    )

    if (valueKeys.length <= 1) {
      return data.map(item => ({
        ...item,
        [yAxisKey]: item[yAxisKey] || item[valueKeys[0]] || 0
      }))
    }

    return data
  }, [data, xAxisKey, yAxisKey])

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

  const renderLines = () => {
    if (isMultipleSeries) {
      return valueKeys.map((key, index) => (
        <Line
          key={key}
          type={smooth ? "monotone" : "linear"}
          dataKey={key}
          stroke={colors[index % colors.length]}
          strokeWidth={strokeWidth}
          dot={showDots}
          activeDot={{ r: 6 }}
        />
      ))
    }

    return (
      <Line
        type={smooth ? "monotone" : "linear"}
        dataKey={yAxisKey}
        stroke={colors[0]}
        strokeWidth={strokeWidth}
        dot={showDots}
        activeDot={{ r: 6 }}
      />
    )
  }

  const renderAreas = () => {
    if (isMultipleSeries) {
      return valueKeys.map((key, index) => (
        <Area
          key={key}
          type={smooth ? "monotone" : "linear"}
          dataKey={key}
          stackId="1"
          stroke={colors[index % colors.length]}
          fill={colors[index % colors.length]}
          fillOpacity={0.3}
        />
      ))
    }

    return (
      <Area
        type={smooth ? "monotone" : "linear"}
        dataKey={yAxisKey}
        stroke={colors[0]}
        fill={colors[0]}
        fillOpacity={0.3}
      />
    )
  }

  const ChartComponent = variant === 'area' || showArea ? AreaChart : RechartsLineChart

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
      <ChartComponent
        data={processedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        
        <XAxis 
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
        />

        {showTooltip && (
          <Tooltip 
            content={<CustomTooltip formatter={formatTooltip} />}
          />
        )}

        {showLegend && isMultipleSeries && (
          <Legend content={<CustomLegend />} />
        )}

        {/* Reference lines */}
        {referenceLines.map((refLine, index) => (
          <ReferenceLine
            key={index}
            y={refLine.value}
            stroke={refLine.color || "#ff7300"}
            strokeDasharray="5 5"
            label={refLine.label}
          />
        ))}

        {variant === 'area' || showArea ? renderAreas() : renderLines()}
      </ChartComponent>
    </BaseChart>
  )
}

// Time series chart for survey response trends
export interface TimeSeriesChartProps {
  data: Array<{
    date: string
    responses: number
    cumulative?: number
  }>
  config?: ChartConfig
  showCumulative?: boolean
  className?: string
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  config = {},
  showCumulative = false,
  className
}) => {
  const processedData = React.useMemo(() => {
    let cumulative = 0
    return data.map(item => {
      cumulative += item.responses
      return {
        ...item,
        date: new Date(item.date).toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric'
        }),
        cumulative: showCumulative ? cumulative : item.cumulative
      }
    })
  }, [data, showCumulative])

  const valueKeys = showCumulative ? ['responses', 'cumulative'] : ['responses']

  const chartConfig: ChartConfig = {
    title: '回答数の推移',
    colors: ['#8884d8', '#82ca9d'],
    ...config
  }

  return (
    <LineChart
      data={processedData}
      config={{
        ...chartConfig,
        xAxisKey: 'date',
        showDots: true,
        smooth: true
      }}
      className={className}
    />
  )
}

// Rating trend chart for surveys with ratings over time
export interface RatingTrendChartProps {
  data: Array<{
    period: string
    averageRating: number
    totalResponses: number
  }>
  maxRating?: number
  config?: ChartConfig
  className?: string
}

export const RatingTrendChart: React.FC<RatingTrendChartProps> = ({
  data,
  maxRating = 5,
  config = {},
  className
}) => {
  const chartConfig: ChartConfig = {
    title: '評価の推移',
    description: `平均評価 (最大${maxRating}点)`,
    colors: ['#8884d8'],
    ...config
  }

  const referenceLines = [
    { value: maxRating / 2, label: '中央値', color: '#ffc658' },
    { value: maxRating * 0.8, label: '良好ライン', color: '#82ca9d' }
  ]

  return (
    <LineChart
      data={data}
      config={{
        ...chartConfig,
        xAxisKey: 'period',
        yAxisKey: 'averageRating',
        referenceLines,
        showDots: true,
        smooth: true
      }}
      className={className}
    />
  )
}