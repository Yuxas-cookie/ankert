'use client';

import React, { useMemo } from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartData, ChartConfig, ChartInteractions } from '@/types/charts';
import { prepareLineChartData, generateColors } from '@/lib/charts/data-processor';

interface LineChartProps {
  data: ChartData;
  width: number | string;
  height: number | string;
  config: ChartConfig;
  interactions?: ChartInteractions;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  config,
  interactions
}) => {
  // Prepare data for Recharts
  const chartData = useMemo(() => prepareLineChartData(data), [data]);
  
  // Generate colors for series
  const colors = useMemo(() => 
    generateColors(data.series.length, config.colors), 
    [data.series.length, config.colors]
  );

  // Handle data point clicks
  const handleDataPointClick = (data: any, dataKey: string) => {
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
              className="w-3 h-3 rounded-full" 
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
        <RechartsLineChart
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
            <Line
              key={series.id}
              dataKey={series.id}
              name={series.name}
              stroke={series.color || colors[index]}
              strokeWidth={series.style?.strokeWidth || 2}
              strokeDasharray={series.style?.strokeDasharray}
              dot={{ r: 4 }}
              activeDot={{ 
                r: 6, 
                onClick: (data: any) => handleDataPointClick(data.payload, series.id)
              }}
              animationDuration={config.animation?.duration || 300}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

LineChart.displayName = 'LineChart';