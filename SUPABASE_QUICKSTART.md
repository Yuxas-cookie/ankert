# 🚀 Supabaseプロジェクト クイックスタートガイド

新しいSupabaseプロジェクトの設定が完了し、本格的なアンケートWebアプリケーションが起動可能な状態になりました！

## 📋 プロジェクト情報

- **Project URL**: `https://ffsalcmgbzrpkdertels.supabase.co`
- **Project ID**: `ffsalcmgbzrpkdertels`
- **Status**: 設定完了 ✅

## 🗄️ 実行が必要なマイグレーション

以下の4つのSQLファイルを **Supabase SQL Editor** で順番に実行してください：

### 1️⃣ **基本スキーマ作成**
```bash
supabase/migrations/00001_comprehensive_schema.sql
```
- 15テーブルの作成 (profiles, teams, surveys, etc.)
- インデックス・トリガー・関数
- ビュー作成

### 2️⃣ **初期データ・自動化**
```bash
supabase/migrations/00002_initial_data.sql
```
- システム役割 (owner/admin/editor/viewer/respondent)
- 自動トリガー (プロファイル作成、統計更新)
- セキュリティ関数

### 3️⃣ **セキュリティポリシー**
```bash
supabase/migrations/00003_rls_policies.sql
```
- 全テーブルのRLS有効化
- 権限ベースアクセス制御
- セキュリティビュー

### 4️⃣ **ストレージ設定**
```bash
supabase/migrations/00004_storage_setup.sql
```
- ファイルアップロード用バケット
- ストレージポリシー
- ファイル管理関数

## 🔧 クイック実行手順

### Step 1: SQL Editorでマイグレーション実行

1. **[Supabase Dashboard](https://supabase.com/dashboard/project/ffsalcmgbzrpkdertels)** を開く
2. 左メニュー「**SQL Editor**」をクリック
3. 「**New query**」をクリック
4. 上記の4つのSQLファイルを順番にコピー＆ペースト実行

### Step 2: 設定確認

```bash
# 確認スクリプト実行
node scripts/verify-setup.js
```

### Step 3: アプリケーション起動

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## ✅ 設定済み機能

### 🗄️ **データベース機能**
- ✅ 15テーブル完備 (ユーザー、チーム、アンケート、回答等)
- ✅ 完全なRBACシステム (5役割の権限管理)
- ✅ リアルタイム機能対応
- ✅ 監査ログ・パフォーマンス監視
- ✅ ファイルアップロード対応

### 🔐 **セキュリティ機能**
- ✅ Row Level Security (RLS) 全テーブル対応
- ✅ 権限ベースアクセス制御
- ✅ チーム管理・招待機能
- ✅ アンケートアクセス制御 (公開/認証/パスワード/メール制限)

### 🗂️ **ストレージ機能**
- ✅ アンケート用ファイルアップロード (`survey-uploads`)
- ✅ プロファイルアバター (`avatars`)
- ✅ チームロゴ (`team-logos`)
- ✅ アンケートブランディング (`survey-branding`)

### ⚙️ **環境設定**
- ✅ `.env.local` 自動設定済み
- ✅ TypeScript型定義更新済み
- ✅ Supabaseクライアント設定更新済み

## 🚀 実装された高度な機能

### 📊 **アンケート機能**
- **13種類の質問タイプ**: 単一選択、複数選択、テキスト、評価、マトリックス、日付、ファイル、スライダー、ランキング
- **アクセス制御**: 公開、URL限定、パスワード、認証必須、メール制限
- **期間制限**: 開始・終了日時設定
- **回答制限**: 最大回答数設定
- **ブランディング**: カスタムロゴ・色設定

### 👥 **チーム管理**
- **役割管理**: Owner/Admin/Editor/Viewer/Respondent
- **招待システム**: メールベース招待・トークン管理
- **権限制御**: 32種類の詳細権限設定
- **監査ログ**: 全操作の記録・追跡

### 📈 **分析・レポート**
- **リアルタイム分析**: WebSocket対応
- **統計自動更新**: 回答数・完了率・平均時間
- **パフォーマンス監視**: Core Web Vitals
- **エクスポート機能**: PDF・Excel・CSV対応

### 🔄 **リアルタイム機能**
- **セッション管理**: アクティブユーザー追跡
- **通知システム**: リアルタイム通知
- **ライブメトリクス**: リアルタイム回答状況

## 📱 アプリケーション機能

### 🏠 **ダッシュボード**
- アンケート一覧・統計表示
- チーム管理・メンバー招待
- リアルタイム分析

### 📝 **アンケート作成**
- ドラッグ&ドロップビルダー
- プレビュー機能
- 条件分岐ロジック

### 📊 **回答・分析**
- レスポンシブ回答フォーム
- リアルタイム集計
- 高度な分析・可視化

### 👤 **ユーザー管理**
- OAuth認証 (Google/GitHub/Microsoft)
- プロファイル管理
- チーム・権限管理

## 🛠️ 技術スタック

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Supabase + PostgreSQL
- **UI**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Export**: jsPDF + xlsx
- **Real-time**: Supabase Realtime
- **Testing**: Playwright E2E
- **Deployment**: Docker + Nginx

## 🎯 次のステップ

1. **OAuth設定** - Google/GitHub/Microsoft認証
2. **ドメイン設定** - カスタムドメイン設定
3. **メール設定** - SMTP設定・通知メール
4. **本番デプロイ** - Docker・Nginx・SSL証明書

## 🆘 トラブルシューティング

### マイグレーション失敗時
```sql
-- テーブル確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- RLS確認
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

### 設定確認
```bash
# 確認スクリプト実行
node scripts/verify-setup.js

# アプリケーション起動
npm run dev
```

---

## 🎉 完了！

すべての設定が完了しました。本格的なアンケートWebアプリケーションをお楽しみください！

**🚀 次は SQL Editor でマイグレーションを実行してください！**