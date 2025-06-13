# Vercel ビルド メモ

## 確認された警告事項

### 1. 非推奨パッケージ
以下のパッケージが非推奨となっています：
- `@supabase/auth-helpers-shared@0.7.0`
- `@supabase/auth-helpers-nextjs@0.10.0`

**推奨対応**: `@supabase/ssr` パッケージへの移行

### 2. セキュリティ脆弱性
- 1つの高深刻度の脆弱性が検出されています
- `npm audit` を実行して詳細を確認

## 今後の対応（ビルド成功後）

1. **パッケージの更新**
   ```bash
   npm uninstall @supabase/auth-helpers-nextjs @supabase/auth-helpers-shared
   npm install @supabase/ssr
   ```

2. **コードの更新**
   - Supabase認証ヘルパーの使用箇所を新しいパッケージに対応させる

3. **脆弱性の修正**
   ```bash
   npm audit
   npm audit fix
   ```

## 注意事項
これらの警告はアプリケーションの動作には影響しませんが、セキュリティとメンテナンスの観点から将来的に対応することを推奨します。