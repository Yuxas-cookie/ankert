import { ReportData } from '../ReportBuilder';
import { ExportConfig } from '@/types/charts';

export class CSVExporter {
  async generate(data: ReportData, config: ExportConfig): Promise<Blob> {
    let csvContent = '';

    // Add survey information header
    csvContent += this.generateSurveyInfoCSV(data);
    csvContent += '\n\n';

    // Add analytics summary
    csvContent += this.generateAnalyticsSummaryCSV(data.analytics);
    csvContent += '\n\n';

    // Add question metrics
    csvContent += this.generateQuestionMetricsCSV(data.analytics.questionMetrics);
    csvContent += '\n\n';

    // Add response data if included
    if (config.includeData !== false && data.responses && data.responses.length > 0) {
      csvContent += this.generateResponseDataCSV(data.responses);
    }

    // Add trends data if available
    if (data.analytics.trends && data.analytics.trends.length > 0) {
      csvContent += '\n\n';
      csvContent += this.generateTrendsCSV(data.analytics.trends);
    }

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private generateSurveyInfoCSV(data: ReportData): string {
    let csv = 'Survey Information\n';
    csv += 'Field,Value\n';
    csv += `Survey ID,"${this.escapeCsvValue(data.surveyInfo.id)}"\n`;
    csv += `Survey Title,"${this.escapeCsvValue(data.surveyInfo.title)}"\n`;
    csv += `Total Questions,${data.surveyInfo.totalQuestions}\n`;
    csv += `Created Date,"${data.surveyInfo.createdAt.toLocaleDateString()}"\n`;
    csv += `Report Generated,"${data.metadata.generatedAt.toLocaleString()}"\n`;
    
    return csv;
  }

  private generateAnalyticsSummaryCSV(analytics: any): string {
    let csv = 'Analytics Summary\n';
    csv += 'Metric,Value\n';
    csv += `Total Responses,${analytics.totalResponses}\n`;
    csv += `Completion Rate,${analytics.completionRate.toFixed(1)}%\n`;
    csv += `Average Completion Time,"${this.formatDuration(analytics.avgCompletionTime)}"\n`;
    csv += `Response Velocity,${Math.round(analytics.responseVelocity)} per day\n`;

    // Add demographics if available
    if (analytics.demographics) {
      csv += '\nDemographics - Device Distribution\n';
      csv += 'Device Type,Count,Percentage\n';
      
      if (analytics.demographics.device) {
        const total = Object.values(analytics.demographics.device).reduce(
          (sum: number, count: any) => sum + count, 0
        );
        
        Object.entries(analytics.demographics.device).forEach(([device, count]) => {
          const percentage = total > 0 ? ((count as number) / total * 100).toFixed(1) : '0';
          csv += `${device},${count},${percentage}%\n`;
        });
      }

      // Add age demographics if available
      if (analytics.demographics.age) {
        csv += '\nDemographics - Age Distribution\n';
        csv += 'Age Range,Count,Percentage\n';
        
        const total = Object.values(analytics.demographics.age).reduce(
          (sum: number, count: any) => sum + count, 0
        );
        
        Object.entries(analytics.demographics.age).forEach(([age, count]) => {
          const percentage = total > 0 ? ((count as number) / total * 100).toFixed(1) : '0';
          csv += `${age},${count},${percentage}%\n`;
        });
      }
    }

    return csv;
  }

  private generateQuestionMetricsCSV(questionMetrics: any[]): string {
    let csv = 'Question Performance Metrics\n';
    csv += 'Question ID,Question Text,Response Rate (%),Average Time (seconds),Drop-off Rate (%)\n';

    questionMetrics.forEach(metric => {
      csv += `"${this.escapeCsvValue(metric.questionId)}",`;
      csv += `"${this.escapeCsvValue(metric.question)}",`;
      csv += `${metric.responseRate.toFixed(1)},`;
      csv += `${metric.avgTime || 'N/A'},`;
      csv += `${metric.dropOffRate ? metric.dropOffRate.toFixed(1) : 'N/A'}\n`;
    });

    return csv;
  }

  private generateResponseDataCSV(responses: any[]): string {
    if (responses.length === 0) {
      return 'Response Data\nNo responses available\n';
    }

    let csv = 'Response Data\n';

    // Determine all possible columns from the first few responses
    const sampleResponses = responses.slice(0, 10);
    const columns = new Set<string>();
    
    // Standard columns
    columns.add('Response ID');
    columns.add('Status');
    columns.add('Started At');
    columns.add('Completed At');
    columns.add('Duration (seconds)');
    columns.add('IP Address');
    columns.add('User Agent');

    // Add question columns
    sampleResponses.forEach(response => {
      if (response.answers && Array.isArray(response.answers)) {
        response.answers.forEach((answer: any) => {
          columns.add(`Q${answer.question_id || 'Unknown'}`);
        });
      }
    });

    const columnArray = Array.from(columns);
    
    // Write header
    csv += columnArray.map(col => `"${col}"`).join(',') + '\n';

    // Write data rows
    responses.forEach(response => {
      const row: string[] = [];
      
      columnArray.forEach(column => {
        switch (column) {
          case 'Response ID':
            row.push(`"${this.escapeCsvValue(response.id || '')}"`);
            break;
          case 'Status':
            row.push(`"${this.escapeCsvValue(response.status || 'Unknown')}"`);
            break;
          case 'Started At':
            row.push(`"${response.created_at ? new Date(response.created_at).toLocaleString() : ''}"`);
            break;
          case 'Completed At':
            row.push(`"${response.completed_at ? new Date(response.completed_at).toLocaleString() : ''}"`);
            break;
          case 'Duration (seconds)':
            row.push(`"${response.duration || ''}"`);
            break;
          case 'IP Address':
            row.push(`"${this.escapeCsvValue(response.ip_address || '')}"`);
            break;
          case 'User Agent':
            row.push(`"${this.escapeCsvValue(response.user_agent || '')}"`);
            break;
          default:
            // Handle question columns
            if (column.startsWith('Q')) {
              const questionId = column.substring(1);
              const answer = response.answers?.find((a: any) => 
                String(a.question_id) === questionId
              );
              const value = answer ? (answer.answer_text || answer.answer_value || '') : '';
              row.push(`"${this.escapeCsvValue(String(value))}"`);
            } else {
              row.push('""');
            }
            break;
        }
      });
      
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  private generateTrendsCSV(trends: any[]): string {
    let csv = 'Response Trends\n';
    csv += 'Date,Daily Responses,Cumulative Total\n';

    let cumulative = 0;
    trends.forEach(trend => {
      cumulative += trend.value;
      csv += `"${trend.timestamp.toLocaleDateString()}",${trend.value},${cumulative}\n`;
    });

    return csv;
  }

  private escapeCsvValue(value: string): string {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    // Escape double quotes by doubling them
    return value.replace(/"/g, '""');
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  }

  // Generate specific CSV for responses only (useful for data analysis)
  async generateResponsesOnly(responses: any[]): Promise<Blob> {
    const csvContent = this.generateResponseDataCSV(responses);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  // Generate specific CSV for question metrics only
  async generateQuestionMetricsOnly(questionMetrics: any[]): Promise<Blob> {
    const csvContent = this.generateQuestionMetricsCSV(questionMetrics);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  // Generate specific CSV for trends data only
  async generateTrendsOnly(trends: any[]): Promise<Blob> {
    const csvContent = this.generateTrendsCSV(trends);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}