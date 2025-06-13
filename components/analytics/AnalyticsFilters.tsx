'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, 
  Calendar, 
  BarChart3, 
  RefreshCw,
  Download,
  X
} from 'lucide-react';

export interface AnalyticsFilter {
  dateRange: {
    start: Date | null;
    end: Date | null;
    preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  };
  questionTypes: string[];
  responseStatus: 'all' | 'completed' | 'in_progress';
  deviceTypes: string[];
}

interface AnalyticsFiltersProps {
  onFilterChange: (filters: AnalyticsFilter) => void;
  onExport?: () => void;
  questionTypes?: string[];
  loading?: boolean;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  onFilterChange,
  onExport,
  questionTypes = ['text', 'single_choice', 'multiple_choice', 'rating', 'date', 'matrix'],
  loading = false
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AnalyticsFilter>({
    dateRange: {
      start: null,
      end: null,
      preset: 'month'
    },
    questionTypes: questionTypes,
    responseStatus: 'all',
    deviceTypes: ['mobile', 'desktop', 'tablet']
  });

  // Date range presets
  const handleDatePreset = (preset: string) => {
    const now = new Date();
    let start = new Date();
    
    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    const newFilters = {
      ...filters,
      dateRange: {
        start: preset === 'custom' ? filters.dateRange.start : start,
        end: preset === 'custom' ? filters.dateRange.end : now,
        preset: preset as any
      }
    };

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Question type filter
  const handleQuestionTypeToggle = (type: string) => {
    const newTypes = filters.questionTypes.includes(type)
      ? filters.questionTypes.filter(t => t !== type)
      : [...filters.questionTypes, type];

    const newFilters = {
      ...filters,
      questionTypes: newTypes
    };

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Device type filter
  const handleDeviceTypeToggle = (device: string) => {
    const newDevices = filters.deviceTypes.includes(device)
      ? filters.deviceTypes.filter(d => d !== device)
      : [...filters.deviceTypes, device];

    const newFilters = {
      ...filters,
      deviceTypes: newDevices
    };

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Response status filter
  const handleResponseStatusChange = (status: 'all' | 'completed' | 'in_progress') => {
    const newFilters = {
      ...filters,
      responseStatus: status
    };

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Reset filters
  const handleReset = () => {
    const defaultFilters: AnalyticsFilter = {
      dateRange: {
        start: null,
        end: null,
        preset: 'month'
      },
      questionTypes: questionTypes,
      responseStatus: 'all',
      deviceTypes: ['mobile', 'desktop', 'tablet']
    };

    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    handleDatePreset('month');
  };

  const questionTypeLabels: Record<string, string> = {
    text: 'テキスト',
    single_choice: '単一選択',
    multiple_choice: '複数選択',
    rating: '評価',
    date: '日付',
    matrix: 'マトリックス'
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Date Range Quick Select */}
          <Select
            value={filters.dateRange.preset || 'custom'}
            onValueChange={handleDatePreset}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="week">過去7日間</SelectItem>
              <SelectItem value="month">過去30日間</SelectItem>
              <SelectItem value="quarter">過去3ヶ月</SelectItem>
              <SelectItem value="year">過去1年</SelectItem>
              <SelectItem value="custom">カスタム</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            詳細フィルター
            {showFilters && <X className="h-3 w-3" />}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange(filters)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>

        {/* Export Button */}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            エクスポート
          </Button>
        )}
      </div>

      {/* Detailed Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Custom Date Range */}
              {filters.dateRange.preset === 'custom' && (
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Label>開始日</Label>
                    <DateTimePicker
                      value={filters.dateRange.start}
                      onChange={(date) => {
                        const newFilters = {
                          ...filters,
                          dateRange: {
                            ...filters.dateRange,
                            start: date
                          }
                        };
                        setFilters(newFilters);
                        onFilterChange(newFilters);
                      }}
                      placeholder="開始日を選択"
                    />
                  </div>
                  <div>
                    <Label>終了日</Label>
                    <DateTimePicker
                      value={filters.dateRange.end}
                      onChange={(date) => {
                        const newFilters = {
                          ...filters,
                          dateRange: {
                            ...filters.dateRange,
                            end: date
                          }
                        };
                        setFilters(newFilters);
                        onFilterChange(newFilters);
                      }}
                      placeholder="終了日を選択"
                    />
                  </div>
                </div>
              )}

              {/* Question Types */}
              <div className="space-y-2">
                <Label>質問タイプ</Label>
                <div className="space-y-2">
                  {questionTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`qt-${type}`}
                        checked={filters.questionTypes.includes(type)}
                        onCheckedChange={() => handleQuestionTypeToggle(type)}
                      />
                      <label
                        htmlFor={`qt-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {questionTypeLabels[type] || type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Status */}
              <div className="space-y-2">
                <Label>回答ステータス</Label>
                <Select
                  value={filters.responseStatus}
                  onValueChange={handleResponseStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="completed">完了</SelectItem>
                    <SelectItem value="in_progress">回答中</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Device Types */}
              <div className="space-y-2">
                <Label>デバイスタイプ</Label>
                <div className="space-y-2">
                  {['mobile', 'desktop', 'tablet'].map(device => (
                    <div key={device} className="flex items-center space-x-2">
                      <Checkbox
                        id={`device-${device}`}
                        checked={filters.deviceTypes.includes(device)}
                        onCheckedChange={() => handleDeviceTypeToggle(device)}
                      />
                      <label
                        htmlFor={`device-${device}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {device === 'mobile' ? 'モバイル' : 
                         device === 'desktop' ? 'デスクトップ' : 'タブレット'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                フィルターをリセット
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {(filters.questionTypes.length < questionTypes.length || 
        filters.responseStatus !== 'all' || 
        filters.deviceTypes.length < 3) && (
        <div className="flex flex-wrap gap-2">
          {filters.questionTypes.length < questionTypes.length && (
            <div className="text-sm text-muted-foreground">
              質問タイプ: {filters.questionTypes.map(t => questionTypeLabels[t]).join(', ')}
            </div>
          )}
          {filters.responseStatus !== 'all' && (
            <div className="text-sm text-muted-foreground">
              ステータス: {filters.responseStatus === 'completed' ? '完了' : '回答中'}
            </div>
          )}
          {filters.deviceTypes.length < 3 && (
            <div className="text-sm text-muted-foreground">
              デバイス: {filters.deviceTypes.map(d => 
                d === 'mobile' ? 'モバイル' : 
                d === 'desktop' ? 'デスクトップ' : 'タブレット'
              ).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

AnalyticsFilters.displayName = 'AnalyticsFilters';