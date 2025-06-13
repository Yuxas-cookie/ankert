'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsData, TimeSeriesData, QuestionMetric } from '@/types/charts';
import { DateRange, FilterOptions } from '@/components/analytics/NavigationControls';

// Mock data generator for development
const generateMockAnalyticsData = (surveyId: string, dateRange: DateRange): AnalyticsData => {
  const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate mock trends
  const trends: TimeSeriesData[] = [];
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(dateRange.start.getTime() + i * 24 * 60 * 60 * 1000);
    trends.push({
      timestamp: date,
      value: Math.floor(Math.random() * 50) + 10, // Random responses per day
      label: date.toLocaleDateString()
    });
  }

  // Generate mock question metrics
  const questionMetrics: QuestionMetric[] = [
    {
      questionId: 'q1',
      question: 'How satisfied are you with our service?',
      responseRate: 95.2,
      avgTime: 45,
      dropOffRate: 2.1
    },
    {
      questionId: 'q2',
      question: 'What is your age range?',
      responseRate: 88.7,
      avgTime: 30,
      dropOffRate: 6.5
    },
    {
      questionId: 'q3',
      question: 'How did you hear about us?',
      responseRate: 82.3,
      avgTime: 60,
      dropOffRate: 11.4
    },
    {
      questionId: 'q4',
      question: 'Would you recommend us to a friend?',
      responseRate: 78.1,
      avgTime: 40,
      dropOffRate: 15.8
    },
    {
      questionId: 'q5',
      question: 'Any additional comments?',
      responseRate: 45.6,
      avgTime: 120,
      dropOffRate: 42.3
    }
  ];

  const totalResponses = trends.reduce((sum, trend) => sum + trend.value, 0);
  const completionRate = questionMetrics[questionMetrics.length - 1].responseRate;
  const avgCompletionTime = questionMetrics.reduce((sum, q) => sum + (q.avgTime || 0), 0) / questionMetrics.length;
  const responseVelocity = totalResponses / daysDiff;

  return {
    totalResponses,
    completionRate,
    avgCompletionTime,
    responseVelocity,
    questionMetrics,
    trends,
    demographics: {
      device: {
        desktop: Math.floor(totalResponses * 0.6),
        mobile: Math.floor(totalResponses * 0.35),
        tablet: Math.floor(totalResponses * 0.05)
      },
      age: {
        '18-24': Math.floor(totalResponses * 0.15),
        '25-34': Math.floor(totalResponses * 0.30),
        '35-44': Math.floor(totalResponses * 0.25),
        '45-54': Math.floor(totalResponses * 0.20),
        '55+': Math.floor(totalResponses * 0.10)
      }
    }
  };
};

// API functions (mock for now)
const fetchAnalyticsData = async (surveyId: string, filters: FilterOptions): Promise<AnalyticsData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return generateMockAnalyticsData(surveyId, filters.dateRange);
};

const fetchSurveyList = async (): Promise<Array<{ id: string; title: string }>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    { id: 'survey-1', title: 'Customer Satisfaction Survey' },
    { id: 'survey-2', title: 'Product Feedback Survey' },
    { id: 'survey-3', title: 'Employee Engagement Survey' },
    { id: 'survey-4', title: 'Market Research Survey' }
  ];
};

export interface UseAnalyticsOptions {
  surveyId?: string;
  initialFilters?: Partial<FilterOptions>;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const {
    surveyId,
    initialFilters,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  // Default filters
  const defaultFilters: FilterOptions = {
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    },
    surveyId,
    demographics: [],
    devices: [],
    sources: [],
    ...initialFilters
  };

  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['analytics', filters.surveyId || 'all', filters],
    queryFn: () => fetchAnalyticsData(filters.surveyId || 'all', filters),
    enabled: !!filters.surveyId || !surveyId, // Enable if surveyId is provided or not required
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  // Fetch available surveys
  const {
    data: availableSurveys,
    isLoading: surveysLoading,
    error: surveysError
  } = useQuery({
    queryKey: ['surveys'],
    queryFn: fetchSurveyList,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Auto-refresh handler
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
        refetchAnalytics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refetchAnalytics]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setLastRefresh(new Date());
    await refetchAnalytics();
  };

  // Filter change handler
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Export handler (placeholder)
  const handleExport = async () => {
    // This would integrate with the export functionality
    console.log('Exporting analytics data...', { filters, data: analyticsData });
  };

  // Computed values
  const isLoading = analyticsLoading || surveysLoading;
  const hasError = !!analyticsError || !!surveysError;
  const error = analyticsError || surveysError;

  // Key metrics for quick access
  const keyMetrics = useMemo(() => {
    if (!analyticsData) return null;

    return {
      totalResponses: analyticsData.totalResponses,
      completionRate: analyticsData.completionRate,
      avgCompletionTime: analyticsData.avgCompletionTime,
      responseVelocity: analyticsData.responseVelocity,
      trendDirection: calculateTrendDirection(analyticsData.trends),
      bestPerformingQuestion: findBestPerformingQuestion(analyticsData.questionMetrics),
      worstPerformingQuestion: findWorstPerformingQuestion(analyticsData.questionMetrics)
    };
  }, [analyticsData]);

  return {
    // Data
    analyticsData,
    availableSurveys,
    keyMetrics,
    
    // State
    filters,
    lastRefresh,
    isLoading,
    hasError,
    error,
    
    // Handlers
    handleRefresh,
    handleFiltersChange,
    handleExport,
    
    // Utilities
    refetchAnalytics
  };
};

// Utility functions
function calculateTrendDirection(trends?: TimeSeriesData[]): 'up' | 'down' | 'stable' {
  if (!trends || trends.length < 2) return 'stable';
  
  const recent = trends.slice(-7); // Last 7 data points
  const earlier = trends.slice(-14, -7); // Previous 7 data points
  
  if (recent.length === 0 || earlier.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, point) => sum + point.value, 0) / earlier.length;
  
  const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
  
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}

function findBestPerformingQuestion(questions: QuestionMetric[]): QuestionMetric | null {
  if (questions.length === 0) return null;
  
  return questions.reduce((best, current) => 
    current.responseRate > best.responseRate ? current : best
  );
}

function findWorstPerformingQuestion(questions: QuestionMetric[]): QuestionMetric | null {
  if (questions.length === 0) return null;
  
  return questions.reduce((worst, current) => 
    current.responseRate < worst.responseRate ? current : worst
  );
}