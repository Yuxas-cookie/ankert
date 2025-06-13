import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportData, ReportSection } from '../ReportBuilder';
import { ExportConfig } from '@/types/charts';

export class PDFReportGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private pageWidth: number = 210;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  async generate(
    data: ReportData,
    config: ExportConfig,
    sections: ReportSection[]
  ): Promise<Blob> {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.currentY = 20;

    // Setup branding if provided
    if (config.branding) {
      this.setupBranding(config.branding);
    }

    // Generate title page
    await this.generateTitlePage(data);

    // Generate table of contents
    await this.generateTableOfContents(sections.filter(s => s.include));

    // Generate each section
    for (const section of sections) {
      if (section.include) {
        await this.generateSection(section, data);
      }
    }

    // Add page numbers
    this.addPageNumbers();

    return this.doc.output('blob');
  }

  private setupBranding(branding: any): void {
    // Set document metadata
    this.doc.setProperties({
      title: 'Survey Analytics Report',
      subject: 'Survey Response Analysis',
      author: 'Survey Analytics System',
      creator: 'Survey App'
    });
  }

  private async generateTitlePage(data: ReportData): Promise<void> {
    // Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Survey Analytics Report', this.pageWidth / 2, 50, { align: 'center' });

    // Survey title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.surveyInfo.title, this.pageWidth / 2, 70, { align: 'center' });

    // Key metrics summary
    this.currentY = 100;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Executive Summary', this.margin, this.currentY);

    this.currentY += 20;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    const summaryMetrics = [
      `Total Responses: ${data.analytics.totalResponses.toLocaleString()}`,
      `Completion Rate: ${data.analytics.completionRate.toFixed(1)}%`,
      `Average Duration: ${this.formatDuration(data.analytics.avgCompletionTime)}`,
      `Response Velocity: ${Math.round(data.analytics.responseVelocity)} responses/day`
    ];

    summaryMetrics.forEach((metric, index) => {
      this.doc.text(metric, this.margin + 10, this.currentY + (index * 8));
    });

    // Generation info
    this.currentY = this.pageHeight - 30;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(
      `Generated on ${data.metadata.generatedAt.toLocaleDateString()} at ${data.metadata.generatedAt.toLocaleTimeString()}`,
      this.margin,
      this.currentY
    );

    this.addNewPage();
  }

  private async generateTableOfContents(sections: ReportSection[]): Promise<void> {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Table of Contents', this.margin, this.currentY);

    this.currentY += 20;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    sections.forEach((section, index) => {
      const pageNum = index + 3; // Approximate page numbers
      this.doc.text(`${index + 1}. ${section.title}`, this.margin + 5, this.currentY);
      this.doc.text(`${pageNum}`, this.pageWidth - this.margin - 10, this.currentY);
      this.currentY += 8;
    });

    this.addNewPage();
  }

  private async generateSection(section: ReportSection, data: ReportData): Promise<void> {
    // Section title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(section.title, this.margin, this.currentY);
    this.currentY += 15;

    switch (section.type) {
      case 'overview':
        await this.generateOverviewSection(section.content);
        break;
      case 'charts':
        await this.generateChartsSection(section.content);
        break;
      case 'data':
        await this.generateDataSection(section.content);
        break;
      case 'analysis':
        await this.generateAnalysisSection(section.content);
        break;
    }

    this.addNewPage();
  }

  private async generateOverviewSection(content: any): Promise<void> {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    // Key metrics
    const metrics = [
      ['Total Responses', content.totalResponses.toLocaleString()],
      ['Completion Rate', `${content.completionRate.toFixed(1)}%`],
      ['Average Completion Time', this.formatDuration(content.avgCompletionTime)]
    ];

    metrics.forEach(([label, value], index) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label}:`, this.margin, this.currentY + (index * 8));
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 60, this.currentY + (index * 8));
    });

    this.currentY += metrics.length * 8 + 10;

    // Key insights
    if (content.keyInsights && content.keyInsights.length > 0) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Key Insights:', this.margin, this.currentY);
      this.currentY += 10;

      this.doc.setFont('helvetica', 'normal');
      content.keyInsights.forEach((insight: string, index: number) => {
        const lines = this.doc.splitTextToSize(`• ${insight}`, this.pageWidth - 2 * this.margin);
        lines.forEach((line: string, lineIndex: number) => {
          this.doc.text(line, this.margin + 5, this.currentY + (index * 12) + (lineIndex * 6));
        });
        this.currentY += 6;
      });
    }
  }

  private async generateChartsSection(content: any): Promise<void> {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Chart visualizations would be captured and embedded here.', this.margin, this.currentY);
    this.currentY += 10;

    // Note: In a real implementation, you would use html2canvas to capture chart elements
    // and embed them as images in the PDF
    this.doc.text('(Chart capture functionality requires DOM access)', this.margin, this.currentY);
    this.currentY += 20;

    // Question metrics table
    if (content.questionMetrics) {
      this.generateQuestionMetricsTable(content.questionMetrics);
    }
  }

  private async generateDataSection(content: any): Promise<void> {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Response Data Summary', this.margin, this.currentY);
    this.currentY += 15;

    this.doc.setFont('helvetica', 'normal');
    
    if (content.responses && content.responses.length > 0) {
      this.doc.text(`Total responses: ${content.responses.length}`, this.margin, this.currentY);
      this.currentY += 10;

      // Sample data preview (first 10 responses)
      this.doc.text('Sample responses (first 10):', this.margin, this.currentY);
      this.currentY += 10;

      content.responses.slice(0, 10).forEach((response: any, index: number) => {
        this.doc.text(
          `${index + 1}. ID: ${response.id}, Status: ${response.status || 'N/A'}`,
          this.margin + 5,
          this.currentY + (index * 6)
        );
      });
      
      this.currentY += 60;
    }

    this.doc.text('Complete data export available in CSV format.', this.margin, this.currentY);
  }

  private async generateAnalysisSection(content: any): Promise<void> {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    // Question analysis
    if (content.questionAnalysis) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Question Performance Analysis', this.margin, this.currentY);
      this.currentY += 15;

      this.doc.setFont('helvetica', 'normal');
      content.questionAnalysis.forEach((question: any, index: number) => {
        if (this.currentY > this.pageHeight - 30) {
          this.addNewPage();
        }

        const questionText = this.doc.splitTextToSize(
          `Q${index + 1}: ${question.question}`,
          this.pageWidth - 2 * this.margin
        );
        
        questionText.forEach((line: string, lineIndex: number) => {
          this.doc.text(line, this.margin, this.currentY + (lineIndex * 6));
        });
        
        this.currentY += questionText.length * 6 + 5;
        
        this.doc.text(
          `Response Rate: ${question.responseRate.toFixed(1)}% (${question.performance})`,
          this.margin + 5,
          this.currentY
        );
        this.currentY += 10;
      });
    }

    // Recommendations
    if (content.recommendations && content.recommendations.length > 0) {
      if (this.currentY > this.pageHeight - 50) {
        this.addNewPage();
      }

      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Recommendations', this.margin, this.currentY);
      this.currentY += 15;

      this.doc.setFont('helvetica', 'normal');
      content.recommendations.forEach((rec: string, index: number) => {
        const lines = this.doc.splitTextToSize(`• ${rec}`, this.pageWidth - 2 * this.margin);
        lines.forEach((line: string, lineIndex: number) => {
          this.doc.text(line, this.margin + 5, this.currentY + (lineIndex * 6));
        });
        this.currentY += lines.length * 6 + 3;
      });
    }
  }

  private generateQuestionMetricsTable(questionMetrics: any[]): void {
    const headers = ['Question', 'Response Rate', 'Avg Time'];
    const columnWidths = [100, 40, 30];
    const startX = this.margin;
    let tableY = this.currentY;

    // Table headers
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    
    headers.forEach((header, index) => {
      const x = startX + columnWidths.slice(0, index).reduce((sum, width) => sum + width, 0);
      this.doc.text(header, x, tableY);
    });

    tableY += 8;
    
    // Table rows
    this.doc.setFont('helvetica', 'normal');
    questionMetrics.slice(0, 15).forEach((metric, rowIndex) => {
      if (tableY > this.pageHeight - 30) return; // Stop if near page end

      const rowData = [
        metric.question.substring(0, 50) + (metric.question.length > 50 ? '...' : ''),
        `${metric.responseRate.toFixed(1)}%`,
        metric.avgTime ? this.formatDuration(metric.avgTime) : 'N/A'
      ];

      rowData.forEach((data, colIndex) => {
        const x = startX + columnWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0);
        this.doc.text(data, x, tableY + (rowIndex * 8));
      });
    });

    this.currentY = tableY + (Math.min(questionMetrics.length, 15) * 8) + 10;
  }

  private addNewPage(): void {
    this.doc.addPage();
    this.currentY = 20;
  }

  private addPageNumbers(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight + 10,
        { align: 'right' }
      );
    }
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  }
}