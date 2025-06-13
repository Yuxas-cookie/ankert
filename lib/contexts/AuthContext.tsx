'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithMicrosoft: () => Promise<{ error: AuthError | null }>
  signInWithGitHub: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  linkAccount: (provider: 'google' | 'microsoft' | 'github') => Promise<{ error: AuthError | null }>
  unlinkAccount: (provider: 'google' | 'microsoft' | 'github') => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 初期セッション取得
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email: string, password: string) => {
    try {
      // 現在のオリジンを取得し、ポート番号を確認
      const currentOrigin = window.location.origin
      const redirectUrl = `${currentOrigin}/api/auth/callback`
      
      console.log('🚀 サインアップ開始:', {
        email,
        timestamp: new Date().toISOString(),
        currentOrigin,
        redirectTo: redirectUrl,
        port: window.location.port || '3000'
      })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            // メタデータを追加（必要に応じて）
            registered_at: new Date().toISOString()
          }
        }
      })
      
      if (error) {
        console.error('❌ サインアップエラー:', {
          error,
          message: error.message,
          status: error.status,
          details: error
        })
        return { error }
      }
      
      console.log('✅ サインアップ成功:', {
        user: data.user,
        session: data.session,
        // メール確認が必要かどうか
        emailConfirmationRequired: !data.session,
        userMetadata: data.user?.user_metadata,
        identities: data.user?.identities,
        createdAt: data.user?.created_at
      })

      // メール送信状態を確認
      if (!data.session) {
        console.log('📧 確認メール送信状態:', {
          status: 'メール確認が必要です',
          email: data.user?.email,
          emailConfirmedAt: data.user?.email_confirmed_at,
          confirmationSentAt: data.user?.confirmation_sent_at
        })
      } else {
        console.log('✉️ メール確認不要:', {
          status: 'メール確認が無効化されています',
          session: data.session
        })
      }
      
      return { error: null }
    } catch (err) {
      console.error('💥 予期しないサインアップエラー:', err)
      return { 
        error: { 
          message: err instanceof Error ? err.message : 'Unknown error occurred during signup'
        } as any 
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 ログイン開始:', {
        email,
        timestamp: new Date().toISOString(),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
        anonKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
      })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ ログインエラー:', {
          error,
          message: error.message,
          status: error.status,
          name: error.name,
          cause: error.cause,
          stack: error.stack,
          details: error,
          __proto__: Object.getPrototypeOf(error),
          errorType: error.constructor.name
        })
        
        // 500エラーの詳細を確認
        if (error.status === 500) {
          console.error('🚨 サーバーエラー (500) 詳細:', {
            message: error.message,
            apiError: error,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            possibleCauses: [
              '1. Supabase URLが間違っている',
              '2. Anon Keyが間違っている', 
              '3. Supabaseプロジェクトが一時停止している',
              '4. ネットワークの問題',
              '5. CORSの問題'
            ]
          })
          
          // デバッグ用にfetchで直接APIを呼び出してみる
          try {
            const testUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`
            console.log('🔍 直接API呼び出しテスト:', testUrl)
            
            const testResponse = await fetch(testUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              },
              body: JSON.stringify({ email, password })
            })
            
            console.log('📡 API直接呼び出し結果:', {
              status: testResponse.status,
              statusText: testResponse.statusText,
              headers: Object.fromEntries(testResponse.headers.entries())
            })
            
            const responseText = await testResponse.text()
            console.log('📄 レスポンス内容:', responseText)
          } catch (fetchError) {
            console.error('🔥 fetch直接呼び出しエラー:', fetchError)
          }
        }
        
        return { error }
      }
      
      console.log('✅ ログイン成功:', {
        user: data.user,
        session: data.session,
        userEmail: data.user?.email,
        emailConfirmedAt: data.user?.email_confirmed_at,
        lastSignInAt: data.user?.last_sign_in_at
      })

      // セッション情報を確認
      const { data: { session } } = await supabase.auth.getSession()
      console.log('📱 現在のセッション:', {
        hasSession: !!session,
        accessToken: session?.access_token ? 'あり' : 'なし',
        expiresAt: session?.expires_at,
        user: session?.user
      })
      
      return { error: null }
    } catch (err) {
      console.error('💥 予期しないログインエラー:', err)
      return { 
        error: { 
          message: err instanceof Error ? err.message : 'Unknown error occurred during login'
        } as any 
      }
    }
  }

  const signInWithGoogle = async () => {
    const currentOrigin = window.location.origin
    console.log('🔗 Google OAuth開始:', { origin: currentOrigin })
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${currentOrigin}/api/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    return { error }
  }

  const signInWithMicrosoft = async () => {
    const currentOrigin = window.location.origin
    console.log('🔗 Microsoft OAuth開始:', { origin: currentOrigin })
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${currentOrigin}/api/auth/callback`,
        scopes: 'email profile'
      }
    })
    return { error }
  }

  const signInWithGitHub = async () => {
    const currentOrigin = window.location.origin
    console.log('🔗 GitHub OAuth開始:', { origin: currentOrigin })
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${currentOrigin}/api/auth/callback`
      }
    })
    return { error }
  }

  const linkAccount = async (provider: 'google' | 'microsoft' | 'github') => {
    const providerName = provider === 'microsoft' ? 'azure' : provider
    const { error } = await supabase.auth.linkIdentity({
      provider: providerName as any,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    return { error }
  }

  const unlinkAccount = async (provider: 'google' | 'microsoft' | 'github') => {
    const providerName = provider === 'microsoft' ? 'azure' : provider
    const { data: identities } = await supabase.auth.getUserIdentities()
    
    const identity = identities?.identities?.find(
      id => id.provider === providerName
    )
    
    if (identity) {
      const { error } = await supabase.auth.unlinkIdentity(identity)
      return { error }
    }
    
    return { error: null }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithGitHub,
    signOut,
    resetPassword,
    updatePassword,
    linkAccount,
    unlinkAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}