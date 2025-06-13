'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ChartData, ChartConfig, ChartInteractions, AccessibilityConfig } from '@/types/charts';
import { ChartContainer } from './ChartContainer';
import { ChartError } from './ChartError';
import { ChartLoading } from './ChartLoading';
import { validateChartData } from '@/lib/charts/chart-validator';
import { processChartData } from '@/lib/charts/data-processor';

export interface BaseChartProps {
  data: ChartData;
  config: ChartConfig;
  interactions?: ChartInteractions;
  accessibility?: AccessibilityConfig;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  data,
  config,
  interactions,
  accessibility,
  className,
  loading = false,
  error = null
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [internalError, setInternalError] = useState<string | null>(null);

  // Handle responsive sizing
  useEffect(() => {
    if (!chartRef.current || !config.responsive) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(chartRef.current);
    return () => resizeObserver.disconnect();
  }, [config.responsive]);

  // Data validation and processing
  const processedData = useMemo(() => {
    try {
      setInternalError(null);
      
      // Validate data
      const isValid = validateChartData(data, config.type);
      if (!isValid) {
        throw new Error('Invalid chart data provided');
      }

      // Process data for chart consumption
      return processChartData(data, config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing chart data';
      setInternalError(errorMessage);
      return null;
    }
  }, [data, config]);

  // Accessibility setup
  const accessibilityProps = useMemo(() => ({
    role: 'img',
    'aria-label': accessibility?.description || `${config.type} chart`,
    'aria-describedby': accessibility?.detailedDescription ? 'chart-description' : undefined,
    tabIndex: accessibility?.keyboardNavigation ? 0 : undefined
  }), [accessibility, config.type]);

  // Handle errors
  const displayError = error || internalError;
  if (displayError) {
    return <ChartError message={displayError} />;
  }

  // Handle loading state
  if (loading || !processedData) {
    return <ChartLoading />;
  }

  return (
    <div 
      ref={chartRef}
      className={`chart-base ${className || ''}`}
      {...accessibilityProps}
    >
      <ChartContainer
        data={processedData}
        config={config}
        dimensions={config.responsive ? dimensions : undefined}
        interactions={interactions}
      />
      
      {accessibility?.detailedDescription && (
        <div id="chart-description" className="sr-only">
          {accessibility.detailedDescription}
        </div>
      )}
    </div>
  );
};

BaseChart.displayName = 'BaseChart';