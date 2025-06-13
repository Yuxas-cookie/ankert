import { BrandingConfig } from '@/types/charts';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  sections: TemplateSectionConfig[];
  branding: BrandingConfig;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateSectionConfig {
  id: string;
  type: 'overview' | 'charts' | 'data' | 'analysis' | 'custom';
  title: string;
  enabled: boolean;
  order: number;
  customContent?: string;
  chartTypes?: string[];
  layout: 'single-column' | 'two-column' | 'grid';
}

export class TemplateManager {
  private templates: Map<string, ReportTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default report templates
   */
  private initializeDefaultTemplates(): void {
    // Executive Summary Template
    this.addTemplate({
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'Concise report focusing on key metrics and insights',
      sections: [
        {
          id: 'overview',
          type: 'overview',
          title: 'Executive Summary',
          enabled: true,
          order: 1,
          layout: 'single-column'
        },
        {
          id: 'key-charts',
          type: 'charts',
          title: 'Key Visualizations',
          enabled: true,
          order: 2,
          chartTypes: ['funnel', 'pie', 'bar'],
          layout: 'two-column'
        },
        {
          id: 'recommendations',
          type: 'analysis',
          title: 'Recommendations',
          enabled: true,
          order: 3,
          layout: 'single-column'
        }
      ],
      branding: this.getDefaultBranding(),
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Detailed Analytics Template
    this.addTemplate({
      id: 'detailed-analytics',
      name: 'Detailed Analytics',
      description: 'Comprehensive report with all charts and data analysis',
      sections: [
        {
          id: 'overview',
          type: 'overview',
          title: 'Survey Overview',
          enabled: true,
          order: 1,
          layout: 'single-column'
        },
        {
          id: 'response-metrics',
          type: 'charts',
          title: 'Response Metrics',
          enabled: true,
          order: 2,
          chartTypes: ['line', 'funnel', 'bar'],
          layout: 'grid'
        },
        {
          id: 'question-analysis',
          type: 'analysis',
          title: 'Question Analysis',
          enabled: true,
          order: 3,
          layout: 'single-column'
        },
        {
          id: 'demographics',
          type: 'charts',
          title: 'Demographics',
          enabled: true,
          order: 4,
          chartTypes: ['pie', 'bar'],
          layout: 'two-column'
        },
        {
          id: 'raw-data',
          type: 'data',
          title: 'Response Data',
          enabled: true,
          order: 5,
          layout: 'single-column'
        }
      ],
      branding: this.getDefaultBranding(),
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Customer Feedback Template
    this.addTemplate({
      id: 'customer-feedback',
      name: 'Customer Feedback',
      description: 'Template optimized for customer satisfaction surveys',
      sections: [
        {
          id: 'satisfaction-overview',
          type: 'overview',
          title: 'Satisfaction Overview',
          enabled: true,
          order: 1,
          layout: 'single-column'
        },
        {
          id: 'satisfaction-charts',
          type: 'charts',
          title: 'Satisfaction Metrics',
          enabled: true,
          order: 2,
          chartTypes: ['likert', 'bar', 'pie'],
          layout: 'two-column'
        },
        {
          id: 'sentiment-analysis',
          type: 'analysis',
          title: 'Sentiment Analysis',
          enabled: true,
          order: 3,
          layout: 'single-column'
        },
        {
          id: 'improvement-areas',
          type: 'analysis',
          title: 'Areas for Improvement',
          enabled: true,
          order: 4,
          layout: 'single-column'
        }
      ],
      branding: {
        ...this.getDefaultBranding(),
        colors: {
          primary: '#10B981',
          secondary: '#3B82F6'
        }
      },
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Data Export Template
    this.addTemplate({
      id: 'data-export',
      name: 'Data Export',
      description: 'Minimal template focused on data export',
      sections: [
        {
          id: 'data-summary',
          type: 'overview',
          title: 'Data Summary',
          enabled: true,
          order: 1,
          layout: 'single-column'
        },
        {
          id: 'export-data',
          type: 'data',
          title: 'Exported Data',
          enabled: true,
          order: 2,
          layout: 'single-column'
        }
      ],
      branding: this.getDefaultBranding(),
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * Get all available templates
   */
  getTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values()).sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ReportTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Get default template
   */
  getDefaultTemplate(): ReportTemplate {
    const defaultTemplate = Array.from(this.templates.values())
      .find(t => t.isDefault && t.id === 'executive-summary');
    
    if (!defaultTemplate) {
      throw new Error('No default template found');
    }
    
    return defaultTemplate;
  }

  /**
   * Add a new template
   */
  addTemplate(template: Omit<ReportTemplate, 'id'> & { id?: string }): string {
    const id = template.id || this.generateTemplateId();
    const fullTemplate: ReportTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.templates.set(id, fullTemplate);
    return id;
  }

  /**
   * Update existing template
   */
  updateTemplate(id: string, updates: Partial<ReportTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updatedTemplate: ReportTemplate = {
      ...template,
      ...updates,
      id, // Preserve original ID
      updatedAt: new Date()
    };

    this.templates.set(id, updatedTemplate);
    return true;
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): boolean {
    const template = this.templates.get(id);
    if (!template || template.isDefault) return false;

    return this.templates.delete(id);
  }

  /**
   * Clone template
   */
  cloneTemplate(id: string, newName?: string): string | null {
    const template = this.templates.get(id);
    if (!template) return null;

    const clonedTemplate = {
      ...template,
      name: newName || `${template.name} (Copy)`,
      isDefault: false
    };

    return this.addTemplate(clonedTemplate);
  }

  /**
   * Get template preview
   */
  getTemplatePreview(id: string): TemplatePreview | null {
    const template = this.templates.get(id);
    if (!template) return null;

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      sectionCount: template.sections.filter(s => s.enabled).length,
      chartTypes: this.extractChartTypes(template),
      estimatedPages: this.estimatePageCount(template),
      branding: template.branding
    };
  }

  /**
   * Validate template configuration
   */
  validateTemplate(template: Partial<ReportTemplate>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Name validation
    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    // Sections validation
    if (!template.sections || template.sections.length === 0) {
      errors.push('Template must have at least one section');
    } else {
      const enabledSections = template.sections.filter(s => s.enabled);
      if (enabledSections.length === 0) {
        warnings.push('No sections are enabled');
      }

      // Check for duplicate orders
      const orders = enabledSections.map(s => s.order);
      const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
      if (duplicateOrders.length > 0) {
        warnings.push('Duplicate section orders detected');
      }
    }

    // Branding validation
    if (template.branding) {
      if (!template.branding.colors?.primary) {
        warnings.push('Primary brand color not specified');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Export template configuration
   */
  exportTemplate(id: string): string | null {
    const template = this.templates.get(id);
    if (!template) return null;

    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template configuration
   */
  importTemplate(templateJson: string): string | null {
    try {
      const template = JSON.parse(templateJson) as ReportTemplate;
      const validation = this.validateTemplate(template);
      
      if (!validation.isValid) {
        throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
      }

      return this.addTemplate({
        ...template,
        isDefault: false // Imported templates are never default
      });
    } catch (error) {
      console.error('Failed to import template:', error);
      return null;
    }
  }

  // Private helper methods

  private getDefaultBranding(): BrandingConfig {
    return {
      logo: '',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981'
      },
      typography: {
        headerFont: 'Inter',
        bodyFont: 'Inter'
      },
      footer: 'Generated by Survey Analytics System'
    };
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractChartTypes(template: ReportTemplate): string[] {
    const chartTypes = new Set<string>();
    
    template.sections.forEach(section => {
      if (section.type === 'charts' && section.chartTypes) {
        section.chartTypes.forEach(type => chartTypes.add(type));
      }
    });

    return Array.from(chartTypes);
  }

  private estimatePageCount(template: ReportTemplate): number {
    const enabledSections = template.sections.filter(s => s.enabled);
    let pageCount = 1; // Title page

    enabledSections.forEach(section => {
      switch (section.type) {
        case 'overview':
          pageCount += 1;
          break;
        case 'charts':
          pageCount += Math.ceil((section.chartTypes?.length || 2) / 2);
          break;
        case 'data':
          pageCount += 2; // Typically spans multiple pages
          break;
        case 'analysis':
          pageCount += 1;
          break;
        default:
          pageCount += 1;
      }
    });

    return pageCount;
  }
}

// Supporting interfaces
export interface TemplatePreview {
  id: string;
  name: string;
  description: string;
  sectionCount: number;
  chartTypes: string[];
  estimatedPages: number;
  branding: BrandingConfig;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Singleton instance
export const templateManager = new TemplateManager();