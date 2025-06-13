import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; redirectTo?: string }>
}) {
  const { code, error, redirectTo } = await searchParams

  if (error) {
    console.error('Auth error:', error)
    redirect('/auth/login?error=認証に失敗しました')
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      redirect('/auth/login?error=認証に失敗しました')
    }

    // 認証成功時のリダイレクト
    redirect(redirectTo || '/dashboard')
  }

  // コードがない場合はログインページへ
  redirect('/auth/login')
}