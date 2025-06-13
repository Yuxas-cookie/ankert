'use client';

import React, { useMemo } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartData, ChartConfig, ChartInteractions } from '@/types/charts';
import { prepareBarChartData, generateColors } from '@/lib/charts/data-processor';

interface BarChartProps {
  data: ChartData;
  width: number | string;
  height: number | string;
  config: ChartConfig;
  interactions?: ChartInteractions;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width,
  height,
  config,
  interactions
}) => {
  // Prepare data for Recharts
  const chartData = useMemo(() => prepareBarChartData(data), [data]);
  
  // Generate colors for series
  const colors = useMemo(() => 
    generateColors(data.series.length, config.colors), 
    [data.series.length, config.colors]
  );

  // Handle bar clicks
  const handleBarClick = (data: any, dataKey: string) => {
    if (interactions?.onDataPointClick) {
      const seriesId = dataKey;
      const dataPoint = {
        x: data.x,
        y: data[dataKey],
        label: data.label
      };
      interactions.onDataPointClick(dataPoint, seriesId);
    }
  };

  const renderTooltip = (props: any) => {
    if (!props.active || !props.payload || !props.label) return null;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        <p className="font-medium mb-2">{props.label}</p>
        {props.payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.dataKey}: {entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{
            top: config.legend?.show !== false ? 20 : 5,
            right: 30,
            left: 20,
            bottom: config.axes?.x?.label ? 40 : 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis 
            dataKey="x"
            tick={{ fontSize: 12 }}
            label={config.axes?.x?.label ? {
              value: config.axes.x.label,
              position: 'insideBottom',
              offset: -10
            } : undefined}
          />
          
          <YAxis 
            tick={{ fontSize: 12 }}
            domain={config.axes?.y?.domain}
            label={config.axes?.y?.label ? {
              value: config.axes.y.label,
              angle: -90,
              position: 'insideLeft'
            } : undefined}
          />
          
          <Tooltip content={renderTooltip} />
          
          {config.legend?.show !== false && (
            <Legend 
              verticalAlign={config.legend?.position === 'bottom' ? 'bottom' : 'top'}
              height={36}
            />
          )}
          
          {data.series.map((series, index) => (
            <Bar
              key={series.id}
              dataKey={series.id}
              name={series.name}
              fill={series.color || colors[index]}
              fillOpacity={series.style?.fillOpacity || 0.8}
              onClick={(data: any) => handleBarClick(data, series.id)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              animationDuration={config.animation?.duration || 300}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

BarChart.displayName = 'BarChart';