# Survey App - デプロイメントガイド

## GitHubへのアップロード手順

### 1. 初期設定
```bash
# リポジトリの初期化（既に初期化済みの場合はスキップ）
git init

# リモートリポジトリの追加
git remote add origin https://github.com/Yuxas-cookie/ankert.git

# 現在のブランチ名をmainに変更（必要な場合）
git branch -M main
```

### 2. コミットとプッシュ
```bash
# 全ファイルをステージング
git add .

# コミット
git commit -m "Initial commit: Survey app with cosmic design"

# GitHubへプッシュ
git push -u origin main
```

## Vercelへのデプロイ手順

### 1. Vercelアカウントの準備
1. [Vercel](https://vercel.com)にアクセスしてアカウントを作成
2. GitHubアカウントと連携

### 2. プロジェクトのインポート
1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリ「Yuxas-cookie/ankert」を選択
3. 「Import」をクリック

### 3. 環境変数の設定
Vercelのプロジェクト設定画面で以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**重要**: これらの値はSupabaseダッシュボードから取得してください。

### 4. ビルド設定
以下の設定が自動的に検出されますが、必要に応じて確認してください：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. デプロイ
1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待機（通常2-5分）
3. 提供されたURLでアプリケーションにアクセス

## Supabaseの本番環境設定

### 1. 認証設定
Supabaseダッシュボードで以下を設定：

1. **Authentication** → **URL Configuration**
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: 
     ```
     https://your-app.vercel.app/callback
     https://your-app.vercel.app/auth/callback
     ```

### 2. CORS設定
必要に応じて、Supabaseプロジェクトの設定でCORSを有効化：
- Allowed origins: `https://your-app.vercel.app`

### 3. Row Level Security (RLS)
本番環境では必ずRLSを有効にしてください。

## トラブルシューティング

### ビルドエラーが発生する場合
1. Node.jsのバージョンを確認（18.x以上推奨）
2. `package-lock.json`を削除して`npm install`を再実行
3. TypeScriptエラーがある場合は修正

### Supabase接続エラー
1. 環境変数が正しく設定されているか確認
2. Supabaseプロジェクトがアクティブか確認
3. 認証URLが正しく設定されているか確認

### デプロイ後の404エラー
1. `next.config.ts`の設定を確認
2. 動的ルートが正しく設定されているか確認

## セキュリティのベストプラクティス

1. **環境変数**
   - Service Role Keyは絶対にクライアント側で使用しない
   - 本番環境の環境変数は定期的に更新

2. **認証**
   - メールアドレス確認を有効化
   - レート制限を設定

3. **データベース**
   - RLSポリシーを適切に設定
   - 定期的なバックアップを設定

## パフォーマンス最適化

1. **画像最適化**
   - Next.js Image componentを使用
   - 適切なサイズと形式を選択

2. **コード分割**
   - 動的インポートを活用
   - 不要なライブラリを削除

3. **キャッシュ戦略**
   - 静的アセットに適切なキャッシュヘッダーを設定
   - ISR（Incremental Static Regeneration）を活用

## 監視とロギング

1. **Vercel Analytics**
   - Web Vitalsの監視
   - エラートラッキング

2. **Supabase Dashboard**
   - データベースパフォーマンス
   - 認証ログ

## 更新とメンテナンス

### コードの更新
```bash
git add .
git commit -m "Update: 機能の説明"
git push
```

Vercelは自動的に新しいデプロイを開始します。

### ロールバック
Vercelダッシュボードから以前のデプロイメントに即座にロールバック可能です。

---

最終更新: 2025年6月13日