# ログインエラー トラブルシューティングガイド

## 🚨 現在の問題
ログイン時に500エラー（Internal Server Error）が発生している

## 📋 デバッグ手順

### 1. 環境変数の確認

まず、以下のコマンドを実行して環境変数をチェック:

```bash
node scripts/check-auth-config.js
```

#### チェック項目:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` が設定されているか
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されているか
- [ ] URLが `https://` で始まっているか
- [ ] URLに `.supabase.co` が含まれているか

### 2. Supabase Dashboard での確認

[Supabase Dashboard](https://app.supabase.com) にログインして以下を確認:

#### Authentication設定
1. **Authentication → Settings** に移動
2. 以下を確認:
   - [ ] Email Auth が有効になっている
   - [ ] Confirm email が無効になっている（開発環境の場合）

#### URL設定
1. **Authentication → URL Configuration** に移動
2. **Redirect URLs** に以下が追加されているか確認:
   ```
   http://localhost:3000/*
   http://localhost:3001/*
   http://localhost:3002/*
   ```

#### プロジェクトステータス
1. **Project Settings → General** で:
   - [ ] プロジェクトが「Active」状態か確認
   - [ ] プロジェクトが一時停止していないか確認

### 3. デバッグページでの詳細確認

開発サーバーを起動:
```bash
npm run dev
```

ブラウザで以下にアクセス:
```
http://localhost:3000/debug/auth-detailed
```

このページで:
1. **環境情報タブ** で設定を確認
2. **テスト実行タブ** でログインテストを実行
3. **ネットワークログタブ** でエラー詳細を確認

### 4. ブラウザでの確認

#### 開発者ツール（F12）を開いて:

1. **Console タブ**
   - 赤いエラーメッセージを確認
   - 特に500エラーの詳細を確認

2. **Network タブ**
   - Supabaseへのリクエストを確認
   - ステータスコードとレスポンスを確認
   - リクエストヘッダーでAPIキーが送信されているか確認

### 5. よくある原因と解決方法

#### 🔴 500 Internal Server Error の場合

**原因1: 環境変数が正しく設定されていない**
```bash
# .env.local ファイルを確認
cat .env.local
```

正しい形式:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**原因2: Supabaseプロジェクトが一時停止**
- Supabase Dashboardでプロジェクトをアクティブ化

**原因3: APIキーが間違っている**
- Project Settings → API でAnon keyを再確認
- Service keyではなくAnon keyを使用していることを確認

#### 🔴 Invalid login credentials の場合

**原因: ユーザーが存在しないまたはパスワードが間違っている**
- 新しいユーザーを作成してテスト
- パスワードをリセットしてみる

#### 🔴 Email not confirmed の場合

**原因: メール確認が必要**
- 確認メールをチェック
- または、Supabase DashboardでEmail confirmationを無効化（開発環境）

### 6. コマンドラインでのテスト

新しいテストユーザーを作成:
```bash
node scripts/create-test-users.js
```

### 7. 環境変数の再設定

もし環境変数に問題がある場合:

1. Supabase Dashboardから正しい値をコピー:
   - Project Settings → API → Project URL
   - Project Settings → API → anon public key

2. `.env.local` ファイルを更新:
```bash
# エディタで開く
code .env.local
# または
nano .env.local
```

3. 開発サーバーを再起動:
```bash
# Ctrl+C で停止してから
npm run dev
```

### 8. 最終手段

それでも解決しない場合:

1. **キャッシュクリア**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **ブラウザのキャッシュとCookieをクリア**
   - 開発者ツール → Application → Clear Storage

3. **別のブラウザでテスト**
   - Chrome、Firefox、Safari等

4. **ローカルSupabaseでテスト**
   ```bash
   npx supabase start
   ```

## 📝 デバッグ情報の収集

問題が解決しない場合は、以下の情報を収集してください:

1. `node scripts/check-auth-config.js` の出力
2. ブラウザのConsoleエラー（スクリーンショット）
3. Network タブの失敗したリクエストの詳細
4. `/debug/auth-detailed` ページの環境情報

## 🎯 次のステップ

1. 上記の手順を順番に実行
2. エラーメッセージの詳細を確認
3. 該当する解決方法を試す
4. それでも解決しない場合は、収集したデバッグ情報を共有

---

最終更新: 2025年6月13日