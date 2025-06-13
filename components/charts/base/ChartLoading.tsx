'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ChartLoadingProps {
  message?: string;
}

export const ChartLoading: React.FC<ChartLoadingProps> = ({ 
  message = "Loading chart..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
      <p className="text-sm text-gray-600">{message}</p>
      
      {/* Skeleton chart placeholder */}
      <div className="mt-4 w-3/4 h-32 bg-gray-200 rounded animate-pulse">
        <div className="h-full flex items-end justify-around p-4">
          <div className="bg-gray-300 w-8 h-16 rounded"></div>
          <div className="bg-gray-300 w-8 h-20 rounded"></div>
          <div className="bg-gray-300 w-8 h-12 rounded"></div>
          <div className="bg-gray-300 w-8 h-24 rounded"></div>
          <div className="bg-gray-300 w-8 h-18 rounded"></div>
        </div>
      </div>
    </div>
  );
};

ChartLoading.displayName = 'ChartLoading';