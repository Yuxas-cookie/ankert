'use client';

import React, { useMemo } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartData, ChartConfig, ChartInteractions, LikertScaleData } from '@/types/charts';

interface LikertScaleChartProps {
  data: ChartData;
  width: number | string;
  height: number | string;
  config: ChartConfig;
  interactions?: ChartInteractions;
  showPercentages?: boolean;
  showNPS?: boolean; // Net Promoter Score calculation
}

export const LikertScaleChart: React.FC<LikertScaleChartProps> = ({
  data,
  width,
  height,
  config,
  interactions,
  showPercentages = true,
  showNPS = false
}) => {
  // Prepare Likert scale data
  const likertData = useMemo(() => {
    if (data.series.length === 0) return [];
    
    const series = data.series[0];
    const total = series.data.reduce((sum, point) => sum + Number(point.y), 0);
    
    return series.data.map(point => ({
      label: point.label || String(point.x),
      value: Number(point.y),
      percentage: total > 0 ? (Number(point.y) / total) * 100 : 0,
      category: point.metadata?.category || 'neutral'
    })) as LikertScaleData[];
  }, [data]);

  // Calculate NPS if enabled
  const npsScore = useMemo(() => {
    if (!showNPS || likertData.length === 0) return null;
    
    const total = likertData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return null;

    // Assuming 1-10 scale: 1-6 = Detractors, 7-8 = Passives, 9-10 = Promoters
    let promoters = 0;
    let detractors = 0;

    likertData.forEach((item, index) => {
      const score = index + 1; // Assuming sequential scoring
      if (score >= 9) {
        promoters += item.value;
      } else if (score <= 6) {
        detractors += item.value;
      }
    });

    return ((promoters - detractors) / total) * 100;
  }, [likertData, showNPS]);

  // Define colors for Likert scale
  const getLikertColors = (length: number) => {
    if (length <= 5) {
      // 5-point scale: Red to Green
      return ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981'];
    } else if (length <= 7) {
      // 7-point scale
      return ['#DC2626', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#059669'];
    } else {
      // 10-point scale or custom
      return [
        '#DC2626', '#EF4444', '#F87171', '#F97316', '#FB923C',
        '#F59E0B', '#FBBF24', '#84CC16', '#10B981', '#059669'
      ];
    }
  };

  const colors = getLikertColors(likertData.length);

  // Handle bar clicks
  const handleBarClick = (data: any) => {
    if (interactions?.onDataPointClick) {
      const dataPoint = {
        x: data.label,
        y: data.value,
        label: data.label
      };
      interactions.onDataPointClick(dataPoint, 'likert-scale');
    }
  };

  const renderTooltip = (props: any) => {
    if (!props.active || !props.payload || props.payload.length === 0) return null;

    const data = props.payload[0].payload;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        <p className="font-medium">{data.label}</p>
        <p className="text-sm text-gray-600">
          Responses: {data.value}
        </p>
        {showPercentages && (
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage.toFixed(1)}%
          </p>
        )}
      </div>
    );
  };

  const formatYAxisLabel = (value: number) => {
    return showPercentages ? `${value}%` : value.toString();
  };

  return (
    <div style={{ width, height }}>
      {/* Chart */}
      <ResponsiveContainer width="100%" height="85%">
        <RechartsBarChart
          data={likertData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis 
            dataKey="label"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxisLabel}
            label={{
              value: showPercentages ? 'Percentage (%)' : 'Response Count',
              angle: -90,
              position: 'insideLeft'
            }}
          />
          
          <Tooltip content={renderTooltip} />
          
          <Bar 
            dataKey={showPercentages ? 'percentage' : 'value'}
            onClick={handleBarClick}
            className="cursor-pointer"
          >
            {likertData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>

      {/* Statistics Summary */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
        <div>
          <div className="font-semibold text-lg text-blue-600">
            {likertData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </div>
          <div className="text-gray-600">Total Responses</div>
        </div>
        
        <div>
          <div className="font-semibold text-lg text-green-600">
            {likertData.length > 0 ? 
              (likertData.reduce((sum, item, index) => sum + (item.value * (index + 1)), 0) / 
               likertData.reduce((sum, item) => sum + item.value, 0) || 0).toFixed(1) : 0}
          </div>
          <div className="text-gray-600">Average Score</div>
        </div>

        {showNPS && npsScore !== null && (
          <>
            <div className="col-span-2">
              <div className={`font-semibold text-lg ${
                npsScore > 50 ? 'text-green-600' : 
                npsScore > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {npsScore.toFixed(1)}
              </div>
              <div className="text-gray-600">Net Promoter Score</div>
            </div>
          </>
        )}
      </div>

      {/* Scale Legend */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Negative</span>
          <div className="flex space-x-1">
            {colors.slice(0, Math.floor(colors.length / 2)).map((color, index) => (
              <div key={index} className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span>Neutral</span>
          <div className="flex space-x-1">
            {colors.slice(Math.floor(colors.length / 2)).map((color, index) => (
              <div key={index} className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span>Positive</span>
        </div>
      </div>
    </div>
  );
};

LikertScaleChart.displayName = 'LikertScaleChart';