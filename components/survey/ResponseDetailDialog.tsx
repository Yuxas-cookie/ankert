'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Clock, 
  User, 
  Globe,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface ResponseDetailDialogProps {
  open: boolean
  onClose: () => void
  response: any
  loading?: boolean
}

export function ResponseDetailDialog({ 
  open, 
  onClose, 
  response,
  loading = false 
}: ResponseDetailDialogProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getQuestionAnswer = (questionId: string) => {
    return response?.response_data?.[questionId] || null
  }

  const formatAnswer = (answer: any, questionType: string) => {
    if (answer === null || answer === undefined) {
      return <span className="text-muted-foreground">回答なし</span>
    }

    switch (questionType) {
      case 'multiple_choice':
        if (Array.isArray(answer)) {
          return (
            <div className="space-y-1">
              {answer.map((item, index) => (
                <Badge key={index} variant="secondary" className="mr-2">
                  {item}
                </Badge>
              ))}
            </div>
          )
        }
        break
      
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-xl ${
                  i < Number(answer) ? 'text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground/30'
                }`}
              >
                ★
              </span>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              ({answer}/5)
            </span>
          </div>
        )
      
      case 'matrix':
        if (typeof answer === 'object' && !Array.isArray(answer)) {
          return (
            <div className="space-y-2">
              {Object.entries(answer).map(([row, value]) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="text-sm font-medium">{row}:</span>
                  <Badge variant="outline">{String(value)}</Badge>
                </div>
              ))}
            </div>
          )
        }
        break
      
      case 'date':
        try {
          return formatDate(answer)
        } catch {
          return String(answer)
        }
      
      default:
        return <span className="whitespace-pre-wrap">{String(answer)}</span>
    }

    return String(answer)
  }

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Smartphone className="h-4 w-4" />
    
    const lowerAgent = userAgent.toLowerCase()
    if (lowerAgent.includes('mobile') || lowerAgent.includes('android') || lowerAgent.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />
    }
    return <Globe className="h-4 w-4" />
  }

  const getDeviceType = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown Device'
    
    const lowerAgent = userAgent.toLowerCase()
    if (lowerAgent.includes('iphone')) return 'iPhone'
    if (lowerAgent.includes('ipad')) return 'iPad'
    if (lowerAgent.includes('android')) return 'Android'
    if (lowerAgent.includes('windows')) return 'Windows'
    if (lowerAgent.includes('mac')) return 'Mac'
    if (lowerAgent.includes('linux')) return 'Linux'
    return 'Other'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>回答詳細</DialogTitle>
          {response?.survey && (
            <DialogDescription>
              {response.survey.title}への回答
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-lg">読み込み中...</div>
          </div>
        ) : response ? (
          <div className="space-y-6">
            {/* Response Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">回答情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">送信日時</p>
                      <p className="font-medium">
                        {formatDate(response.submitted_at || response.completed_at || response.started_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">回答時間</p>
                      <p className="font-medium">
                        {response.time_spent ? `${Math.round(response.time_spent / 60)}分` : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {response.user_id ? (
                      <User className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">回答者</p>
                      <p className="font-medium">
                        {response.user_id ? 'ログインユーザー' : '匿名ユーザー'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(response.user_agent)}
                    <div>
                      <p className="text-sm text-muted-foreground">デバイス</p>
                      <p className="font-medium">{getDeviceType(response.user_agent)}</p>
                    </div>
                  </div>
                </div>
                
                {response.ip_address && (
                  <div className="flex items-center gap-2 pt-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">IPアドレス</p>
                      <p className="font-medium font-mono text-sm">{response.ip_address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Question Answers */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">回答内容</h3>
              
              {response.survey?.questions?.map((question: any, index: number) => {
                const answer = getQuestionAnswer(question.id)
                const hasAnswer = answer !== null && answer !== undefined && answer !== ''
                
                return (
                  <Card key={question.id} className={!hasAnswer ? 'opacity-75' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-muted-foreground">
                              質問 {index + 1}
                            </span>
                            {question.is_required && (
                              <Badge variant="outline" className="text-xs">
                                必須
                              </Badge>
                            )}
                            {hasAnswer ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <h4 className="text-base font-medium">{question.question_text}</h4>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {question.question_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 rounded-lg p-4">
                        {formatAnswer(answer, question.question_type)}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Response ID */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                回答ID: <span className="font-mono">{response.id}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            回答の読み込みに失敗しました
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}