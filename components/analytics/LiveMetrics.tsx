'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Clock, 
  Wifi, 
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useRealTimeMetrics } from '@/hooks/analytics/useRealTimeMetrics';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface LiveMetricsProps {
  surveyId: string;
  enabled?: boolean;
  showDetailedActivity?: boolean;
}

export const LiveMetrics: React.FC<LiveMetricsProps> = ({
  surveyId,
  enabled = true,
  showDetailedActivity = false
}) => {
  const [showActivity, setShowActivity] = useState(showDetailedActivity);
  
  const {
    metrics,
    isConnected,
    connectionError,
    recentActivity,
    responseVelocity,
    completionVelocity,
    getActivityInTimeRange,
    reconnect
  } = useRealTimeMetrics({
    surveyId,
    enabled,
    onUpdate: (update) => {
      // Optional: Show toast notifications for new responses
      console.log('New activity:', update);
    }
  });

  const formatLastResponseTime = (date: Date | null) => {
    if (!date) return 'まだ回答がありません';
    return formatDistanceToNow(date, { addSuffix: true, locale: ja });
  };

  const getConnectionStatusColor = () => {
    if (!isConnected) return 'text-red-500';
    return 'text-green-500';
  };

  const getConnectionStatusIcon = () => {
    if (!isConnected) return <WifiOff className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={getConnectionStatusColor()}>
                {getConnectionStatusIcon()}
              </div>
              <span className="text-sm font-medium">
                {isConnected ? 'リアルタイム接続中' : '切断されています'}
              </span>
              {connectionError && (
                <Badge variant="destructive" className="text-xs">
                  エラー
                </Badge>
              )}
            </div>
            
            {!isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={reconnect}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                再接続
              </Button>
            )}
          </div>
          
          {connectionError && (
            <div className="mt-2 p-2 bg-red-50 rounded-md flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{connectionError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiveMetricCard
          title="現在アクティブ"
          value={metrics.activeRespondents}
          suffix="人"
          icon={<Users className="w-5 h-5" />}
          color="blue"
          pulse={metrics.activeRespondents > 0}
        />
        
        <LiveMetricCard
          title="総回答数"
          value={metrics.responseCount}
          suffix=""
          icon={<Activity className="w-5 h-5" />}
          color="green"
          change={`+${responseVelocity}件/時間`}
        />
        
        <LiveMetricCard
          title="完了率"
          value={metrics.completionRate}
          suffix="%"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="purple"
          decimals={1}
        />
        
        <LiveMetricCard
          title="最終回答"
          value={formatLastResponseTime(metrics.lastResponseTime)}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          isTime={true}
        />
      </div>

      {/* Velocity Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            回答速度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {responseVelocity}
              </div>
              <div className="text-sm text-gray-600">新規/時間</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completionVelocity}
              </div>
              <div className="text-sm text-gray-600">完了/時間</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getActivityInTimeRange(5).length}
              </div>
              <div className="text-sm text-gray-600">過去5分間</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              最近のアクティビティ
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActivity(!showActivity)}
            >
              {showActivity ? '非表示' : '表示'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <ActivityIcon type={activity.type} />
                  <span className="text-sm">
                    {getActivityDescription(activity)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ja })}
                </span>
              </div>
            ))}
            
            {recentActivity.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                最近のアクティビティはありません
              </div>
            )}
          </div>
          
          {showActivity && recentActivity.length > 5 && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-2">
                {recentActivity.slice(5, 15).map((activity, index) => (
                  <div
                    key={index + 5}
                    className="flex items-center justify-between p-2 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <ActivityIcon type={activity.type} size="sm" />
                      <span className="text-sm">
                        {getActivityDescription(activity)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ja })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Live Metric Card Component
interface LiveMetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  change?: string;
  pulse?: boolean;
  isTime?: boolean;
  decimals?: number;
}

const LiveMetricCard: React.FC<LiveMetricCardProps> = ({
  title,
  value,
  suffix = '',
  icon,
  color,
  change,
  pulse = false,
  isTime = false,
  decimals = 0
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50'
  };

  const formatValue = () => {
    if (isTime) return value;
    if (typeof value === 'number') {
      return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
    }
    return value;
  };

  return (
    <Card className={pulse ? 'animate-pulse' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {formatValue()}
              </p>
              {suffix && (
                <p className="text-sm text-gray-500 ml-1">{suffix}</p>
              )}
            </div>
            {change && (
              <p className="text-sm text-gray-500 mt-1">{change}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Activity Icon Component
const ActivityIcon: React.FC<{ 
  type: 'response_created' | 'response_updated' | 'response_deleted';
  size?: 'sm' | 'md';
}> = ({ type, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  
  switch (type) {
    case 'response_created':
      return <div className={`${sizeClass} bg-green-500 rounded-full`} />;
    case 'response_updated':
      return <div className={`${sizeClass} bg-blue-500 rounded-full`} />;
    case 'response_deleted':
      return <div className={`${sizeClass} bg-red-500 rounded-full`} />;
  }
};

// Activity Description Helper
const getActivityDescription = (activity: any): string => {
  switch (activity.type) {
    case 'response_created':
      return '新しい回答が始まりました';
    case 'response_updated':
      return activity.data.new?.status === 'completed' ? 
        '回答が完了しました' : '回答が更新されました';
    case 'response_deleted':
      return '回答が削除されました';
    default:
      return '不明なアクティビティ';
  }
};

LiveMetrics.displayName = 'LiveMetrics';