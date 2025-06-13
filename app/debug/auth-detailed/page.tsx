'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuthDebugPage() {
  const [supabase] = useState(() => createClient())
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('testpassword123')
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [networkLog, setNetworkLog] = useState<any[]>([])

  // 環境情報を取得
  useEffect(() => {
    const getDebugInfo = async () => {
      const info = {
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseUrlValid: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
          nodeEnv: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          currentUrl: window.location.href,
          origin: window.location.origin,
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          port: window.location.port || '3000'
        },
        session: null,
        user: null,
        authStatus: 'checking...'
      }

      try {
        // セッション情報を取得
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        info.session = session
        info.user = session?.user
        info.authStatus = session ? 'authenticated' : 'not authenticated'
        
        if (sessionError) {
          info.sessionError = {
            message: sessionError.message,
            details: sessionError
          }
        }

        // ユーザー情報を取得
        if (session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (user) {
            info.userDetails = {
              id: user.id,
              email: user.email,
              emailConfirmed: user.email_confirmed_at,
              createdAt: user.created_at,
              lastSignIn: user.last_sign_in_at,
              appMetadata: user.app_metadata,
              userMetadata: user.user_metadata,
              identities: user.identities
            }
          }
          if (userError) {
            info.userError = userError
          }
        }

        // Supabase接続テスト
        try {
          const testResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            }
          })
          info.connectionTest = {
            status: testResponse.status,
            statusText: testResponse.statusText,
            ok: testResponse.ok,
            headers: Object.fromEntries(testResponse.headers.entries())
          }
        } catch (connError) {
          info.connectionTest = {
            error: connError instanceof Error ? connError.message : 'Connection failed'
          }
        }

      } catch (error) {
        info.error = error instanceof Error ? error.message : 'Unknown error'
      }

      setDebugInfo(info)
    }

    getDebugInfo()
  }, [supabase])

  // ログイン試行
  const testLogin = async () => {
    console.log('=== ログインテスト開始 ===')
    const startTime = Date.now()
    
    try {
      // ログイン前の状態
      const { data: { session: beforeSession } } = await supabase.auth.getSession()
      console.log('ログイン前のセッション:', beforeSession)

      // ログイン実行
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      const endTime = Date.now()
      const response = {
        timestamp: new Date().toISOString(),
        duration: `${endTime - startTime}ms`,
        success: !error,
        email: testEmail,
        data: data,
        error: error ? {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error
        } : null,
        session: data?.session,
        user: data?.user
      }

      // ログイン後の状態
      const { data: { session: afterSession } } = await supabase.auth.getSession()
      response.afterSession = afterSession

      setApiResponse(response)
      addToNetworkLog('signInWithPassword', response)

      // 詳細なログ出力
      console.log('=== ログインレスポンス詳細 ===')
      console.log('成功:', !error)
      console.log('レスポンス時間:', response.duration)
      console.log('データ:', data)
      console.log('エラー:', error)
      console.log('セッション:', data?.session)
      console.log('ユーザー:', data?.user)
      console.log('=== ログインテスト終了 ===')

    } catch (err) {
      const errorResponse = {
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      }
      setApiResponse(errorResponse)
      addToNetworkLog('signInWithPassword', errorResponse)
      console.error('予期しないエラー:', err)
    }
  }

  // サインアップ試行
  const testSignUp = async () => {
    console.log('=== サインアップテスト開始 ===')
    const startTime = Date.now()
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      })

      const response = {
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
        success: !error,
        email: testEmail,
        data: data,
        error: error ? {
          message: error.message,
          status: error.status,
          details: error
        } : null,
        needsEmailConfirmation: !data?.session
      }

      setApiResponse(response)
      addToNetworkLog('signUp', response)
      console.log('サインアップレスポンス:', response)

    } catch (err) {
      const errorResponse = {
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
      setApiResponse(errorResponse)
      addToNetworkLog('signUp', errorResponse)
    }
  }

  // パスワードリセット試行
  const testPasswordReset = async () => {
    console.log('=== パスワードリセットテスト開始 ===')
    const startTime = Date.now()
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      const response = {
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
        success: !error,
        email: testEmail,
        data: data,
        error: error ? {
          message: error.message,
          status: error.status,
          details: error
        } : null
      }

      setApiResponse(response)
      addToNetworkLog('resetPasswordForEmail', response)

    } catch (err) {
      const errorResponse = {
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
      setApiResponse(errorResponse)
      addToNetworkLog('resetPasswordForEmail', errorResponse)
    }
  }

  // ネットワークログに追加
  const addToNetworkLog = (action: string, data: any) => {
    setNetworkLog(prev => [{
      id: Date.now(),
      action,
      timestamp: new Date().toISOString(),
      ...data
    }, ...prev].slice(0, 10))
  }

  // セッションをクリア
  const clearSession = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('サインアウトエラー:', error)
    } else {
      console.log('セッションをクリアしました')
      window.location.reload()
    }
  }

  // Cookieを確認
  const checkCookies = () => {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const supabaseCookies = cookies.filter(c => 
      c.includes('sb-') || c.includes('supabase')
    )
    return supabaseCookies
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">認証デバッグ詳細ページ</h1>
      
      <Tabs defaultValue="environment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environment">環境情報</TabsTrigger>
          <TabsTrigger value="test">テスト実行</TabsTrigger>
          <TabsTrigger value="network">ネットワークログ</TabsTrigger>
          <TabsTrigger value="troubleshoot">トラブルシューティング</TabsTrigger>
        </TabsList>

        <TabsContent value="environment" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">環境設定</h2>
            <div className="space-y-2">
              <div>
                <Badge variant={debugInfo.environment?.supabaseUrlValid ? "default" : "destructive"}>
                  Supabase URL: {debugInfo.environment?.supabaseUrlValid ? '設定済み' : '未設定'}
                </Badge>
                {debugInfo.environment?.supabaseUrl && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {debugInfo.environment.supabaseUrl}
                  </p>
                )}
              </div>
              <div>
                <Badge variant={debugInfo.environment?.anonKeyPresent ? "default" : "destructive"}>
                  Anon Key: {debugInfo.environment?.anonKeyPresent ? '設定済み' : '未設定'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  長さ: {debugInfo.environment?.anonKeyLength} 文字
                </p>
              </div>
              <div>
                <p className="text-sm">環境: {debugInfo.environment?.nodeEnv}</p>
                <p className="text-sm">Origin: {debugInfo.environment?.origin}</p>
                <p className="text-sm">Port: {debugInfo.environment?.port}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">認証状態</h2>
            <div className="space-y-2">
              <Badge variant={debugInfo.user ? "default" : "secondary"}>
                {debugInfo.authStatus}
              </Badge>
              {debugInfo.user && (
                <div className="text-sm space-y-1">
                  <p>ユーザーID: {debugInfo.userDetails?.id}</p>
                  <p>メール: {debugInfo.userDetails?.email}</p>
                  <p>メール確認: {debugInfo.userDetails?.emailConfirmed ? '済み' : '未確認'}</p>
                  <p>最終ログイン: {debugInfo.userDetails?.lastSignIn}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">接続テスト</h2>
            <div className="space-y-2">
              {debugInfo.connectionTest?.ok !== undefined && (
                <Badge variant={debugInfo.connectionTest.ok ? "default" : "destructive"}>
                  {debugInfo.connectionTest.ok ? '接続成功' : '接続失敗'}
                </Badge>
              )}
              {debugInfo.connectionTest && (
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.connectionTest, null, 2)}
                </pre>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cookie情報</h2>
            <div className="space-y-2">
              <p className="text-sm">Supabase関連のCookie:</p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {checkCookies().join('\n') || 'なし'}
              </pre>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">認証テスト</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">テスト用メールアドレス</label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">テスト用パスワード</label>
                <Input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={testLogin}>ログインテスト</Button>
                <Button onClick={testSignUp} variant="outline">サインアップテスト</Button>
                <Button onClick={testPasswordReset} variant="outline">パスワードリセット</Button>
                <Button onClick={clearSession} variant="destructive">セッションクリア</Button>
              </div>
            </div>
          </Card>

          {apiResponse && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">APIレスポンス</h2>
              <Badge variant={apiResponse.success ? "default" : "destructive"} className="mb-2">
                {apiResponse.success ? '成功' : '失敗'}
              </Badge>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">ネットワークログ</h2>
            <div className="space-y-2">
              {networkLog.length === 0 ? (
                <p className="text-muted-foreground">ログがありません</p>
              ) : (
                networkLog.map((log) => (
                  <div key={log.id} className="border rounded p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.action}</span>
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.success ? '成功' : '失敗'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                    <p className="text-xs">実行時間: {log.duration}</p>
                    {log.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          {typeof log.error === 'object' ? log.error.message : log.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">トラブルシューティングガイド</h2>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>1. 環境変数の確認</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>NEXT_PUBLIC_SUPABASE_URL が正しく設定されているか</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY が正しく設定されているか</li>
                    <li>.env.local ファイルが存在し、正しく読み込まれているか</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <strong>2. Supabase Dashboard の確認</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Authentication → Settings → Email Auth が有効か</li>
                    <li>Authentication → URL Configuration のRedirect URLsに http://localhost:3000/* が追加されているか</li>
                    <li>ユーザーが存在し、メール確認が完了しているか</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <strong>3. ブラウザの確認</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>ブラウザの開発者ツール → Network タブでエラーを確認</li>
                    <li>Console にエラーメッセージが表示されていないか</li>
                    <li>Cookieがブロックされていないか（サードパーティCookie）</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <strong>4. 一般的なエラーと対処法</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>500 Internal Server Error</strong>: Supabase URLまたはAnon Keyが間違っている可能性</li>
                    <li><strong>Invalid login credentials</strong>: メールアドレスまたはパスワードが間違っている</li>
                    <li><strong>Email not confirmed</strong>: メール確認が必要（確認メールを確認）</li>
                    <li><strong>CORS error</strong>: Redirect URLsの設定を確認</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <strong>5. デバッグ手順</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>この画面の「環境情報」タブで設定を確認</li>
                    <li>「テスト実行」タブでログインテストを実行</li>
                    <li>エラーの詳細を「ネットワークログ」タブで確認</li>
                    <li>ブラウザのConsoleとNetworkタブも確認</li>
                    <li>必要に応じて「セッションクリア」を実行</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}