# 📋 Supabaseマイグレーション実行ガイド

**プロジェクト**: アンケートWebアプリ  
**Supabaseプロジェクト**: `ffsalcmgbzrpkdertels`  
**実行必要ファイル**: 4つのSQLファイル（計1,752行）

---

## 🚀 事前準備

### 1. Supabase Dashboardにアクセス
```
https://app.supabase.com/dashboard/projects
```

### 2. プロジェクトを選択
- プロジェクト名: `ffsalcmgbzrpkdertels`
- URL: `https://ffsalcmgbzrpkdertels.supabase.co`

### 3. SQL Editorを開く
左サイドバーの「**SQL Editor**」をクリック

---

## 📝 詳細実行手順

### Step 1: スキーマ作成 (556行)
**ファイル**: `00001_comprehensive_schema.sql`

1. **新しいクエリを作成**
   - 「**New query**」ボタンをクリック
   - クエリ名: `01_Schema_Creation` (任意)

2. **SQLコードをコピー**
   - ローカルファイル `supabase/migrations/00001_comprehensive_schema.sql` を開く
   - **全内容をコピー** (556行すべて)

3. **SQL Editorに貼り付け**
   - 左側のエディター領域に貼り付け
   - 上部に以下のコメントが表示されることを確認:
   ```sql
   -- 🚀 アンケートWebアプリ 包括的データベーススキーマ
   -- Created: 2025-06-11
   -- Version: 2.0 (完全リニューアル)
   ```

4. **実行**
   - 右上の「**Run**」ボタンをクリック
   - または `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

5. **実行結果確認**
   - 下部の「Results」タブで確認
   - エラーがないことを確認
   - 成功メッセージ: `Success. No rows returned`

**⚠️ 重要**: このステップで15個のテーブルが作成されます。エラーが出た場合は次に進まないでください。

---

### Step 2: 初期データ投入 (360行)
**ファイル**: `00002_initial_data.sql`

1. **新しいクエリを作成**
   - 再度「**New query**」をクリック
   - クエリ名: `02_Initial_Data` (任意)

2. **SQLコードをコピー&貼り付け**
   - `supabase/migrations/00002_initial_data.sql` の全内容
   - 上部コメント確認:
   ```sql
   -- 🗄️ アンケートWebアプリ 初期データ・オートメーション設定
   ```

3. **実行**
   - 「**Run**」ボタンをクリック

4. **実行結果確認**
   - 5つのシステム役割が挿入されることを確認
   - トリガー関数が作成されることを確認

**💡 このステップの効果**: 
- システム役割 (owner, admin, editor, viewer, respondent)
- 自動プロファイル作成機能
- 統計自動更新機能

---

### Step 3: セキュリティポリシー設定 (514行)
**ファイル**: `00003_rls_policies.sql`

1. **新しいクエリを作成**
   - 「**New query**」をクリック
   - クエリ名: `03_RLS_Policies` (任意)

2. **SQLコードをコピー&貼り付け**
   - `supabase/migrations/00003_rls_policies.sql` の全内容
   - 上部コメント確認:
   ```sql
   -- 🔐 アンケートWebアプリ Row Level Security (RLS) ポリシー設定
   ```

3. **実行**
   - 「**Run**」ボタンをクリック

4. **実行結果確認**
   - 全テーブルでRLSが有効化されることを確認
   - 120+のセキュリティポリシーが作成されることを確認

**💡 このステップの効果**:
- データベース全体のセキュリティ強化
- チーム・役割ベースのアクセス制御
- ユーザーが自分のデータのみアクセス可能

---

### Step 4: ストレージ設定 (322行)  
**ファイル**: `00004_storage_setup.sql`

1. **新しいクエリを作成**
   - 「**New query**」をクリック
   - クエリ名: `04_Storage_Setup` (任意)

2. **SQLコードをコピー&貼り付け**
   - `supabase/migrations/00004_storage_setup.sql` の全内容
   - 上部コメント確認:
   ```sql
   -- 📁 アンケートWebアプリ ストレージ設定
   ```

3. **実行**
   - 「**Run**」ボタンをクリック

4. **実行結果確認**
   - 4つのストレージバケットが作成されることを確認
   - ファイルアップロードポリシーが設定されることを確認

**💡 このステップの効果**:
- ファイルアップロード機能の有効化
- アバター・ロゴ・アンケートファイル管理
- セキュアなファイルアクセス制御

---

## ✅ 実行後の確認

### 1. 自動確認スクリプト実行
```bash
node scripts/verify-setup.js
```

**期待される結果**:
```
📊 確認結果サマリー
==================
✅ connection
✅ tables  
✅ roles
✅ files
✅ environment

📈 総合結果: 5/5 (100%)
🎉 すべての確認が完了しました！
```

### 2. 手動確認（Supabase Dashboard）

**テーブル確認**:
1. 左サイドバー「**Table Editor**」をクリック
2. 15個のテーブルが表示されることを確認:
   - `profiles`, `teams`, `roles`, `team_members`, `team_invitations`
   - `surveys`, `questions`, `question_options`, `responses`, `answers`
   - `file_uploads`, `audit_logs`, `performance_metrics`
   - `realtime_sessions`, `notifications`, `analytics_events`

**ストレージ確認**:
1. 左サイドバー「**Storage**」をクリック  
2. 4つのバケットが表示されることを確認:
   - `avatars`, `team-logos`, `survey-uploads`, `survey-branding`

**認証確認**:
1. 左サイドバー「**Authentication**」をクリック
2. 「Users」タブで準備完了状態を確認

---

## 🚨 トラブルシューティング

### よくあるエラーと解決方法

#### 1. 「relation already exists」エラー
**原因**: テーブルが既に存在している  
**解決策**: 
```sql
-- 既存テーブルを削除してから再実行
DROP TABLE IF EXISTS table_name CASCADE;
```

#### 2. 「permission denied」エラー  
**原因**: 権限不足  
**解決策**: 
- Supabaseプロジェクトのオーナーアカウントでログインしていることを確認
- サービスロールキーが正しく設定されていることを確認

#### 3. 「function does not exist」エラー
**原因**: 前のマイグレーションが未完了  
**解決策**: 
- Step 1から順番に実行し直す
- 各ステップの完了を確認してから次に進む

#### 4. 実行が途中で止まる
**原因**: SQLファイルが大きすぎる・タイムアウト  
**解決策**:
- ファイルを小分けして実行
- ブラウザのネットワーク接続を確認

### 確認用クエリ

**テーブル数確認**:
```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- 期待値: 16 (15 + auth.users)
```

**RLS有効確認**:
```sql
SELECT COUNT(*) as rls_enabled_tables
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- 期待値: 15
```

**システム役割確認**:
```sql
SELECT name FROM roles WHERE is_system_role = true ORDER BY name;
-- 期待値: admin, editor, owner, respondent, viewer
```

---

## 🎯 実行完了後の次ステップ

### 1. アプリケーション起動
```bash
# プロジェクトディレクトリで実行
cd /Users/hashimotoyasuhiro/Documents/開発/アンケート/survey-app

# 依存関係インストール（初回のみ）
npm install

# 開発サーバー起動
npm run dev
```

### 2. 初回動作確認
1. ブラウザで `http://localhost:3000` を開く
2. ユーザー登録を試行
3. プロファイルが自動作成されることを確認
4. アンケート作成機能をテスト

### 3. OAuth設定（オプション）
- Google OAuth: Google Cloud Console設定
- GitHub OAuth: GitHub Apps設定  
- Microsoft OAuth: Azure Portal設定

---

## 📞 サポート

**実行中に問題が発生した場合**:
1. エラーメッセージをスクリーンショットで保存
2. 確認スクリプトの出力結果を保存
3. どのステップで失敗したかを記録

**参考ドキュメント**:
- [Supabase SQL Editor Documentation](https://supabase.com/docs/guides/database/overview#the-sql-editor)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

*このガイドに従って実行すれば、アンケートWebアプリのデータベース設定が完了します！*