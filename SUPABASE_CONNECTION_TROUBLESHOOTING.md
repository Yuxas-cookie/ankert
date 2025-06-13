# Supabase Connection Troubleshooting Guide

## 概要
Supabaseへの接続で「Load failed」エラーが発生している場合の包括的なトラブルシューティングガイドです。

## 診断ツール

### 1. Node.js接続テスト
```bash
node scripts/test-supabase-connection.js
```
このスクリプトは以下をチェックします：
- 環境変数の設定状況
- 各エンドポイントへの接続性
- DNS解決
- タイムアウトやネットワークエラーの詳細

### 2. curl接続テスト
```bash
npm run test:curl
# または
./scripts/test-supabase-curl.sh
```
curlを使用した低レベルな接続テストを実行します。

### 3. ブラウザ接続テスト
```bash
# ブラウザでテストページを開く
open scripts/test-supabase-browser.html
```
ブラウザ環境での接続をテストし、CORS設定を確認します。

## よくある原因と解決方法

### 1. プロジェクトが一時停止している

**症状**: 
- 接続がタイムアウトする
- DNS解決は成功するが応答がない

**確認方法**:
1. [Supabaseダッシュボード](https://app.supabase.com)にログイン
2. プロジェクトのステータスを確認
3. 「Paused」と表示されている場合は再開が必要

**解決方法**:
```bash
# プロジェクトダッシュボードで「Restore project」をクリック
# または、新しいアクティビティで自動的に再開される
```

### 2. 環境変数の設定ミス

**症状**:
- 環境変数が読み込まれていない
- 間違ったキーが設定されている

**確認方法**:
```bash
# .env.localファイルの内容を確認
cat .env.local

# 環境変数が正しく読み込まれているか確認
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

**解決方法**:
1. `.env.local`ファイルが存在することを確認
2. 変数名が正確であることを確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. URLに余分なスペースや改行が含まれていないことを確認

### 3. ネットワーク/ファイアウォールの問題

**症状**:
- ECONNREFUSED または ETIMEDOUT エラー
- 特定のネットワークでのみ発生

**確認方法**:
```bash
# DNSを確認
nslookup your-project.supabase.co

# ポート443への接続を確認
nc -zv your-project.supabase.co 443

# tracerouteで経路を確認
traceroute your-project.supabase.co
```

**解決方法**:
1. 企業ファイアウォールの設定を確認
2. VPNを使用している場合は無効化してテスト
3. 別のネットワーク（モバイルホットスポット等）でテスト

### 4. APIキーの問題

**症状**:
- 401 Unauthorized エラー
- 認証関連のエラーメッセージ

**確認方法**:
```bash
# Supabaseダッシュボードでキーを再確認
# Settings > API > Project API keys
```

**解決方法**:
1. ダッシュボードからキーをコピーし直す
2. anon keyとservice role keyを混同していないか確認
3. キーの前後に余分な文字がないか確認

### 5. CORSの問題（ブラウザのみ）

**症状**:
- ブラウザコンソールにCORSエラー
- Node.jsでは動作するがブラウザでは失敗

**確認方法**:
ブラウザの開発者ツールでネットワークタブを確認

**解決方法**:
1. Supabaseダッシュボードで許可されたドメインを確認
2. `localhost:3000`が許可されていることを確認

## パッケージ.jsonのスクリプト追加

```json
{
  "scripts": {
    "test:connection": "node scripts/test-supabase-connection.js",
    "test:curl": "./scripts/test-supabase-curl.sh",
    "test:browser": "open scripts/test-supabase-browser.html"
  }
}
```

## 段階的なデバッグ手順

1. **基本的な接続確認**
   ```bash
   npm run test:connection
   ```

2. **curlでの詳細確認**
   ```bash
   npm run test:curl
   ```

3. **ブラウザでの確認**
   ```bash
   npm run test:browser
   ```

4. **Supabaseダッシュボードの確認**
   - プロジェクトがアクティブか
   - APIキーが正しいか
   - 使用量制限に達していないか

5. **ネットワーク環境の確認**
   - 別のネットワークで試す
   - VPN/プロキシを無効化
   - ファイアウォール設定を確認

## 緊急時の対処法

### プロジェクトの再起動
```bash
# Supabaseダッシュボードから：
# 1. Settings > General
# 2. "Pause project" をクリック
# 3. 数分待つ
# 4. "Resume project" をクリック
```

### ローカル開発環境の使用
```bash
# Supabase CLIでローカル環境を起動
npx supabase start

# 環境変数を更新
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

### サポートへの連絡
上記の手順で解決しない場合：
1. [Supabaseサポート](https://supabase.com/support)に連絡
2. プロジェクトID、エラーメッセージ、実行した診断結果を提供

## 予防策

1. **定期的な接続チェック**
   ```bash
   # CI/CDパイプラインに追加
   npm run test:connection
   ```

2. **環境変数の検証**
   ```javascript
   // app/lib/supabase/client.ts に追加
   if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
     console.error('Supabase URL is not configured');
   }
   ```

3. **エラーハンドリングの改善**
   ```javascript
   // 接続エラーを適切にキャッチして表示
   try {
     const { data, error } = await supabase.from('users').select('*');
     if (error) throw error;
   } catch (error) {
     console.error('Supabase connection error:', error);
     // ユーザーフレンドリーなエラーメッセージを表示
   }
   ```

最終更新: 2025年6月13日