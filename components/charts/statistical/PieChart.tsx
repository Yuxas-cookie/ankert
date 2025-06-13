'use client';

import React, { useMemo } from 'react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartData, ChartConfig, ChartInteractions } from '@/types/charts';
import { preparePieChartData, generateColors } from '@/lib/charts/data-processor';

interface PieChartProps {
  data: ChartData;
  width: number | string;
  height: number | string;
  config: ChartConfig;
  interactions?: ChartInteractions;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  width,
  height,
  config,
  interactions
}) => {
  // Prepare data for Recharts
  const chartData = useMemo(() => preparePieChartData(data), [data]);
  
  // Generate colors for pie slices
  const colors = useMemo(() => 
    generateColors(chartData.length, config.colors), 
    [chartData.length, config.colors]
  );

  // Handle slice clicks
  const handleSliceClick = (data: any, index: number) => {
    if (interactions?.onDataPointClick) {
      const dataPoint = {
        x: data.name,
        y: data.value,
        label: data.label || data.name
      };
      interactions.onDataPointClick(dataPoint, 'pie-slice');
    }
  };

  const renderTooltip = (props: any) => {
    if (!props.active || !props.payload || props.payload.length === 0) return null;

    const data = props.payload[0].payload;
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-gray-600">
          Value: {data.value}
        </p>
        <p className="text-sm text-gray-600">
          Percentage: {percentage}%
        </p>
      </div>
    );
  };

  const renderLabel = (entry: any) => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
    return `${percentage}%`;
  };

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={Math.min(Number(height), Number(width)) * 0.3}
            fill="#8884d8"
            dataKey="value"
            animationDuration={config.animation?.duration || 300}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index]}
                onClick={() => handleSliceClick(entry, index)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          
          <Tooltip content={renderTooltip} />
          
          {config.legend?.show !== false && (
            <Legend 
              verticalAlign={config.legend?.position === 'bottom' ? 'bottom' : 'top'}
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value}
                </span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

PieChart.displayName = 'PieChart';