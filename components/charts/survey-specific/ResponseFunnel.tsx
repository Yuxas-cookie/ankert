'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer } from 'recharts';
import { ChartData, ChartConfig, ChartInteractions, ResponseFunnelData } from '@/types/charts';

interface ResponseFunnelProps {
  data: ChartData;
  width: number | string;
  height: number | string;
  config: ChartConfig;
  interactions?: ChartInteractions;
}

export const ResponseFunnel: React.FC<ResponseFunnelProps> = ({
  data,
  width,
  height,
  config,
  interactions
}) => {
  // Prepare funnel data
  const funnelData = useMemo(() => {
    if (data.series.length === 0) return [];
    
    const series = data.series[0];
    return series.data.map((point, index) => ({
      step: index + 1,
      label: point.label || String(point.x),
      value: Number(point.y),
      percentage: index === 0 ? 100 : (Number(point.y) / Number(series.data[0].y)) * 100,
      dropOff: index > 0 ? 
        ((Number(series.data[index - 1].y) - Number(point.y)) / Number(series.data[index - 1].y)) * 100 : 0
    })) as ResponseFunnelData[];
  }, [data]);

  // Handle funnel step clicks
  const handleStepClick = (stepData: ResponseFunnelData) => {
    if (interactions?.onDataPointClick) {
      const dataPoint = {
        x: stepData.step,
        y: stepData.value,
        label: stepData.label
      };
      interactions.onDataPointClick(dataPoint, 'funnel-step');
    }
  };

  // Calculate funnel segment widths
  const calculateWidth = (percentage: number, maxWidth: number) => {
    return Math.max((percentage / 100) * maxWidth, 50); // Minimum width of 50px
  };

  const maxBarWidth = 300;
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div style={{ width, height }} className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {funnelData.map((step, index) => {
          const barWidth = calculateWidth(step.percentage, maxBarWidth);
          const color = colors[index % colors.length];
          
          return (
            <div key={step.step} className="mb-3">
              {/* Funnel step bar */}
              <div 
                className="relative mx-auto cursor-pointer transition-all duration-200 hover:opacity-80"
                style={{ 
                  width: barWidth,
                  height: 50,
                  backgroundColor: color,
                  clipPath: index === funnelData.length - 1 ? 
                    'polygon(0 0, 100% 0, 100% 100%, 0 100%)' : // Rectangle for last step
                    'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)'
                }}
                onClick={() => handleStepClick(step)}
              >
                {/* Step content */}
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                  <span className="text-center px-2">
                    {step.label}
                  </span>
                </div>
                
                {/* Step number badge */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center">
                  {step.step}
                </div>
              </div>
              
              {/* Step statistics */}
              <div className="text-center mt-2 text-sm">
                <div className="font-semibold text-gray-800">
                  {step.value.toLocaleString()} responses
                </div>
                <div className="text-gray-600">
                  {step.percentage.toFixed(1)}% completion
                </div>
                {(step.dropOff || 0) > 0 && (
                  <div className="text-red-600 text-xs">
                    {(step.dropOff || 0).toFixed(1)}% drop-off
                  </div>
                )}
              </div>
              
              {/* Connector line */}
              {index < funnelData.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="w-px h-4 bg-gray-300"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-semibold text-lg text-blue-600">
            {funnelData.length > 0 ? funnelData[0].value.toLocaleString() : 0}
          </div>
          <div className="text-gray-600">Started</div>
        </div>
        <div>
          <div className="font-semibold text-lg text-green-600">
            {funnelData.length > 0 ? funnelData[funnelData.length - 1].value.toLocaleString() : 0}
          </div>
          <div className="text-gray-600">Completed</div>
        </div>
        <div>
          <div className="font-semibold text-lg text-purple-600">
            {funnelData.length > 0 ? funnelData[funnelData.length - 1].percentage.toFixed(1) : 0}%
          </div>
          <div className="text-gray-600">Conversion</div>
        </div>
      </div>
    </div>
  );
};

ResponseFunnel.displayName = 'ResponseFunnel';