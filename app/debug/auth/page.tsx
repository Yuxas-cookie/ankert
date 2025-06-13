'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { CosmicButton } from '@/components/ui/cosmic-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react'

export default function AuthDebugPage() {
  const [authConfig, setAuthConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    checkAuthConfig()
  }, [])

  const checkAuthConfig = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      
      setAuthConfig({
        session,
        user,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Auth config check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testEmailSignUp = async () => {
    if (!testEmail) {
      alert('テスト用メールアドレスを入力してください')
      return
    }

    setTestResult(null)
    console.log('🧪 テストメール送信開始:', testEmail)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            test_signup: true,
            timestamp: new Date().toISOString()
          }
        }
      })

      const result = {
        success: !error,
        error: error?.message,
        data: {
          user: data?.user,
          session: data?.session,
          emailConfirmationRequired: !data?.session,
          userEmail: data?.user?.email,
          emailConfirmedAt: data?.user?.email_confirmed_at,
          confirmationSentAt: data?.user?.confirmation_sent_at,
          createdAt: data?.user?.created_at
        },
        timestamp: new Date().toISOString()
      }

      console.log('🧪 テスト結果:', result)
      setTestResult(result)

      // 追加のデバッグ情報を取得
      if (data?.user) {
        console.log('📊 ユーザー詳細情報:', {
          id: data.user.id,
          email: data.user.email,
          emailConfirmedAt: data.user.email_confirmed_at,
          confirmationSentAt: data.user.confirmation_sent_at,
          lastSignInAt: data.user.last_sign_in_at,
          appMetadata: data.user.app_metadata,
          userMetadata: data.user.user_metadata
        })
      }
    } catch (err) {
      console.error('💥 テストエラー:', err)
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">認証デバッグページ</h1>
        
        <CosmicCard variant="glass">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Info className="w-5 h-5" />
              Supabase設定状態
            </h2>
            
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>読み込み中...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {authConfig?.supabaseUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Supabase URL: {authConfig?.supabaseUrl || '未設定'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {authConfig?.hasAnonKey ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Anon Key: {authConfig?.hasAnonKey ? '設定済み' : '未設定'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {authConfig?.session ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Info className="w-4 h-4 text-yellow-500" />
                  )}
                  <span>セッション: {authConfig?.session ? 'アクティブ' : 'なし'}</span>
                </div>
              </div>
            )}
          </div>
        </CosmicCard>

        <CosmicCard variant="nebula">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">メール送信テスト</h2>
            
            <div className="space-y-2">
              <input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border bg-background text-foreground"
              />
              <CosmicButton 
                onClick={testEmailSignUp}
                variant="cosmic"
                className="w-full"
              >
                テストメール送信
              </CosmicButton>
            </div>

            <Alert>
              <AlertDescription>
                <div className="text-sm space-y-1">
                  <p>このテストを実行すると：</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>指定したメールアドレスにサインアップメールが送信されます</li>
                    <li>コンソールに詳細なログが出力されます</li>
                    <li>メール送信の成功/失敗が確認できます</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {testResult && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">テスト結果:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CosmicCard>

        <CosmicCard variant="aurora">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">トラブルシューティング</h2>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-background/50">
                <p className="font-semibold">1. Supabaseダッシュボードで確認</p>
                <p className="text-muted-foreground mt-1">
                  Authentication → Logs でメール送信ログを確認してください
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-background/50">
                <p className="font-semibold">2. メール設定の確認</p>
                <p className="text-muted-foreground mt-1">
                  Authentication → Settings → Email Auth で設定を確認してください
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-background/50">
                <p className="font-semibold">3. 開発環境での回避策</p>
                <p className="text-muted-foreground mt-1">
                  "Enable email confirmations" をOFFにすると、メール確認なしで登録できます
                </p>
              </div>
            </div>
          </div>
        </CosmicCard>
      </div>
    </div>
  )
}