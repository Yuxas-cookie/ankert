# Supabase認証設定ガイド

## CORSエラーの解決方法

### 1. Supabaseダッシュボードでの設定（最重要）

1. [Supabaseダッシュボード](https://supabase.com/dashboard/project/ffsalcmgbzrpkdertels) にアクセス

2. **Settings** → **Authentication** → **URL Configuration** に移動

3. 以下の設定を行う：

#### Site URL
```
http://localhost:3000
```

#### Redirect URLs（すべて追加）
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
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3002/auth/callback
```

### 2. メール設定の確認

**Settings** → **Authentication** → **Email** で以下を確認：

- **Enable Email Confirmations**: 開発中はOFFにすることを推奨
- **Enable Email Change Confirmations**: 開発中はOFFにすることを推奨

### 3. ローカル開発環境の設定

#### .env.localファイルの確認
```env
# 実際に使用しているポート番号に合わせて変更
NEXTAUTH_URL=http://localhost:3000
```

### 4. 開発サーバーの再起動

```bash
# 1. 現在のサーバーを停止（Ctrl+C）
# 2. キャッシュをクリア
rm -rf .next

# 3. サーバーを再起動
npm run dev
```

### 5. ブラウザの設定

1. ブラウザのキャッシュをクリア
2. Cookieを削除（特にSupabase関連のもの）
3. シークレット/プライベートウィンドウで試す

### 6. トラブルシューティング

#### エラー: "Preflight response is not successful. Status code: 400"
- Supabaseダッシュボードで Redirect URLs が正しく設定されているか確認
- URLの末尾にスラッシュを含めて設定されているか確認

#### エラー: "Failed to load resource"
- ネットワーク接続を確認
- Supabaseのステータスページでサービスが正常か確認

#### エラー: "Invalid login credentials"
- メールアドレスとパスワードが正しいか確認
- ユーザーが存在するか確認
- パスワードが要件を満たしているか確認（最低6文字）

### 7. デバッグ情報の確認方法

ブラウザの開発者ツールで以下を確認：

1. **Console**タブ
   - エラーメッセージの詳細
   - `🚀 サインアップ開始:` などのログメッセージ

2. **Network**タブ
   - 失敗したリクエストを選択
   - Headers タブで Request/Response headers を確認
   - 特に `Access-Control-Allow-Origin` ヘッダーを確認

### 8. 正常に動作している場合の挙動

1. **登録時**: 
   - 成功メッセージが表示
   - 確認メール送信（メール確認が有効な場合）
   - ダッシュボードへリダイレクト（メール確認が無効な場合）

2. **ログイン時**:
   - 成功後、ダッシュボードへ自動リダイレクト
   - セッションCookieが設定される

### 9. よくある質問

**Q: ポート3000が使われている場合は？**
A: Next.jsは自動的に3001, 3002と順に試します。.env.localのNEXTAUTH_URLを実際のポートに合わせて変更してください。

**Q: プロダクション環境では？**
A: プロダクションURLをSupabaseダッシュボードのRedirect URLsに追加し、環境変数を本番用に更新してください。

**Q: OAuth（Google/GitHub/Microsoft）ログインが動かない**
A: 各プロバイダーの設定（Client ID/Secret）が必要です。Supabaseダッシュボードで設定してください。