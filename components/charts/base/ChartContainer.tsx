'use client';

import React from 'react';
import { ChartData, ChartConfig, ChartInteractions } from '@/types/charts';
import { LineChart } from '../statistical/LineChart';
import { BarChart } from '../statistical/BarChart';
import { PieChart } from '../statistical/PieChart';
import { ResponseFunnel } from '../survey-specific/ResponseFunnel';
import { LikertScaleChart } from '../survey-specific/LikertScaleChart';

interface ChartContainerProps {
  data: ChartData;
  config: ChartConfig;
  dimensions?: { width: number; height: number };
  interactions?: ChartInteractions;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  config,
  dimensions,
  interactions
}) => {
  const chartWidth = dimensions?.width || config.width || 400;
  const chartHeight = dimensions?.height || config.height || 300;

  const commonProps = {
    data,
    width: chartWidth,
    height: chartHeight,
    config,
    interactions
  };

  switch (config.type) {
    case 'line':
      return <LineChart {...commonProps} />;
    case 'bar':
      return <BarChart {...commonProps} />;
    case 'pie':
      return <PieChart {...commonProps} />;
    case 'funnel':
      return <ResponseFunnel {...commonProps} />;
    case 'likert':
      return <LikertScaleChart {...commonProps} />;
    default:
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Chart type "{config.type}" not yet implemented</p>
        </div>
      );
  }
};

ChartContainer.displayName = 'ChartContainer';