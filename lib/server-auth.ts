import { createClient } from '@/lib/supabase/server'

// サーバーサイドで認証状態を取得するヘルパー関数
export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}