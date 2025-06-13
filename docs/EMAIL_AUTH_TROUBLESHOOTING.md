# メール認証のトラブルシューティング

## 問題
新規登録時にメールが届かず、アカウント登録ができない

## 解決方法

### 1. Supabaseダッシュボードでメール設定を確認

1. [Supabaseダッシュボード](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. **Authentication → Settings** に移動

### 2. メール確認を一時的に無効化（開発環境）

**Authentication → Settings → Email Auth** で以下を設定：
- `Enable email confirmations` を **OFF** に設定
- これにより、メール確認なしで即座にアカウントが有効化されます

### 3. SMTP設定を確認（本番環境）

本番環境では、カスタムSMTPサーバーの設定が必要です：

**Authentication → Settings → SMTP Settings** で以下を設定：
- Host: SMTPサーバーのホスト名
- Port: ポート番号（通常は587）
- Username: SMTPユーザー名
- Password: SMTPパスワード
- Sender email: 送信元メールアドレス
- Sender name: 送信者名

推奨SMTPサービス：
- SendGrid
- Amazon SES
- Mailgun
- Gmail（開発用）

### 4. Gmailを使用したSMTP設定例

```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: アプリパスワード（2段階認証を有効にして生成）
Sender email: your-email@gmail.com
Sender name: Survey Universe
```

### 5. メールログの確認

**Authentication → Logs** でメール送信のログを確認できます。
エラーがある場合は、ここに表示されます。

### 6. ローカル開発での代替方法

開発中は以下の方法でテストできます：

1. **Inbucket（ローカルメールサーバー）を使用**
   ```bash
   docker run -d -p 9000:9000 -p 2500:2500 inbucket/inbucket
   ```
   - Web UI: http://localhost:9000
   - SMTP: localhost:2500

2. **Supabaseのマジックリンクログを確認**
   - Authentication → Logs でマジックリンクURLを確認
   - URLを手動でブラウザに貼り付けて確認

### 7. コード側の対応

登録成功後のメッセージを改善：

```tsx
// components/auth/RegisterForm.tsx の success 表示部分
if (success) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">登録ありがとうございます！</p>
            <p>確認メールを送信しました。メールをご確認いただき、アカウントを有効化してください。</p>
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                メールが届かない場合：
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>迷惑メールフォルダを確認してください</li>
                <li>数分待ってから再度お試しください</li>
                <li>開発環境の場合は、管理者にメール設定の確認を依頼してください</li>
              </ul>
            </div>
          </div>
        </AlertDescription>
      </Alert>
      <div className="text-center">
        <Link
          href="/login"
          className="text-sm text-primary hover:text-primary/80"
        >
          ログインページに戻る
        </Link>
      </div>
    </div>
  )
}
```

## 即座の解決策

開発を続けるために、以下の手順で進めてください：

1. Supabaseダッシュボードで `Enable email confirmations` を一時的にOFFにする
2. 新規登録を再度試す
3. 登録後、すぐにログインできるようになります

## 本番環境への移行時

本番環境では必ず：
1. カスタムSMTPサーバーを設定
2. メール確認を有効化
3. メールテンプレートをカスタマイズ
4. SPF/DKIM設定で配信率を向上