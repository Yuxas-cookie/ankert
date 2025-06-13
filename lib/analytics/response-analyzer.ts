/**
 * 回答データ分析ヘルパー関数
 * 実際の回答データから統計情報を計算する
 */

import { SurveyWithQuestions } from '@/types/survey'

export interface ResponseAnalysis {
  totalResponses: number
  completedResponses: number
  completionRate: number
  avgCompletionTime: number // seconds
  medianCompletionTime: number
  responseVelocity: number // responses per day
  questionMetrics: QuestionMetric[]
  trendsData: TrendData[]
  deviceDistribution: DeviceData
  dropOffAnalysis: DropOffData[]
  responseTimeDistribution: TimeDistribution
}

export interface QuestionMetric {
  questionId: string
  question: string
  responseRate: number
  avgTime: number // seconds
  dropOffRate: number
  answeredCount: number
  skippedCount: number
}

export interface TrendData {
  date: Date
  count: number
  label: string
}

export interface DeviceData {
  mobile: number
  desktop: number
  tablet: number
  unknown: number
}

export interface DropOffData {
  questionIndex: number
  dropOffCount: number
  dropOffRate: number
}

export interface TimeDistribution {
  under1min: number
  '1to3min': number
  '3to5min': number
  '5to10min': number
  over10min: number
}

/**
 * 回答データを分析して統計情報を生成
 */
export function analyzeResponses(
  survey: SurveyWithQuestions,
  responses: any[]
): ResponseAnalysis {
  // 基本統計
  const totalResponses = responses.length
  const completedResponses = responses.filter(r => 
    r.status === 'completed' || r.submitted_at || r.completed_at
  ).length
  const completionRate = totalResponses > 0 
    ? (completedResponses / totalResponses) * 100 
    : 0

  // 回答時間の計算
  const completionTimes = calculateCompletionTimes(responses)
  const avgCompletionTime = calculateAverage(completionTimes)
  const medianCompletionTime = calculateMedian(completionTimes)

  // 回答速度（日あたりの回答数）
  const responseVelocity = calculateResponseVelocity(responses)

  // 質問ごとのメトリクス
  const questionMetrics = calculateQuestionMetrics(survey, responses)

  // トレンドデータ（過去30日）
  const trendsData = calculateTrends(responses, 30)

  // デバイス分布
  const deviceDistribution = calculateDeviceDistribution(responses)

  // ドロップオフ分析
  const dropOffAnalysis = calculateDropOffAnalysis(survey, responses)

  // 回答時間の分布
  const responseTimeDistribution = calculateTimeDistribution(completionTimes)

  return {
    totalResponses,
    completedResponses,
    completionRate,
    avgCompletionTime,
    medianCompletionTime,
    responseVelocity,
    questionMetrics,
    trendsData,
    deviceDistribution,
    dropOffAnalysis,
    responseTimeDistribution
  }
}

/**
 * 回答時間を計算（秒単位）
 */
function calculateCompletionTimes(responses: any[]): number[] {
  return responses
    .filter(r => r.time_spent || (r.started_at && (r.completed_at || r.submitted_at)))
    .map(r => {
      if (r.time_spent) {
        return r.time_spent
      }
      const startTime = new Date(r.started_at).getTime()
      const endTime = new Date(r.completed_at || r.submitted_at).getTime()
      return Math.floor((endTime - startTime) / 1000)
    })
    .filter(time => time > 0 && time < 3600) // 0秒より大きく1時間未満
}

/**
 * 平均値を計算
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * 中央値を計算
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

/**
 * 回答速度を計算（日あたりの回答数）
 */
function calculateResponseVelocity(responses: any[]): number {
  if (responses.length === 0) return 0
  
  const dates = responses
    .map(r => new Date(r.created_at || r.started_at).getTime())
    .sort((a, b) => a - b)
  
  if (dates.length === 1) return 1
  
  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]
  const daysDiff = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24))
  
  return responses.length / daysDiff
}

/**
 * 質問ごとのメトリクスを計算
 */
function calculateQuestionMetrics(
  survey: SurveyWithQuestions,
  responses: any[]
): QuestionMetric[] {
  return survey.questions.map((question, index) => {
    const answeredResponses = responses.filter(r => 
      r.response_data?.[question.id] !== undefined && 
      r.response_data?.[question.id] !== null &&
      r.response_data?.[question.id] !== ''
    )
    
    const answeredCount = answeredResponses.length
    const skippedCount = responses.length - answeredCount
    const responseRate = responses.length > 0 
      ? (answeredCount / responses.length) * 100 
      : 0

    // 前の質問から今の質問でのドロップオフ率を計算
    let dropOffRate = 0
    if (index > 0) {
      const prevQuestion = survey.questions[index - 1]
      const prevAnsweredCount = responses.filter(r => 
        r.response_data?.[prevQuestion.id] !== undefined
      ).length
      
      if (prevAnsweredCount > 0) {
        dropOffRate = ((prevAnsweredCount - answeredCount) / prevAnsweredCount) * 100
      }
    }

    // 平均回答時間（簡易計算：全体の平均時間を質問数で割る）
    const avgTime = responses.length > 0 && survey.questions.length > 0
      ? calculateAverage(calculateCompletionTimes(responses)) / survey.questions.length
      : 0

    return {
      questionId: question.id,
      question: question.question_text,
      responseRate,
      avgTime,
      dropOffRate: Math.max(0, dropOffRate),
      answeredCount,
      skippedCount
    }
  })
}

/**
 * トレンドデータを計算
 */
function calculateTrends(responses: any[], days: number): TrendData[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const trends: TrendData[] = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const count = responses.filter(r => {
      const responseDate = new Date(r.created_at || r.started_at)
      return responseDate >= date && responseDate < nextDate
    }).length
    
    trends.push({
      date: new Date(date),
      count,
      label: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    })
  }
  
  return trends
}

/**
 * デバイス分布を計算
 */
function calculateDeviceDistribution(responses: any[]): DeviceData {
  const distribution: DeviceData = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
    unknown: 0
  }
  
  responses.forEach(response => {
    const userAgent = response.user_agent?.toLowerCase() || ''
    
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      distribution.mobile++
    } else if (userAgent.includes('ipad') || userAgent.includes('tablet')) {
      distribution.tablet++
    } else if (userAgent.includes('windows') || userAgent.includes('mac') || userAgent.includes('linux')) {
      distribution.desktop++
    } else {
      distribution.unknown++
    }
  })
  
  return distribution
}

/**
 * ドロップオフ分析
 */
function calculateDropOffAnalysis(
  survey: SurveyWithQuestions,
  responses: any[]
): DropOffData[] {
  return survey.questions.map((question, index) => {
    const answeredUpToThis = responses.filter(response => {
      // この質問まで回答しているかチェック
      for (let i = 0; i <= index; i++) {
        const q = survey.questions[i]
        if (!response.response_data?.[q.id]) {
          return false
        }
      }
      return true
    }).length
    
    const answeredUpToPrevious = index > 0
      ? responses.filter(response => {
          for (let i = 0; i < index; i++) {
            const q = survey.questions[i]
            if (!response.response_data?.[q.id]) {
              return false
            }
          }
          return true
        }).length
      : responses.length
    
    const dropOffCount = answeredUpToPrevious - answeredUpToThis
    const dropOffRate = answeredUpToPrevious > 0
      ? (dropOffCount / answeredUpToPrevious) * 100
      : 0
    
    return {
      questionIndex: index,
      dropOffCount,
      dropOffRate: Math.max(0, dropOffRate)
    }
  })
}

/**
 * 回答時間の分布を計算
 */
function calculateTimeDistribution(completionTimes: number[]): TimeDistribution {
  const distribution: TimeDistribution = {
    under1min: 0,
    '1to3min': 0,
    '3to5min': 0,
    '5to10min': 0,
    over10min: 0
  }
  
  completionTimes.forEach(time => {
    if (time < 60) {
      distribution.under1min++
    } else if (time < 180) {
      distribution['1to3min']++
    } else if (time < 300) {
      distribution['3to5min']++
    } else if (time < 600) {
      distribution['5to10min']++
    } else {
      distribution.over10min++
    }
  })
  
  return distribution
}

/**
 * パーセンタイルを計算
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  
  const sorted = [...values].sort((a, b) => a - b)
  const index = (percentile / 100) * (sorted.length - 1)
  
  if (Number.isInteger(index)) {
    return sorted[index]
  }
  
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}