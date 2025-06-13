import { AnalyticsData, ExportConfig, BrandingConfig } from '@/types/charts';
import { PDFReportGenerator } from './generators/PDFReportGenerator';
import { ExcelReportGenerator } from './generators/ExcelReportGenerator';
import { CSVExporter } from './generators/CSVExporter';

export interface ReportData {
  analytics: AnalyticsData;
  surveyInfo: {
    id: string;
    title: string;
    description?: string;
    createdAt: Date;
    totalQuestions: number;
  };
  responses: any[];
  metadata: {
    generatedAt: Date;
    generatedBy?: string;
    filters?: any;
  };
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'overview' | 'charts' | 'data' | 'analysis';
  content: any;
  include: boolean;
}

export class ReportBuilder {
  private pdfGenerator: PDFReportGenerator;
  private excelGenerator: ExcelReportGenerator;
  private csvExporter: CSVExporter;

  constructor() {
    this.pdfGenerator = new PDFReportGenerator();
    this.excelGenerator = new ExcelReportGenerator();
    this.csvExporter = new CSVExporter();
  }

  /**
   * Generate a report in the specified format
   */
  async generateReport(
    data: ReportData,
    config: ExportConfig,
    sections: ReportSection[]
  ): Promise<Blob> {
    switch (config.format) {
      case 'pdf':
        return this.pdfGenerator.generate(data, config, sections);
      case 'excel':
        return this.excelGenerator.generate(data, config, sections);
      case 'csv':
        return this.csvExporter.generate(data, config);
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  }

  /**
   * Get available sections for report customization
   */
  getAvailableSections(data: ReportData): ReportSection[] {
    return [
      {
        id: 'overview',
        title: 'Executive Summary',
        type: 'overview',
        content: {
          totalResponses: data.analytics.totalResponses,
          completionRate: data.analytics.completionRate,
          avgCompletionTime: data.analytics.avgCompletionTime,
          keyInsights: this.generateKeyInsights(data.analytics)
        },
        include: true
      },
      {
        id: 'charts',
        title: 'Charts & Visualizations',
        type: 'charts',
        content: {
          responsesTrend: data.analytics.trends,
          questionMetrics: data.analytics.questionMetrics,
          demographics: data.analytics.demographics
        },
        include: true
      },
      {
        id: 'data',
        title: 'Raw Data',
        type: 'data',
        content: {
          responses: data.responses,
          questions: data.analytics.questionMetrics
        },
        include: true
      },
      {
        id: 'analysis',
        title: 'Detailed Analysis',
        type: 'analysis',
        content: {
          questionAnalysis: this.analyzeQuestions(data.analytics.questionMetrics),
          trends: this.analyzeTrends(data.analytics.trends),
          recommendations: this.generateRecommendations(data.analytics)
        },
        include: true
      }
    ];
  }

  /**
   * Generate key insights from analytics data
   */
  private generateKeyInsights(analytics: AnalyticsData): string[] {
    const insights: string[] = [];

    // Response rate insights
    if (analytics.completionRate > 80) {
      insights.push('Excellent completion rate indicates high engagement');
    } else if (analytics.completionRate < 50) {
      insights.push('Low completion rate suggests survey may be too long or complex');
    }

    // Response velocity insights
    if (analytics.responseVelocity > 50) {
      insights.push('High response velocity indicates strong participant interest');
    }

    // Question performance insights
    const worstQuestion = analytics.questionMetrics.reduce((worst, current) =>
      current.responseRate < worst.responseRate ? current : worst
    );
    
    if (worstQuestion.responseRate < 70) {
      insights.push(`Question "${worstQuestion.question}" has the lowest response rate (${worstQuestion.responseRate.toFixed(1)}%)`);
    }

    // Completion time insights
    if (analytics.avgCompletionTime > 600) { // 10 minutes
      insights.push('Average completion time is high - consider shortening the survey');
    }

    return insights;
  }

  /**
   * Analyze individual question performance
   */
  private analyzeQuestions(questionMetrics: any[]): any[] {
    return questionMetrics.map(question => ({
      ...question,
      performance: this.categorizeQuestionPerformance(question.responseRate),
      recommendations: this.getQuestionRecommendations(question)
    }));
  }

  /**
   * Analyze response trends
   */
  private analyzeTrends(trends?: any[]): any {
    if (!trends || trends.length < 2) return null;

    const recent = trends.slice(-7);
    const previous = trends.slice(-14, -7);

    const recentAvg = recent.reduce((sum, t) => sum + t.value, 0) / recent.length;
    const previousAvg = previous.reduce((sum, t) => sum + t.value, 0) / previous.length;

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;

    return {
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      changePercentage: Math.abs(change),
      insight: this.getTrendInsight(change)
    };
  }

  /**
   * Generate recommendations based on analytics
   */
  private generateRecommendations(analytics: AnalyticsData): string[] {
    const recommendations: string[] = [];

    if (analytics.completionRate < 70) {
      recommendations.push('Consider reducing survey length or simplifying questions');
    }

    if (analytics.avgCompletionTime > 600) {
      recommendations.push('Add progress indicators to reduce abandonment');
    }

    const dropOffQuestions = analytics.questionMetrics.filter(q => q.dropOffRate && q.dropOffRate > 15);
    if (dropOffQuestions.length > 0) {
      recommendations.push(`Review questions with high drop-off rates: ${dropOffQuestions.map(q => q.question).join(', ')}`);
    }

    if (analytics.responseVelocity < 10) {
      recommendations.push('Consider promoting the survey to increase response rate');
    }

    return recommendations;
  }

  /**
   * Categorize question performance
   */
  private categorizeQuestionPerformance(responseRate: number): string {
    if (responseRate >= 90) return 'Excellent';
    if (responseRate >= 75) return 'Good';
    if (responseRate >= 60) return 'Fair';
    return 'Poor';
  }

  /**
   * Get question-specific recommendations
   */
  private getQuestionRecommendations(question: any): string[] {
    const recommendations: string[] = [];

    if (question.responseRate < 70) {
      recommendations.push('Consider making this question optional or simplifying the wording');
    }

    if (question.avgTime && question.avgTime > 120) {
      recommendations.push('Question may be too complex - consider breaking into multiple questions');
    }

    if (question.dropOffRate && question.dropOffRate > 20) {
      recommendations.push('High drop-off rate - review question placement and necessity');
    }

    return recommendations;
  }

  /**
   * Get trend insight message
   */
  private getTrendInsight(changePercentage: number): string {
    if (changePercentage > 10) {
      return 'Response rate is increasing significantly';
    } else if (changePercentage > 5) {
      return 'Response rate is moderately increasing';
    } else if (changePercentage < -10) {
      return 'Response rate is decreasing significantly';
    } else if (changePercentage < -5) {
      return 'Response rate is moderately decreasing';
    }
    return 'Response rate is stable';
  }

  /**
   * Estimate report generation time
   */
  estimateGenerationTime(
    format: ExportConfig['format'],
    dataSize: { responses: number; questions: number }
  ): number {
    const baseTime = {
      csv: 1000,    // 1 second
      excel: 3000,  // 3 seconds
      pdf: 5000,    // 5 seconds
      svg: 2000,    // 2 seconds
      png: 2000     // 2 seconds
    };

    const sizeMultiplier = Math.max(1, Math.floor(dataSize.responses / 1000));
    return baseTime[format] * sizeMultiplier;
  }
}