'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSurveyPermissions } from '@/lib/hooks/useSurveyPermissions'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, LogIn, Mail } from 'lucide-react'

interface SurveyAccessGateProps {
  surveyId: string
  children: React.ReactNode
  onAccessGranted?: () => void
}

const passwordSchema = z.object({
  password: z.string().min(1, 'パスワードを入力してください')
})

type PasswordInput = z.infer<typeof passwordSchema>

export function SurveyAccessGate({ surveyId, children, onAccessGranted }: SurveyAccessGateProps) {
  const [accessStatus, setAccessStatus] = useState<{
    hasAccess: boolean
    requiresAuth: boolean
    requiresPassword: boolean
    error?: string
    checking: boolean
  }>({
    hasAccess: false,
    requiresAuth: false,
    requiresPassword: false,
    checking: true
  })

  const { user } = useAuth()
  const { checkAccess } = useSurveyPermissions()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema)
  })

  // アクセス権限をチェック
  const performAccessCheck = async (password?: string) => {
    setAccessStatus(prev => ({ ...prev, checking: true }))

    const result = await checkAccess({
      survey_id: surveyId,
      email: user?.email,
      password
    })

    setAccessStatus({
      hasAccess: result.hasAccess,
      requiresAuth: result.requiresAuth,
      requiresPassword: result.requiresPassword,
      error: result.error,
      checking: false
    })

    if (result.hasAccess && onAccessGranted) {
      onAccessGranted()
    }
  }

  // パスワード入力処理
  const onPasswordSubmit = async (data: PasswordInput) => {
    await performAccessCheck(data.password)
    
    if (!accessStatus.hasAccess) {
      setError('password', { message: 'パスワードが正しくありません' })
    }
  }

  // 初回アクセスチェック
  useEffect(() => {
    performAccessCheck()
  }, [surveyId, user])

  // ローディング中
  if (accessStatus.checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>アクセス確認中</CardTitle>
            <CardDescription>
              アンケートへのアクセス権限を確認しています...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // アクセス権限がある場合
  if (accessStatus.hasAccess) {
    return <>{children}</>
  }

  // 認証が必要な場合
  if (accessStatus.requiresAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <LogIn className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>
              このアンケートに回答するにはログインが必要です
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push(`/auth/login?redirectTo=/survey/${surveyId}`)}
              className="w-full"
            >
              ログインする
            </Button>
            <div className="text-center">
              <span className="text-sm text-gray-600">アカウントをお持ちでない場合は </span>
              <Button
                variant="link"
                className="text-sm p-0"
                onClick={() => router.push(`/auth/register?redirectTo=/survey/${surveyId}`)}
              >
                新規登録
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // パスワードが必要な場合
  if (accessStatus.requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <CardTitle>パスワードが必要です</CardTitle>
            <CardDescription>
              このアンケートはパスワードで保護されています
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワードを入力"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                アクセスする
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // アクセス拒否
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <CardTitle>アクセスできません</CardTitle>
          <CardDescription>
            申し訳ございませんが、このアンケートにアクセスする権限がありません
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accessStatus.error && (
            <Alert variant="destructive">
              <AlertDescription>{accessStatus.error}</AlertDescription>
            </Alert>
          )}
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              ダッシュボードに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}