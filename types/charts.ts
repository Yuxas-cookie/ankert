// Chart types and interfaces for analytics

export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'funnel' | 'likert' | 'heatmap' | 'wordcloud';

export interface DataPoint {
  x: string | number | Date;
  y: string | number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface DataSeries {
  id: string;
  name: string;
  data: DataPoint[];
  color?: string;
  style?: SeriesStyle;
}

export interface SeriesStyle {
  strokeWidth?: number;
  fillOpacity?: number;
  strokeDasharray?: string;
}

export interface ChartData {
  series: DataSeries[];
  metadata?: ChartMetadata;
}

export interface ChartMetadata {
  title?: string;
  description?: string;
  source?: string;
  lastUpdated?: Date;
}

export interface ChartConfig {
  type: ChartType;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;
  animation?: AnimationConfig;
  legend?: LegendConfig;
  axes?: AxisConfig;
  colors?: string[];
}

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

export interface LegendConfig {
  show?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

export interface AxisConfig {
  x?: {
    label?: string;
    type?: 'category' | 'number' | 'time';
    domain?: [number, number];
  };
  y?: {
    label?: string;
    type?: 'category' | 'number';
    domain?: [number, number];
  };
}

export interface ChartInteractions {
  onDataPointClick?: (data: DataPoint, seriesId: string) => void;
  onSelectionChange?: (selection: DataPoint[]) => void;
  onHover?: (data: DataPoint | null) => void;
}

export interface AccessibilityConfig {
  description?: string;
  detailedDescription?: string;
  keyboardNavigation?: boolean;
  screenReader?: boolean;
}

export interface ChartTheme {
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
    neutral: string[];
  };
  typography: {
    title: TextStyle;
    label: TextStyle;
    axis: TextStyle;
    legend: TextStyle;
  };
  spacing: {
    padding: number;
    margin: number;
    gap: number;
  };
}

export interface TextStyle {
  fontSize: number;
  fontWeight: number;
  color: string;
  fontFamily?: string;
}

// Survey-specific chart types
export interface ResponseFunnelData {
  step: number;
  label: string;
  value: number;
  percentage: number;
  dropOff?: number;
}

export interface LikertScaleData {
  label: string;
  value: number;
  percentage: number;
  category?: string;
}

export interface SentimentData {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  text?: string;
  timestamp?: Date;
}

// Analytics-specific types
export interface AnalyticsData {
  totalResponses: number;
  completionRate: number;
  avgCompletionTime: number;
  responseVelocity: number;
  questionMetrics: QuestionMetric[];
  demographics?: DemographicData;
  trends?: TimeSeriesData[];
}

export interface QuestionMetric {
  questionId: string;
  question: string;
  responseRate: number;
  avgTime?: number;
  dropOffRate?: number;
}

export interface DemographicData {
  age?: Record<string, number>;
  gender?: Record<string, number>;
  location?: Record<string, number>;
  device?: Record<string, number>;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

// Export and reporting types
export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'png' | 'svg';
  includeCharts?: boolean;
  includeData?: boolean;
  branding?: BrandingConfig;
}

export interface BrandingConfig {
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  typography: {
    headerFont: string;
    bodyFont: string;
  };
  footer?: string;
}