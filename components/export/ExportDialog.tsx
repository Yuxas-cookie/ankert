'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/file-upload';
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ReportBuilder, ReportData, ReportSection } from '@/lib/export/ReportBuilder';
import { ExportConfig } from '@/types/charts';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  analyticsData: any;
  surveyInfo: {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    totalQuestions: number;
  };
  responses: any[];
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  analyticsData,
  surveyInfo,
  responses
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeData, setIncludeData] = useState(true);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'overview', 'charts', 'data', 'analysis'
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  const reportBuilder = new ReportBuilder();

  // Create ReportData from props
  const data: ReportData = {
    analytics: analyticsData,
    surveyInfo,
    responses,
    metadata: {
      generatedAt: new Date(),
      generatedBy: 'Survey Analytics System'
    }
  };

  const formatOptions = [
    {
      value: 'pdf' as const,
      label: 'PDF Report',
      description: 'Complete formatted report with charts and analysis',
      icon: <FileText className="w-5 h-5" />,
      fileSize: 'Medium (2-5 MB)'
    },
    {
      value: 'excel' as const,
      label: 'Excel Workbook',
      description: 'Spreadsheet with multiple sheets for data analysis',
      icon: <Table className="w-5 h-5" />,
      fileSize: 'Small (1-3 MB)'
    },
    {
      value: 'csv' as const,
      label: 'CSV Data',
      description: 'Raw data export for external analysis',
      icon: <BarChart3 className="w-5 h-5" />,
      fileSize: 'Small (< 1 MB)'
    }
  ];

  const availableSections = reportBuilder.getAvailableSections(data);

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    setSelectedSections(prev => 
      checked 
        ? [...prev, sectionId]
        : prev.filter(id => id !== sectionId)
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);

    try {
      // Prepare export configuration
      const config: ExportConfig = {
        format: exportFormat,
        includeCharts,
        includeData,
        branding: {
          logo: '',
          colors: {
            primary: '#3B82F6',
            secondary: '#10B981'
          },
          typography: {
            headerFont: 'Arial',
            bodyFont: 'Arial'
          }
        }
      };

      // Filter sections based on selection
      const sections: ReportSection[] = availableSections.map(section => ({
        ...section,
        include: selectedSections.includes(section.id)
      }));

      // Simulate progress updates
      setExportProgress(20);

      // Estimate generation time
      const estimatedTime = reportBuilder.estimateGenerationTime(
        exportFormat,
        { responses: data.responses.length, questions: data.analytics.questionMetrics.length }
      );

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 80));
      }, estimatedTime / 8);

      // Generate report
      const blob = await reportBuilder.generateReport(data, config, sections);

      clearInterval(progressInterval);
      setExportProgress(100);

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedTitle = data.surveyInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${sanitizedTitle}_report_${timestamp}.${getFileExtension(exportFormat)}`;

      // Download the file
      downloadBlob(blob, filename);
      
      onClose();

    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getFileExtension = (format: string): string => {
    switch (format) {
      case 'pdf': return 'pdf';
      case 'excel': return 'xlsx';
      case 'csv': return 'csv';
      default: return 'txt';
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Survey Report</DialogTitle>
        </DialogHeader>

        {isExporting ? (
          <ExportProgress 
            progress={exportProgress}
            format={exportFormat}
            error={exportError}
          />
        ) : (
          <div className="space-y-6">
            {/* Format Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Format</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                  <div className="space-y-3">
                    {formatOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="text-blue-600">
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={option.value} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-gray-600">{option.description}</p>
                            <p className="text-xs text-gray-500">{option.fileSize}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Section Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableSections.map(section => (
                    <div key={section.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={section.id}
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={(checked) => 
                          handleSectionToggle(section.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={section.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-sm text-gray-600">
                          {getSectionDescription(section.type)}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="include-charts"
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                      disabled={exportFormat === 'csv'}
                    />
                    <Label htmlFor="include-charts" className="cursor-pointer">
                      Include Charts and Visualizations
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="include-data"
                      checked={includeData}
                      onCheckedChange={(checked) => setIncludeData(checked === true)}
                    />
                    <Label htmlFor="include-data" className="cursor-pointer">
                      Include Raw Response Data
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="font-medium">{formatOptions.find(f => f.value === exportFormat)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sections:</span>
                    <span className="font-medium">{selectedSections.length} selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Count:</span>
                    <span className="font-medium">{data.analytics.totalResponses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-medium">{data.analytics.questionMetrics.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport}
                disabled={selectedSections.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Export Progress Component
interface ExportProgressProps {
  progress: number;
  format: string;
  error: string | null;
}

const ExportProgress: React.FC<ExportProgressProps> = ({ progress, format, error }) => {
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Export Failed</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (progress === 100) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-700 mb-2">Export Complete</h3>
        <p className="text-gray-600">Your {format.toUpperCase()} report has been generated and downloaded.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
      <h3 className="text-lg font-semibold mb-4">Generating {format.toUpperCase()} Report</h3>
      <div className="max-w-sm mx-auto">
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-gray-600">{progress}% complete</p>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        {progress < 30 && "Preparing data..."}
        {progress >= 30 && progress < 60 && "Processing analytics..."}
        {progress >= 60 && progress < 90 && "Generating report..."}
        {progress >= 90 && "Finalizing..."}
      </p>
    </div>
  );
};

// Helper function
const getSectionDescription = (type: string): string => {
  switch (type) {
    case 'overview':
      return 'Key metrics and executive summary';
    case 'charts':
      return 'Visual charts and graphs';
    case 'data':
      return 'Raw response data tables';
    case 'analysis':
      return 'Detailed analysis and recommendations';
    default:
      return '';
  }
};

ExportDialog.displayName = 'ExportDialog';