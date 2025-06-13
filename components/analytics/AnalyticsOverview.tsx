'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { motion } from 'framer-motion';
import { BaseChart } from '@/components/charts/base/BaseChart';
import { ChartData, ChartConfig, AnalyticsData } from '@/types/charts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Activity,
  CheckCircle
} from 'lucide-react';

interface AnalyticsOverviewProps {
  data: AnalyticsData;
  surveyId: string;
  loading?: boolean;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  data,
  surveyId,
  loading = false
}) => {
  // Prepare response trend chart data
  const responseTrendData: ChartData = useMemo(() => {
    if (!data.trends || data.trends.length === 0) {
      return { series: [] };
    }

    return {
      series: [{
        id: 'responses',
        name: '日次回答数',
        data: data.trends.map(trend => ({
          x: trend.timestamp,
          y: trend.value,
          label: trend.label || trend.timestamp.toDateString()
        }))
      }]
    };
  }, [data.trends]);

  // Prepare completion funnel data
  const funnelData: ChartData = useMemo(() => {
    if (!data.questionMetrics || data.questionMetrics.length === 0) {
      return { series: [] };
    }

    return {
      series: [{
        id: 'funnel',
        name: '質問完了率',
        data: data.questionMetrics.map((metric, index) => ({
          x: index + 1,
          y: metric.responseRate,
          label: `Q${index + 1}`,
          metadata: { questionId: metric.questionId, question: metric.question }
        }))
      }]
    };
  }, [data.questionMetrics]);

  // Demographics pie chart data
  const demographicsData: ChartData = useMemo(() => {
    if (!data.demographics?.device) {
      return { series: [] };
    }

    return {
      series: [{
        id: 'devices',
        name: 'デバイスタイプ',
        data: Object.entries(data.demographics.device).map(([device, count]) => ({
          x: device,
          y: count,
          label: device.charAt(0).toUpperCase() + device.slice(1)
        }))
      }]
    };
  }, [data.demographics]);

  const chartConfig: ChartConfig = {
    type: 'line',
    responsive: true,
    height: 300,
    animation: { duration: 300 }
  };

  const pieChartConfig: ChartConfig = {
    type: 'pie',
    responsive: true,
    height: 300,
    legend: { show: true, position: 'bottom' }
  };

  const funnelConfig: ChartConfig = {
    type: 'funnel',
    responsive: true,
    height: 400
  };

  if (loading) {
    return <AnalyticsOverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="総回答数"
          value={data.totalResponses.toLocaleString()}
          change={`+${Math.round(data.responseVelocity)} 件/日`}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        
        <MetricCard
          title="完了率"
          value={`${data.completionRate.toFixed(1)}%`}
          change={data.completionRate > 80 ? "優秀" : data.completionRate > 60 ? "良好" : "改善が必要"}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        
        <MetricCard
          title="平均回答時間"
          value={formatDuration(data.avgCompletionTime)}
          change={data.avgCompletionTime < 300 ? "短時間" : data.avgCompletionTime < 600 ? "適度" : "長時間"}
          icon={<Clock className="w-6 h-6" />}
          color="amber"
        />
        
        <MetricCard
          title="回答速度"
          value={`${Math.round(data.responseVelocity)}件/日`}
          change={data.responseVelocity > 50 ? "高速" : data.responseVelocity > 20 ? "中速" : "低速"}
          icon={<Activity className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CosmicCard variant="nebula">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                回答トレンド
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BaseChart
                data={responseTrendData}
                config={chartConfig}
                accessibility={{
                  description: "日次回答トレンドを示す折れ線グラフ"
                }}
              />
            </CardContent>
          </CosmicCard>
        </motion.div>

        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CosmicCard variant="aurora">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                デバイス分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BaseChart
                data={demographicsData}
                config={pieChartConfig}
                accessibility={{
                  description: "回答デバイスの分布を示す円グラフ"
                }}
              />
            </CardContent>
          </CosmicCard>
        </motion.div>
      </div>

      {/* Completion Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <CosmicCard variant="galaxy">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              アンケート完了ファネル
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BaseChart
              data={funnelData}
              config={funnelConfig}
              accessibility={{
                description: "各質問の完了率を示すファネルチャート"
              }}
            />
          </CardContent>
        </CosmicCard>
      </motion.div>

      {/* Question Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <CosmicCard variant="cosmic">
          <CardHeader>
            <CardTitle>質問パフォーマンス</CardTitle>
          </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">質問</th>
                  <th className="text-right p-2">回答率</th>
                  <th className="text-right p-2">平均時間</th>
                  <th className="text-right p-2">離脱率</th>
                </tr>
              </thead>
              <tbody>
                {data.questionMetrics.map((metric, index) => (
                  <tr key={metric.questionId} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">Q{index + 1}</div>
                      <div className="text-muted-foreground text-xs truncate max-w-xs">
                        {metric.question}
                      </div>
                    </td>
                    <td className="text-right p-2">
                      <span className={`font-medium ${
                        metric.responseRate > 90 ? 'text-green-600 dark:text-green-400' :
                        metric.responseRate > 75 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {metric.responseRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right p-2">
                      {metric.avgTime ? formatDuration(metric.avgTime) : '未計測'}
                    </td>
                    <td className="text-right p-2">
                      {metric.dropOffRate ? (
                        <span className={`font-medium ${
                          metric.dropOffRate < 5 ? 'text-green-600 dark:text-green-400' :
                          metric.dropOffRate < 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {metric.dropOffRate.toFixed(1)}%
                        </span>
                      ) : '未計測'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </CosmicCard>
      </motion.div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/5',
    green: 'text-green-600 bg-green-500/10 dark:text-green-400 dark:bg-green-500/5',
    amber: 'text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/5',
    purple: 'text-purple-600 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/5'
  };

  const gradientClasses = {
    blue: 'from-[var(--cosmic-star)]/20 to-transparent',
    green: 'from-[var(--cosmic-aurora)]/20 to-transparent',
    amber: 'from-[var(--cosmic-solar)]/20 to-transparent',
    purple: 'from-[var(--cosmic-nebula)]/20 to-transparent'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CosmicCard variant="glass" className="h-full">
        <CardContent className="p-6 relative overflow-hidden">
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[color]} opacity-50`} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <motion.p 
                  className="text-2xl font-bold text-foreground mt-2"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {value}
                </motion.p>
              </div>
              <motion.div 
                className={`p-3 rounded-lg ${colorClasses[color]}`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {icon}
              </motion.div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">{change}</span>
            </div>
          </div>
        </CardContent>
      </CosmicCard>
    </motion.div>
  );
};

// Loading Skeleton
const AnalyticsOverviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Utility function
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}秒`;
  }
  
  return `${minutes}分${remainingSeconds}秒`;
}

AnalyticsOverview.displayName = 'AnalyticsOverview';