# 🚀 Supabaseプロジェクト設定ガイド

新しいSupabaseプロジェクトの作成とデータベースセットアップの完全ガイドです。

## 📋 前提条件

- [Supabase](https://supabase.com) アカウント
- Node.js 18+ 
- npm または yarn

## 🆕 1. 新しいSupabaseプロジェクトの作成

### 1.1 Webダッシュボードでプロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. "New Project" をクリック
3. プロジェクト設定を入力：
   ```
   Project Name: survey-app-v2
   Database Password: 強力なパスワードを設定
   Region: Northeast Asia (Tokyo) - 日本のユーザー向け
   Pricing Plan: Free tier (開発用) または Pro (本番用)
   ```
4. "Create new project" をクリック

### 1.2 プロジェクト情報の取得

プロジェクト作成後、以下の情報を取得：

```bash
# Settings > API より取得
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Settings > Database より取得  
DATABASE_URL=your-database-url
```

## 🗄️ 2. データベースマイグレーション実行

### 2.1 Supabase CLI インストール

```bash
# Homebrew (Mac)
brew install supabase/tap/supabase

# npm (クロスプラットフォーム)
npm install -g supabase

# 確認
supabase --version
```

### 2.2 プロジェクトの初期化

```bash
# プロジェクトディレクトリで実行
cd survey-app

# Supabaseプロジェクトに接続
supabase login
supabase link --project-ref your-project-id

# 既存の設定ファイルがある場合は上書き確認
```

### 2.3 マイグレーション実行

```bash
# マイグレーションファイルを確認
ls supabase/migrations/

# 出力例:
# 00001_comprehensive_schema.sql
# 00002_initial_data.sql  
# 00003_rls_policies.sql

# 全マイグレーション実行
supabase db push

# または個別実行
supabase db push --include-seed
```

## 🔐 3. 認証設定

### 3.1 Email認証の有効化

1. Dashboard > Authentication > Settings
2. "Enable email confirmations" を有効化
3. Site URL を設定: `http://localhost:3000` (開発) / `https://yourdomain.com` (本番)
4. Redirect URLs を追加:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

### 3.2 OAuth プロバイダー設定

#### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクト作成
2. OAuth 2.0 認証情報を作成
3. Supabase Dashboard > Authentication > Providers > Google
4. クライアントIDとシークレットを設定

#### GitHub OAuth
1. [GitHub Developer Settings](https://github.com/settings/developers) でOAuth App作成
2. Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
3. Supabase Dashboard > Authentication > Providers > GitHub
4. クライアントIDとシークレットを設定

#### Microsoft OAuth
1. [Azure Portal](https://portal.azure.com) でアプリ登録
2. Redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
3. Supabase Dashboard > Authentication > Providers > Azure
4. クライアントIDとシークレットを設定

## 🗃️ 4. ストレージ設定

### 4.1 バケット作成

```sql
-- SQL Editor で実行
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'survey-uploads',
  'survey-uploads', 
  false,
  10485760, -- 10MB
  ARRAY['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- アバター用バケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB  
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);
```

### 4.2 ストレージポリシー設定

```sql
-- アップロードファイルポリシー
CREATE POLICY "Users can upload files to surveys" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'survey-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view files they uploaded" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'survey-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- アバターポリシー  
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## ⚙️ 5. 環境変数設定

### 5.1 環境変数ファイル作成

```bash
# .env.local ファイルを作成
cp .env.example .env.local
```

### 5.2 環境変数の設定

```bash
# .env.local の内容
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth設定
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# OAuth設定
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# 本番環境設定
NODE_ENV=development
ENABLE_ANALYTICS=false
```

## 🧪 6. データベース動作確認

### 6.1 基本データの確認

```sql
-- 役割データの確認
SELECT * FROM roles WHERE is_system_role = true;

-- 関数の確認
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- テーブル一覧確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

### 6.2 RLSポリシーの確認

```sql
-- RLS有効化確認
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- ポリシー一覧確認
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🔄 7. リアルタイム機能設定

### 7.1 リアルタイム有効化

```sql
-- 特定テーブルでリアルタイム有効化
ALTER publication supabase_realtime ADD TABLE surveys;
ALTER publication supabase_realtime ADD TABLE responses;
ALTER publication supabase_realtime ADD TABLE realtime_sessions;
ALTER publication supabase_realtime ADD TABLE notifications;
```

### 7.2 WebSocket接続設定

Supabase Dashboard > Settings > API で以下を確認：
- Realtime API が有効化されている
- WebSocket接続URL: `wss://your-project-id.supabase.co/realtime/v1/websocket`

## 📊 8. モニタリング設定

### 8.1 ログ設定

Supabase Dashboard > Logs で以下を有効化：
- Database logs
- Auth logs  
- Storage logs
- API logs

### 8.2 メトリクス確認

Dashboard > Reports で以下を監視：
- Database usage
- Auth usage
- Storage usage
- API requests

## 🚀 9. アプリケーション起動

### 9.1 依存関係インストール

```bash
npm install
# または
yarn install
```

### 9.2 アプリケーション起動

```bash
npm run dev
# または  
yarn dev
```

### 9.3 動作確認

1. http://localhost:3000 にアクセス
2. ユーザー登録・ログイン機能をテスト
3. アンケート作成・回答機能をテスト
4. チーム機能をテスト

## 🛠️ 10. トラブルシューティング

### よくある問題と解決方法

#### マイグレーションエラー
```bash
# マイグレーション状態確認
supabase migration list

# 特定のマイグレーションを実行
supabase db push --include-seed --db-url "your-database-url"
```

#### 認証エラー
- 環境変数が正しく設定されているか確認
- OAuth プロバイダーの設定を再確認
- Redirect URLs が正しく設定されているか確認

#### RLSポリシーエラー
```sql
-- ポリシーを一時的に無効化（デバッグ用）
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- ポリシーを再有効化
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

#### ストレージエラー
- バケットが作成されているか確認
- ストレージポリシーが正しく設定されているか確認
- ファイルサイズ制限を確認

## 📚 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Documentation](https://supabase.com/docs/guides/realtime)

## 🔒 セキュリティチェックリスト

- [ ] 強力なデータベースパスワードを設定
- [ ] 本番環境でRLSポリシーが有効
- [ ] OAuth クライアントシークレットが安全に管理されている
- [ ] サービスロールキーが適切に保護されている
- [ ] ストレージポリシーが適切に設定されている
- [ ] CORS設定が適切
- [ ] API使用量制限が設定されている

セットアップ完了後、本格的なアプリケーション開発を開始できます！