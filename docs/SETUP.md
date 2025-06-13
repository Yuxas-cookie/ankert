# セットアップガイド

## 1. 前提条件
- Node.js 18.17以上
- npmまたはpnpm
- Supabaseアカウント
- Google Cloud Consoleアカウント（Google OAuth用）

## 2. Supabaseプロジェクトのセットアップ

### 2.1 プロジェクト作成
1. [Supabase](https://supabase.com)にログイン
2. "New project"をクリック
3. プロジェクト情報を入力
   - Project name: survey-app
   - Database Password: 強固なパスワードを設定
   - Region: 最寄りのリージョンを選択

### 2.2 認証設定

#### メール/パスワード認証
1. Authentication > Providersに移動
2. Emailが有効になっていることを確認

#### Google OAuth設定
1. Google Cloud ConsoleでOAuth 2.0クライアントIDを作成
   - 承認済みリダイレクトURI: `https://[PROJECT_ID].supabase.co/auth/v1/callback`
2. SupabaseのAuthentication > Providers > Google
   - Enable Google providerをON
   - Client IDとClient Secretを入力

### 2.3 データベーススキーマ作成
```sql
-- SQL Editorで実行

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Surveys table
CREATE TABLE surveys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'closed', 'archived')) DEFAULT 'draft',
  is_draft BOOLEAN DEFAULT true,
  draft_updated_at TIMESTAMPTZ,
  preview_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question options table
CREATE TABLE question_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses table
CREATE TABLE responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_test_response BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT
);

-- Answers table
CREATE TABLE answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey permissions table
CREATE TABLE survey_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  permission_type VARCHAR(50) NOT NULL,
  allowed_emails TEXT[],
  password_hash TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
);

-- Survey previews table
CREATE TABLE survey_previews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_previews ENABLE ROW LEVEL SECURITY;

-- Policies will be added later
```

## 3. ローカル開発環境のセットアップ

### 3.1 依存関係のインストール
```bash
# プロジェクトディレクトリに移動
cd survey-app

# 依存関係は既にインストール済み
npm install
```

### 3.2 環境変数の設定
`.env.local`ファイルを作成:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.3 Supabaseクライアントの初期化
`lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

## 4. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## 5. 次のステップ
1. 認証ページの実装
2. ダッシュボードの作成
3. アンケート作成機能の実装
4. 回答機能の実装
5. レポート機能の実装