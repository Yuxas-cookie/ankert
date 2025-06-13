'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Users,
  Clock,
  Download,
  Settings,
  Filter,
  RefreshCw
} from 'lucide-react';

interface DashboardLayoutProps {
  surveyId?: string;
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  surveyId,
  children
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Analytics Dashboard
                </h1>
                {surveyId && (
                  <p className="text-sm text-gray-500">
                    Survey ID: {surveyId}
                  </p>
                )}
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Responses
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="overview" className="space-y-6">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="responses" className="space-y-6">
              <ResponsesTab />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsTab />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <InsightsTab />
            </TabsContent>
          </div>
        </Tabs>

        {/* Custom Content */}
        {children}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Key Metrics Cards */}
      <MetricCard
        title="Total Responses"
        value="1,234"
        change="+12%"
        changeType="positive"
        icon={<Users className="w-6 h-6" />}
      />
      
      <MetricCard
        title="Completion Rate"
        value="87.5%"
        change="+5.2%"
        changeType="positive"
        icon={<PieChart className="w-6 h-6" />}
      />
      
      <MetricCard
        title="Avg. Duration"
        value="4m 32s"
        change="-8s"
        changeType="positive"
        icon={<Clock className="w-6 h-6" />}
      />
      
      <MetricCard
        title="Response Rate"
        value="24.8%"
        change="+2.1%"
        changeType="positive"
        icon={<TrendingUp className="w-6 h-6" />}
      />
    </div>
  );
};

// Responses Tab Component
const ResponsesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Response Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Response tracking and management will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Comprehensive analytics charts and data will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Insights Tab Component
const InsightsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Machine learning insights and recommendations will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon
}) => {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }[changeType];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600">{icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <span className={`text-sm font-medium ${changeColor}`}>
            {change}
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      </CardContent>
    </Card>
  );
};

DashboardLayout.displayName = 'DashboardLayout';