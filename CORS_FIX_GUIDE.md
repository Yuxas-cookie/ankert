# CORS Error Fix Guide for Supabase Authentication

## 問題の概要
Supabase認証でCORSエラーが発生しています。これは、リダイレクトURLの設定不一致が原因です。

## 解決手順

### 1. Supabaseダッシュボードでの設定

1. [Supabase Dashboard](https://supabase.com/dashboard/project/ffsalcmgbzrpkdertels/auth/url-configuration) にアクセス
2. **Authentication** → **URL Configuration** に移動
3. 以下のURLを **Redirect URLs** に追加:
   ```
   http://localhost:3000/**
   http://localhost:3001/**
   http://localhost:3002/**
   http://localhost:3000/api/auth/callback
   http://localhost:3001/api/auth/callback
   http://localhost:3002/api/auth/callback
   http://localhost:3000/callback
   http://localhost:3001/callback
   http://localhost:3002/callback
   ```

4. **Site URL** を以下に設定:
   ```
   http://localhost:3000
   ```

### 2. 環境変数の確認

`.env.local` ファイルで以下を確認:
```env
NEXTAUTH_URL=http://localhost:3000
```

### 3. 開発サーバーの再起動

```bash
# サーバーを停止 (Ctrl+C)
# サーバーを再起動
npm run dev
```

### 4. ブラウザのキャッシュクリア

1. ブラウザの開発者ツールを開く（F12）
2. Network タブで "Disable cache" にチェック
3. ページをリロード

## 一時的な回避策

もしまだCORSエラーが発生する場合は、以下の回避策を試してください:

### Option 1: プロキシ設定を追加

`next.config.ts` に以下を追加:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
```

### Option 2: カスタムフェッチ関数を使用

認証リクエストにカスタムヘッダーを追加する場合。

## 確認方法

1. ブラウザの開発者ツールでNetworkタブを開く
2. ログイン/登録を試行
3. エラーレスポンスの詳細を確認
4. 特に `Access-Control-Allow-Origin` ヘッダーを確認

## よくある原因

1. **Supabaseダッシュボードの設定ミス**: Redirect URLsが正しく設定されていない
2. **環境変数の不一致**: NEXTAUTH_URLとアプリケーションの実際のURLが異なる
3. **ポート番号の不一致**: 開発サーバーのポートとURLの設定が異なる
4. **キャッシュの問題**: ブラウザまたはNext.jsのキャッシュが古い設定を保持している

## デバッグ情報

現在の設定:
- Supabase Project ID: `ffsalcmgbzrpkdertels`
- Supabase URL: `https://ffsalcmgbzrpkdertels.supabase.co`
- Local Development URL: `http://localhost:3000`

## 問題が解決しない場合

1. Supabaseのログを確認
2. ブラウザのコンソールエラーを詳細に確認
3. Next.jsのサーバーログを確認