'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentPort, setCurrentPort] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    // 現在のポートを取得
    setCurrentPort(window.location.port || '80')
  }, [])

  const testConnection = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // 1. 基本的な接続テスト
      console.log('🔍 Supabase接続テスト開始')
      results.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      results.hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      results.currentOrigin = window.location.origin
      results.currentPort = window.location.port || '80'
      results.callbackUrl = `${window.location.origin}/api/auth/callback`

      // 2. Health check
      try {
        const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          }
        })
        results.healthCheck = {
          status: healthResponse.status,
          statusText: healthResponse.statusText,
          ok: healthResponse.ok
        }
      } catch (error: any) {
        results.healthCheck = { error: error.message }
      }

      // 3. Auth service check
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        results.authService = {
          working: !error,
          hasSession: !!session,
          error: error?.message
        }
      } catch (error: any) {
        results.authService = { error: error.message }
      }

      // 4. Database connection test
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
        
        results.databaseConnection = {
          working: !error,
          error: error?.message,
          status: error?.code
        }
      } catch (error: any) {
        results.databaseConnection = { error: error.message }
      }

      // 5. Test sign in with wrong credentials (should get specific error, not 500)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        results.testSignIn = {
          error: error?.message,
          status: error?.status,
          expectedError: error?.message?.includes('Invalid login credentials')
        }
      } catch (error: any) {
        results.testSignIn = { unexpectedError: error.message }
      }

      // 6. Get all users (to check if any exist)
      try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers()
        results.usersList = {
          error: error?.message,
          userCount: users?.length || 0
        }
      } catch (error: any) {
        results.usersList = { note: 'Admin API not accessible (normal for client-side)' }
      }

    } catch (error: any) {
      results.generalError = error.message
    }

    console.log('🔍 テスト結果:', results)
    setResult(results)
    setLoading(false)
  }

  const testDirectAuth = async () => {
    setLoading(true)
    try {
      // 直接Supabase APIを呼び出す
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        })
      })

      const data = await response.json()
      console.log('📡 直接API呼び出し結果:', {
        status: response.status,
        statusText: response.statusText,
        data
      })

      setResult({
        directAuthTest: {
          status: response.status,
          statusText: response.statusText,
          data
        }
      })
    } catch (error: any) {
      console.error('💥 直接API呼び出しエラー:', error)
      setResult({ directAuthError: error.message })
    }
    setLoading(false)
  }

  const testSignUp = async () => {
    setLoading(true)
    try {
      const testEmail = `test${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      
      console.log('📝 テストサインアップ開始:', { email: testEmail })
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      })
      
      const result = {
        testSignUp: {
          email: testEmail,
          success: !error,
          error: error?.message,
          errorStatus: error?.status,
          needsEmailConfirmation: !data.session,
          user: data.user?.email
        }
      }
      
      console.log('📝 サインアップ結果:', result)
      setResult(result)
    } catch (error: any) {
      console.error('💥 サインアップエラー:', error)
      setResult({ signUpError: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">認証システムテスト</h1>
        
        <Alert>
          <AlertDescription>
            このページは認証システムの問題を診断するためのテストページです。
            500エラーの原因を特定します。
            <br />
            <strong>現在のポート: {currentPort}</strong>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CosmicButton 
              onClick={testConnection}
              disabled={loading}
              variant="cosmic"
            >
              {loading ? 'テスト中...' : 'Supabase接続テスト'}
            </CosmicButton>

            <CosmicButton 
              onClick={testDirectAuth}
              disabled={loading}
              variant="nebula"
            >
              {loading ? 'テスト中...' : '直接認証APIテスト'}
            </CosmicButton>

            <CosmicButton 
              onClick={testSignUp}
              disabled={loading}
              variant="cosmic"
            >
              {loading ? 'テスト中...' : '新規ユーザー登録テスト'}
            </CosmicButton>
          </div>
        </div>

        {result && (
          <CosmicCard variant="glass" className="p-6">
            <h2 className="text-xl font-semibold mb-4">テスト結果</h2>
            <pre className="text-sm overflow-auto bg-muted/50 p-4 rounded-lg">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CosmicCard>
        )}

        <CosmicCard variant="aurora" className="p-6">
          <h2 className="text-xl font-semibold mb-4">トラブルシューティング</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">1. Supabaseプロジェクトの状態を確認</p>
              <p className="text-muted-foreground">
                Supabaseダッシュボードでプロジェクトが「Active」になっているか確認してください。
                無料プランでは、7日間使用しないとプロジェクトが一時停止されます。
              </p>
            </div>
            
            <div>
              <p className="font-semibold">2. 環境変数を確認</p>
              <p className="text-muted-foreground">
                .env.localファイルに正しいSupabase URLとAnon Keyが設定されているか確認してください。
              </p>
            </div>
            
            <div>
              <p className="font-semibold">3. 認証プロバイダーの設定</p>
              <p className="text-muted-foreground">
                Authentication → Providers → EmailでEmail認証が有効になっているか確認してください。
              </p>
            </div>
          </div>
        </CosmicCard>
      </div>
    </div>
  )
}