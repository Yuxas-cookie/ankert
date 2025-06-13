import { ChartData, ChartType } from '@/types/charts';

export function validateChartData(data: ChartData, chartType: ChartType): boolean {
  if (!data || !data.series || data.series.length === 0) {
    return false;
  }

  // Check each series
  for (const series of data.series) {
    if (!series.id || !series.name || !Array.isArray(series.data)) {
      return false;
    }

    // Validate data points based on chart type
    if (!validateDataPoints(series.data, chartType)) {
      return false;
    }
  }

  return true;
}

function validateDataPoints(dataPoints: any[], chartType: ChartType): boolean {
  if (dataPoints.length === 0) {
    return false;
  }

  for (const point of dataPoints) {
    if (!point || typeof point !== 'object') {
      return false;
    }

    // All chart types need x and y values
    if (point.x === undefined || point.y === undefined) {
      return false;
    }

    // Type-specific validations
    switch (chartType) {
      case 'line':
      case 'bar':
        if (typeof point.y !== 'number') {
          return false;
        }
        break;
      
      case 'pie':
        if (typeof point.y !== 'number' || point.y < 0) {
          return false;
        }
        break;
      
      case 'scatter':
        if (typeof point.x !== 'number' || typeof point.y !== 'number') {
          return false;
        }
        break;
    }
  }

  return true;
}

export function validateChartConfig(config: any): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }

  // Required fields
  if (!config.type) {
    return false;
  }

  // Valid chart types
  const validTypes: ChartType[] = ['line', 'bar', 'pie', 'scatter', 'funnel', 'likert', 'heatmap', 'wordcloud'];
  if (!validTypes.includes(config.type)) {
    return false;
  }

  // Optional field validations
  if (config.width !== undefined && typeof config.width !== 'number' && typeof config.width !== 'string') {
    return false;
  }

  if (config.height !== undefined && typeof config.height !== 'number' && typeof config.height !== 'string') {
    return false;
  }

  return true;
}

export function sanitizeChartData(data: ChartData): ChartData {
  return {
    ...data,
    series: data.series.map(series => ({
      ...series,
      data: series.data.filter(point => 
        point.x !== undefined && 
        point.y !== undefined &&
        !isNaN(Number(point.y))
      )
    }))
  };
}