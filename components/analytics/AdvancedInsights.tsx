'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  BarChart3,
  Users,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  StatisticalAnalyzer,
  StatisticalTest,
  CorrelationResult,
  DescriptiveStats,
  TrendAnalysis
} from '@/lib/analytics/StatisticalAnalyzer';
import {
  TextAnalyzer,
  SentimentAnalysis,
  TextInsight,
  WordCloudData,
  TopicAnalysis
} from '@/lib/analytics/TextAnalyzer';
import { AnalyticsData, QuestionMetric } from '@/types/charts';

interface AdvancedInsightsProps {
  data: AnalyticsData;
  textResponses?: { questionId: string; responses: string[] }[];
  onInsightGenerated?: (insight: any) => void;
}

export const AdvancedInsights: React.FC<AdvancedInsightsProps> = ({
  data,
  textResponses = [],
  onInsightGenerated
}) => {
  const [activeTab, setActiveTab] = useState('statistical');
  const [loading, setLoading] = useState(false);
  const [statisticalResults, setStatisticalResults] = useState<any>(null);
  const [textAnalysisResults, setTextAnalysisResults] = useState<any>(null);

  const statisticalAnalyzer = new StatisticalAnalyzer();
  const textAnalyzer = new TextAnalyzer();

  useEffect(() => {
    generateInsights();
  }, [data, textResponses]);

  const generateInsights = async () => {
    setLoading(true);
    
    try {
      // Generate statistical insights
      const statistical = await generateStatisticalInsights();
      setStatisticalResults(statistical);

      // Generate text analysis insights
      if (textResponses.length > 0) {
        const textAnalysis = await generateTextInsights();
        setTextAnalysisResults(textAnalysis);
      }

      // Notify parent component
      if (onInsightGenerated) {
        onInsightGenerated({
          statistical,
          textAnalysis: textAnalysisResults
        });
      }

    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStatisticalInsights = async () => {
    const results: any = {};

    // Analyze question performance
    if (data.questionMetrics && data.questionMetrics.length > 0) {
      results.questionPerformance = statisticalAnalyzer.analyzeQuestionPerformance(data.questionMetrics);
      
      // Calculate descriptive statistics for response rates
      const responseRates = data.questionMetrics.map(q => q.responseRate);
      if (responseRates.length > 0) {
        results.responseRateStats = statisticalAnalyzer.calculateDescriptiveStats(responseRates);
      }

      // Calculate correlations between metrics
      const avgTimes = data.questionMetrics.filter(q => q.avgTime).map(q => q.avgTime!);
      if (avgTimes.length > 2 && responseRates.length > 2) {
        const minLength = Math.min(avgTimes.length, responseRates.length);
        results.timeResponseCorrelation = statisticalAnalyzer.calculateCorrelation(
          avgTimes.slice(0, minLength),
          responseRates.slice(0, minLength)
        );
      }
    }

    // Analyze response trends
    if (data.trends && data.trends.length > 3) {
      const trendValues = data.trends.map(t => t.value);
      const trendDates = data.trends.map(t => new Date(t.timestamp));
      
      results.trendAnalysis = statisticalAnalyzer.analyzeTrend(trendDates, trendValues);
    }

    // Demographic analysis
    if (data.demographics) {
      results.demographicInsights = analyzeDemographics(data.demographics);
    }

    return results;
  };

  const generateTextInsights = async () => {
    const results: any = {};

    // Combine all text responses
    const allTexts = textResponses.flatMap(q => q.responses);
    
    if (allTexts.length > 0) {
      // Sentiment analysis
      results.sentiment = textAnalyzer.analyzeSentiment(allTexts);
      
      // Extract insights
      results.insights = textAnalyzer.extractInsights(allTexts);
      
      // Topic analysis
      results.topics = textAnalyzer.analyzeTopics(allTexts);
      
      // Language metrics
      results.languageMetrics = textAnalyzer.analyzeLanguageMetrics(allTexts);
      
      // Word cloud data
      results.wordCloud = textAnalyzer.generateWordCloudData(allTexts, 50);
    }

    // Question-specific analysis
    results.questionAnalysis = {};
    textResponses.forEach(question => {
      if (question.responses.length > 0) {
        results.questionAnalysis[question.questionId] = {
          sentiment: textAnalyzer.analyzeSentiment(question.responses),
          insights: textAnalyzer.extractInsights(question.responses),
          wordCloud: textAnalyzer.generateWordCloudData(question.responses, 20)
        };
      }
    });

    return results;
  };

  const analyzeDemographics = (demographics: any) => {
    const insights: any = {};

    // Analyze device distribution
    if (demographics.device) {
      const deviceData = Object.entries(demographics.device).map(([device, count]) => ({
        device,
        count: count as number
      }));
      
      const total = deviceData.reduce((sum, d) => sum + d.count, 0);
      insights.device = {
        data: deviceData,
        dominantDevice: deviceData.reduce((max, current) => 
          current.count > max.count ? current : max
        ),
        diversity: deviceData.length / total // Simple diversity metric
      };
    }

    // Analyze age distribution
    if (demographics.age) {
      const ageData = Object.entries(demographics.age).map(([age, count]) => ({
        age,
        count: count as number
      }));
      
      insights.age = {
        data: ageData,
        dominantAge: ageData.reduce((max, current) => 
          current.count > max.count ? current : max
        )
      };
    }

    return insights;
  };

  const renderStatisticalInsights = () => {
    if (!statisticalResults) return <div>統計データがありません</div>;

    return (
      <div className="space-y-6">
        {/* Question Performance Analysis */}
        {statisticalResults.questionPerformance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                質問パフォーマンス分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Problematic Questions */}
                {statisticalResults.questionPerformance.problematicQuestions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      注意が必要な質問 ({statisticalResults.questionPerformance.problematicQuestions.length})
                    </h4>
                    <div className="space-y-2">
                      {statisticalResults.questionPerformance.problematicQuestions.slice(0, 3).map((question: QuestionMetric, index: number) => (
                        <div key={index} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 dark:bg-yellow-500/5 dark:border-yellow-500/10">
                          <p className="text-sm font-medium">{question.question.substring(0, 100)}...</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>回答率: {question.responseRate.toFixed(1)}%</span>
                            {question.avgTime && <span>平均時間: {question.avgTime}秒</span>}
                            {question.dropOffRate && <span>離脱率: {question.dropOffRate.toFixed(1)}%</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {statisticalResults.questionPerformance.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">推奨事項</h4>
                    <div className="space-y-2">
                      {statisticalResults.questionPerformance.recommendations.slice(0, 5).map((rec: string, index: number) => (
                        <div key={index} className="p-2 bg-blue-500/10 rounded border-l-4 border-blue-500 dark:bg-blue-500/5">
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response Rate Statistics */}
        {statisticalResults.responseRateStats && (
          <Card>
            <CardHeader>
              <CardTitle>回答率統計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statisticalResults.responseRateStats.mean.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">平均</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statisticalResults.responseRateStats.median.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">中央値</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statisticalResults.responseRateStats.standardDeviation.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">標準偏差</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statisticalResults.responseRateStats.range.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">範囲</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Correlation Analysis */}
        {statisticalResults.timeResponseCorrelation && (
          <Card>
            <CardHeader>
              <CardTitle>相関: 回答時間 vs 回答率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      statisticalResults.timeResponseCorrelation.direction === 'positive' 
                        ? 'bg-green-500 dark:bg-green-400' 
                        : 'bg-red-500 dark:bg-red-400'
                    }`} />
                    <span className="font-medium">
                      {statisticalResults.timeResponseCorrelation.strength === 'strong' ? '強い' : statisticalResults.timeResponseCorrelation.strength === 'moderate' ? '中程度の' : '弱い'} {statisticalResults.timeResponseCorrelation.direction === 'positive' ? '正の' : '負の'}相関
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    相関係数: {statisticalResults.timeResponseCorrelation.coefficient.toFixed(3)}
                  </p>
                  {statisticalResults.timeResponseCorrelation.significance && (
                    <Badge variant={statisticalResults.timeResponseCorrelation.significance === 'significant' ? 'default' : 'secondary'}>
                      {statisticalResults.timeResponseCorrelation.significance}
                    </Badge>
                  )}
                </div>
                <div className="w-32">
                  <Progress 
                    value={Math.abs(statisticalResults.timeResponseCorrelation.coefficient) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trend Analysis */}
        {statisticalResults.trendAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {statisticalResults.trendAnalysis.trend === 'increasing' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : statisticalResults.trendAnalysis.trend === 'decreasing' ? (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                ) : (
                  <BarChart3 className="w-5 h-5 text-gray-500" />
                )}
                回答トレンド分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold capitalize text-blue-600 dark:text-blue-400">
                      {statisticalResults.trendAnalysis.trend === 'increasing' ? '上昇' : statisticalResults.trendAnalysis.trend === 'decreasing' ? '下降' : '横ばい'}
                    </p>
                    <p className="text-sm text-muted-foreground">トレンド方向</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {(statisticalResults.trendAnalysis.rSquared * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">トレンド強度</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {statisticalResults.trendAnalysis.slope > 0 ? '+' : ''}{statisticalResults.trendAnalysis.slope.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">日次変化</p>
                  </div>
                </div>

                {/* Forecast */}
                {statisticalResults.trendAnalysis.forecast && (
                  <div>
                    <h4 className="font-medium mb-2">7日間予測</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={statisticalResults.trendAnalysis.forecast}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(date) => new Date(date).toLocaleDateString()}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(date) => new Date(date).toLocaleDateString()}
                            formatter={(value: number, name: string) => [
                              Math.round(value), 
                              name === 'predicted' ? '予測値' : '信頼区間'
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="predicted" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTextAnalysis = () => {
    if (!textAnalysisResults) return <div>テキスト分析データがありません</div>;

    return (
      <div className="space-y-6">
        {/* Overall Sentiment */}
        {textAnalysisResults.sentiment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                感情分析概要
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    textAnalysisResults.sentiment.overall.label === 'positive' ? 'text-green-600 dark:text-green-400' :
                    textAnalysisResults.sentiment.overall.label === 'negative' ? 'text-red-600 dark:text-red-400' :
                    'text-muted-foreground'
                  }`}>
                    {textAnalysisResults.sentiment.overall.label.toUpperCase()}
                  </div>
                  <p className="text-sm text-muted-foreground">全体の感情</p>
                  <p className="text-xs text-muted-foreground/80">
                    スコア: {textAnalysisResults.sentiment.overall.score.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">感情の分布</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ポジティブ</span>
                      <div className="flex items-center gap-2">
                        <Progress value={textAnalysisResults.sentiment.breakdown.positive} className="w-20 h-2" />
                        <span className="text-sm font-medium">
                          {textAnalysisResults.sentiment.breakdown.positive.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ニュートラル</span>
                      <div className="flex items-center gap-2">
                        <Progress value={textAnalysisResults.sentiment.breakdown.neutral} className="w-20 h-2" />
                        <span className="text-sm font-medium">
                          {textAnalysisResults.sentiment.breakdown.neutral.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ネガティブ</span>
                      <div className="flex items-center gap-2">
                        <Progress value={textAnalysisResults.sentiment.breakdown.negative} className="w-20 h-2" />
                        <span className="text-sm font-medium">
                          {textAnalysisResults.sentiment.breakdown.negative.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">重要な感情ワード</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">ポジティブ</p>
                      <div className="flex flex-wrap gap-1">
                        {textAnalysisResults.sentiment.keywords.positive.slice(0, 5).map((word: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">ネガティブ</p>
                      <div className="flex flex-wrap gap-1">
                        {textAnalysisResults.sentiment.keywords.negative.slice(0, 5).map((word: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Insights */}
        {textAnalysisResults.insights && textAnalysisResults.insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                重要なインサイト
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {textAnalysisResults.insights.slice(0, 8).map((insight: TextInsight, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          insight.type === 'praise' ? 'default' :
                          insight.type === 'complaint' || insight.type === 'issue' ? 'destructive' :
                          insight.type === 'suggestion' ? 'secondary' :
                          'outline'
                        }>
                          {insight.type === 'praise' ? '称賛' : insight.type === 'complaint' ? '苦情' : insight.type === 'issue' ? '問題' : insight.type === 'suggestion' ? '提案' : insight.type}
                        </Badge>
                        <Badge variant="outline">
                          {insight.frequency} 件の言及
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${
                          insight.sentiment === 'positive' ? 'bg-green-500 dark:bg-green-400' :
                          insight.sentiment === 'negative' ? 'bg-red-500 dark:bg-red-400' :
                          'bg-muted'
                        }`} />
                      </div>
                    </div>
                    <p className="font-medium mb-1">{insight.content}</p>
                    {insight.examples.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        "{insight.examples[0].substring(0, 100)}..."
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Topics Analysis */}
        {textAnalysisResults.topics && textAnalysisResults.topics.topics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>トピック分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {textAnalysisResults.topics.topics.slice(0, 6).map((topic: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{topic.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {topic.frequency} 件の回答
                        </Badge>
                        <div className={`px-2 py-1 rounded text-xs ${
                          topic.averageSentiment > 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                          topic.averageSentiment < 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {topic.averageSentiment > 0 ? 'ポジティブ' :
                           topic.averageSentiment < 0 ? 'ネガティブ' : 'ニュートラル'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {topic.keywords.slice(0, 8).map((keyword: string, kIndex: number) => (
                        <Badge key={kIndex} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    {topic.examples.length > 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        "{topic.examples[0].substring(0, 120)}..."
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Language Metrics */}
        {textAnalysisResults.languageMetrics && (
          <Card>
            <CardHeader>
              <CardTitle>言語・コミュニケーション指標</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(textAnalysisResults.languageMetrics.averageLength)}
                  </p>
                  <p className="text-sm text-muted-foreground">平均回答長</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(textAnalysisResults.languageMetrics.readabilityScore)}
                  </p>
                  <p className="text-sm text-muted-foreground">読みやすさスコア</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(textAnalysisResults.languageMetrics.vocabularyDiversity * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-muted-foreground">語彙の多様性</p>
                </div>
                <div className="text-center">
                  <Badge variant={
                    textAnalysisResults.languageMetrics.languageComplexity === 'simple' ? 'default' :
                    textAnalysisResults.languageMetrics.languageComplexity === 'moderate' ? 'secondary' :
                    'destructive'
                  }>
                    {textAnalysisResults.languageMetrics.languageComplexity}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">言語の複雑さ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium">高度なインサイトを生成中</p>
            <p className="text-sm text-muted-foreground">データパターンとトレンドを分析しています...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">高度な分析とインサイト</h2>
          <p className="text-muted-foreground">統計分析とテキストマイニングのインサイト</p>
        </div>
        <Button onClick={generateInsights} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          インサイトを更新
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="statistical" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            統計分析
          </TabsTrigger>
          <TabsTrigger 
            value="text" 
            className="flex items-center gap-2"
            disabled={!textResponses || textResponses.length === 0}
          >
            <MessageSquare className="w-4 h-4" />
            テキスト分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statistical" className="space-y-6">
          {renderStatisticalInsights()}
        </TabsContent>

        <TabsContent value="text" className="space-y-6">
          {renderTextAnalysis()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

AdvancedInsights.displayName = 'AdvancedInsights';