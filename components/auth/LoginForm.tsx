'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { signInSchema, type SignInInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn, signInWithGoogle, signInWithMicrosoft, signInWithGitHub } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema)
  })

  const onSubmit = async (data: SignInInput) => {
    console.log('📝 ログインフォーム送信:', {
      email: data.email,
      timestamp: new Date().toISOString()
    })
    
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signIn(data.email, data.password)
      
      if (error) {
        console.error('❌ ログイン失敗:', {
          errorMessage: error.message,
          errorStatus: error.status,
          errorDetails: error
        })
        
        // エラーメッセージを日本語で表示
        if (error.status === 500) {
          setError(`サーバーエラーが発生しました (500)。
            
            考えられる原因:
            • Supabase URLまたはAPIキーが正しくない
            • Supabaseプロジェクトが一時停止している
            • ネットワークの問題
            
            デバッグページで詳細を確認してください: /debug/auth-detailed`)
        } else if (error.message.includes('Invalid login credentials')) {
          setError('メールアドレスまたはパスワードが正しくありません')
        } else if (error.message.includes('Email not confirmed')) {
          setError('メールアドレスが確認されていません。確認メールをご確認ください')
        } else if (error.message.includes('Network request failed')) {
          setError('ネットワークエラーが発生しました。インターネット接続を確認してください')
        } else {
          setError(`エラー: ${error.message} (ステータス: ${error.status || 'N/A'})`)
        }
      } else {
        console.log('✅ ログイン成功 - リダイレクト処理開始')
        // Check for redirect parameter
        const searchParams = new URLSearchParams(window.location.search)
        const redirectTo = searchParams.get('redirectTo') || '/dashboard'
        console.log('🚀 リダイレクト先:', redirectTo)
        
        // リダイレクト前に少し待機（セッション確立のため）
        await new Promise(resolve => setTimeout(resolve, 100))
        
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      console.error('💥 予期しないエラー:', err)
      setError('ログインに失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signInWithGoogle()
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Googleログインに失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signInWithMicrosoft()
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Microsoftログインに失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signInWithGitHub()
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('GitHubログインに失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            type="password"
            placeholder="パスワードを入力"
            {...register('password')}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">または</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Googleでログイン
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleMicrosoftSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          Microsoftでログイン
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGitHubSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHubでログイン
        </Button>
      </div>

      <div className="text-center space-y-2">
        <div>
          <Link
            href="/reset-password"
            className="text-sm text-primary hover:text-primary/80"
          >
            パスワードを忘れた場合
          </Link>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">アカウントをお持ちでない場合は </span>
          <Link
            href="/register"
            className="text-sm text-primary hover:text-primary/80"
          >
            新規登録
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">開発者用ツール:</p>
            <div className="flex gap-2 justify-center">
              <Link
                href="/test-supabase"
                className="text-xs text-primary hover:text-primary/80"
              >
                接続テスト
              </Link>
              <span className="text-xs text-muted-foreground">•</span>
              <Link
                href="/debug/auth-detailed"
                className="text-xs text-primary hover:text-primary/80"
              >
                詳細デバッグ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}