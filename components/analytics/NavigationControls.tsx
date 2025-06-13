'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Search,
  ChevronDown
} from 'lucide-react';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterOptions {
  dateRange: DateRange;
  surveyId?: string;
  demographics: string[];
  devices: string[];
  sources: string[];
}

interface NavigationControlsProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onRefresh: () => void;
  onExport: () => void;
  availableSurveys?: Array<{ id: string; title: string }>;
  loading?: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  onExport,
  availableSurveys = [],
  loading = false
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Predefined date ranges
  const dateRangeOptions = [
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'Last 3 months', value: 'last3months' },
    { label: 'Last 6 months', value: 'last6months' },
    { label: 'Last year', value: 'lastyear' },
    { label: 'Custom range', value: 'custom' }
  ];

  const handleDateRangeChange = (value: string) => {
    const now = new Date();
    let start: Date;
    
    switch (value) {
      case 'last7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last3months':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'last6months':
        start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'lastyear':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return; // Custom range - would open date picker
    }

    onFiltersChange({
      ...filters,
      dateRange: { start, end: now }
    });
  };

  const handleSurveyChange = (surveyId: string) => {
    onFiltersChange({
      ...filters,
      surveyId: surveyId === 'all' ? undefined : surveyId
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Survey Selector */}
            {availableSurveys.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Survey:</label>
                <Select value={filters.surveyId || 'all'} onValueChange={handleSurveyChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select survey" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Surveys</SelectItem>
                    {availableSurveys.map(survey => (
                      <SelectItem key={survey.id} value={survey.id}>
                        {survey.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <Select onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Demographics Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Demographics
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All demographics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Demographics</SelectItem>
                    <SelectItem value="18-24">Age 18-24</SelectItem>
                    <SelectItem value="25-34">Age 25-34</SelectItem>
                    <SelectItem value="35-44">Age 35-44</SelectItem>
                    <SelectItem value="45-54">Age 45-54</SelectItem>
                    <SelectItem value="55+">Age 55+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Device Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Device Type
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All devices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Traffic Source
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="search">Search Engine</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                {filters.demographics.length > 0 || filters.devices.length > 0 || filters.sources.length > 0 ? (
                  <span>
                    {[...filters.demographics, ...filters.devices, ...filters.sources].length} filter(s) applied
                  </span>
                ) : (
                  <span>No advanced filters applied</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange({
                    ...filters,
                    demographics: [],
                    devices: [],
                    sources: []
                  })}
                >
                  Clear Filters
                </Button>
                
                <Button size="sm">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      <ActiveFiltersSummary 
        filters={filters}
        onRemoveFilter={(filterType, value) => {
          const updatedFilters = { ...filters };
          if (filterType === 'demographics' || filterType === 'devices' || filterType === 'sources') {
            const currentValue = updatedFilters[filterType] as string[];
            updatedFilters[filterType] = currentValue.filter(item => item !== value);
          }
          onFiltersChange(updatedFilters);
        }}
      />
    </div>
  );
};

// Active Filters Summary Component
interface ActiveFiltersSummaryProps {
  filters: FilterOptions;
  onRemoveFilter: (filterType: string, value: string) => void;
}

const ActiveFiltersSummary: React.FC<ActiveFiltersSummaryProps> = ({
  filters,
  onRemoveFilter
}) => {
  const activeFilters = [
    ...filters.demographics.map(demo => ({ type: 'demographics', value: demo, label: `Demo: ${demo}` })),
    ...filters.devices.map(device => ({ type: 'devices', value: device, label: `Device: ${device}` })),
    ...filters.sources.map(source => ({ type: 'sources', value: source, label: `Source: ${source}` }))
  ];

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Active filters:</span>
      {activeFilters.map((filter, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemoveFilter(filter.type, filter.value)}
            className="text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

NavigationControls.displayName = 'NavigationControls';