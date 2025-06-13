'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestSupabasePage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    setLoading(true)
    const testResults: any = {}

    // Test 1: 環境変数チェック
    testResults.envVars = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定',
      supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || 'なし',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定',
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    }

    // Test 2: Supabase URLの形式チェック
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    testResults.urlFormat = {
      hasHttps: url.startsWith('https://') ? '✅ HTTPS' : '❌ HTTPSではない',
      hasSupabaseDomain: url.includes('.supabase.co') ? '✅ 正しいドメイン' : '❌ ドメインが間違っている',
      fullUrl: url
    }

    // Test 3: 基本的な接続テスト
    if (url && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const response = await fetch(`${url}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          }
        })
        
        testResults.connection = {
          status: response.status,
          statusText: response.statusText,
          success: response.ok ? '✅ 接続成功' : '❌ 接続失敗'
        }

        if (!response.ok) {
          const text = await response.text()
          testResults.connection.error = text
        }
      } catch (error) {
        testResults.connection = {
          success: '❌ 接続エラー',
          error: error instanceof Error ? error.message : '不明なエラー'
        }
      }
    } else {
      testResults.connection = {
        success: '❌ テストスキップ',
        reason: '環境変数が設定されていません'
      }
    }

    // Test 4: Auth APIテスト
    if (url && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const authResponse = await fetch(`${url}/auth/v1/health`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        })
        
        testResults.authApi = {
          status: authResponse.status,
          success: authResponse.ok ? '✅ Auth API正常' : '❌ Auth APIエラー'
        }
      } catch (error) {
        testResults.authApi = {
          success: '❌ Auth APIエラー',
          error: error instanceof Error ? error.message : '不明なエラー'
        }
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  const copyEnvTemplate = () => {
    const template = `# Supabaseプロジェクトから以下の値をコピーして貼り付けてください
# Project Settings → API から取得

NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`
    
    navigator.clipboard.writeText(template)
    alert('.env.local用のテンプレートをコピーしました！')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Supabase接続テスト</h1>
          <p>テスト実行中...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Supabase接続テスト結果</h1>
        
        <div className="space-y-6">
          {/* 環境変数 */}
          <div>
            <h2 className="text-lg font-semibold mb-2">1. 環境変数チェック</h2>
            <div className="space-y-1 text-sm">
              <p>SUPABASE_URL: {results.envVars?.supabaseUrl}</p>
              <p className="text-xs text-muted-foreground ml-4">
                {results.envVars?.supabaseUrlValue}
              </p>
              <p>ANON_KEY: {results.envVars?.anonKey}</p>
              <p className="text-xs text-muted-foreground ml-4">
                長さ: {results.envVars?.anonKeyLength} 文字
              </p>
            </div>
          </div>

          {/* URL形式 */}
          <div>
            <h2 className="text-lg font-semibold mb-2">2. URL形式チェック</h2>
            <div className="space-y-1 text-sm">
              <p>プロトコル: {results.urlFormat?.hasHttps}</p>
              <p>ドメイン: {results.urlFormat?.hasSupabaseDomain}</p>
            </div>
          </div>

          {/* 接続テスト */}
          <div>
            <h2 className="text-lg font-semibold mb-2">3. 接続テスト</h2>
            <div className="space-y-1 text-sm">
              <p>結果: {results.connection?.success}</p>
              {results.connection?.status && (
                <p>ステータス: {results.connection.status} {results.connection.statusText}</p>
              )}
              {results.connection?.error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription className="text-xs">
                    {results.connection.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Auth API */}
          <div>
            <h2 className="text-lg font-semibold mb-2">4. Auth APIテスト</h2>
            <div className="space-y-1 text-sm">
              <p>結果: {results.authApi?.success}</p>
              {results.authApi?.error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription className="text-xs">
                    {results.authApi.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Button onClick={runTests} variant="outline">
            再テスト
          </Button>

          {(!results.envVars?.supabaseUrl.includes('✅') || 
            !results.envVars?.anonKey.includes('✅')) && (
            <Alert>
              <AlertDescription>
                <strong>環境変数が設定されていません</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>プロジェクトルートに `.env.local` ファイルを作成</li>
                  <li>Supabase DashboardからURL とAnon Keyをコピー</li>
                  <li>`.env.local` ファイルに貼り付け</li>
                  <li>開発サーバーを再起動</li>
                </ol>
                <Button 
                  onClick={copyEnvTemplate} 
                  variant="secondary" 
                  size="sm"
                  className="mt-2"
                >
                  .env.localテンプレートをコピー
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">次のステップ</h2>
        <div className="space-y-2 text-sm">
          <p>1. すべてのテストが✅になっているか確認</p>
          <p>2. エラーがある場合は、上記の手順に従って修正</p>
          <p>3. <a href="/debug/auth-detailed" className="text-primary hover:underline">詳細なデバッグページ</a>でログインテストを実行</p>
          <p>4. それでも問題が解決しない場合は、Supabase Dashboardの設定を確認</p>
        </div>
      </Card>
    </div>
  )
}