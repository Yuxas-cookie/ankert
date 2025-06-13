'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ChartErrorProps {
  message: string;
  retry?: () => void;
}

export const ChartError: React.FC<ChartErrorProps> = ({ message, retry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <h3 className="text-lg font-semibold text-red-700 mb-2">Chart Error</h3>
      <p className="text-sm text-red-600 text-center mb-4 max-w-sm">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

ChartError.displayName = 'ChartError';