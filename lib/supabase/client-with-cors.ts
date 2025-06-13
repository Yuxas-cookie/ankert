import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../../types/database-new'

export const createClientWithCORS = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // カスタムヘッダーを追加
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      global: {
        headers: {
          'x-client-info': 'survey-app',
        },
      },
      // デバッグログを有効化
      db: {
        schema: 'public',
      },
    }
  )
}

// 既存のcreateClient関数もエクスポート
export { createClient } from './client'