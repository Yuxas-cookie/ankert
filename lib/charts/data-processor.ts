import { ChartData, ChartConfig, DataSeries, DataPoint } from '@/types/charts';
import { format } from 'date-fns';

export function processChartData(data: ChartData, config: ChartConfig): ChartData {
  const processedSeries = data.series.map(series => {
    return processSeries(series, config);
  });

  return {
    ...data,
    series: processedSeries
  };
}

function processSeries(series: DataSeries, config: ChartConfig): DataSeries {
  let processedData = [...series.data];

  // Sort data if needed
  processedData = sortDataPoints(processedData, config);

  // Format data points based on chart type
  processedData = formatDataPoints(processedData, config);

  // Apply aggregation if needed
  processedData = aggregateDataPoints(processedData, config);

  return {
    ...series,
    data: processedData
  };
}

function sortDataPoints(dataPoints: DataPoint[], config: ChartConfig): DataPoint[] {
  switch (config.type) {
    case 'line':
      // Sort by x-axis for line charts
      return dataPoints.sort((a, b) => {
        if (a.x instanceof Date && b.x instanceof Date) {
          return a.x.getTime() - b.x.getTime();
        }
        if (typeof a.x === 'number' && typeof b.x === 'number') {
          return a.x - b.x;
        }
        return String(a.x).localeCompare(String(b.x));
      });
    
    case 'bar':
      // Sort by value for bar charts (optional)
      return config.axes?.y?.domain ? 
        dataPoints.sort((a, b) => Number(b.y) - Number(a.y)) : 
        dataPoints;
    
    case 'pie':
      // Sort by value descending for pie charts
      return dataPoints.sort((a, b) => Number(b.y) - Number(a.y));
    
    default:
      return dataPoints;
  }
}

function formatDataPoints(dataPoints: DataPoint[], config: ChartConfig): DataPoint[] {
  return dataPoints.map(point => {
    let formattedPoint = { ...point };

    // Format dates
    if (point.x instanceof Date) {
      formattedPoint.label = formattedPoint.label || format(point.x, 'MMM dd');
    }

    // Format numbers
    if (typeof point.y === 'number') {
      formattedPoint.y = Math.round(point.y * 100) / 100; // Round to 2 decimal places
    }

    // Add default label if missing
    if (!formattedPoint.label) {
      formattedPoint.label = String(point.x);
    }

    return formattedPoint;
  });
}

function aggregateDataPoints(dataPoints: DataPoint[], config: ChartConfig): DataPoint[] {
  // For now, return as is. This could be extended for aggregation logic
  return dataPoints;
}

// Utility functions for specific chart types
export function prepareLineChartData(data: ChartData): any[] {
  if (data.series.length === 0) return [];

  // Combine all series data points by x-value
  const combinedData: Record<string, any> = {};

  data.series.forEach(series => {
    series.data.forEach(point => {
      const key = String(point.x);
      if (!combinedData[key]) {
        combinedData[key] = { x: point.x, label: point.label || key };
      }
      combinedData[key][series.id] = point.y;
    });
  });

  return Object.values(combinedData);
}

export function preparePieChartData(data: ChartData): any[] {
  if (data.series.length === 0) return [];

  const series = data.series[0]; // Pie charts typically use first series only
  return series.data.map(point => ({
    name: point.label || String(point.x),
    value: Number(point.y),
    label: point.label
  }));
}

export function prepareBarChartData(data: ChartData): any[] {
  return prepareLineChartData(data); // Same format as line chart
}

// Statistical calculations
export function calculateSum(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return calculateSum(values) / values.length;
}

export function calculatePercentages(values: number[]): number[] {
  const total = calculateSum(values);
  if (total === 0) return values.map(() => 0);
  return values.map(value => (value / total) * 100);
}

// Color utilities
export function generateColors(count: number, baseColors?: string[]): string[] {
  const defaultColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const colors = baseColors || defaultColors;
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
}

// Data transformation utilities
export function transformResponseDataToChart(responses: any[], questionId: string): ChartData {
  // Group responses by answer value
  const answerCounts: Record<string, number> = {};
  
  responses.forEach(response => {
    const answer = response.answers?.find((a: any) => a.questionId === questionId);
    if (answer && answer.value) {
      const key = String(answer.value);
      answerCounts[key] = (answerCounts[key] || 0) + 1;
    }
  });

  const dataPoints: DataPoint[] = Object.entries(answerCounts).map(([key, count]) => ({
    x: key,
    y: count,
    label: key
  }));

  return {
    series: [{
      id: 'responses',
      name: 'Response Count',
      data: dataPoints
    }]
  };
}