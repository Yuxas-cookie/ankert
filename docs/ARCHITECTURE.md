# アーキテクチャ設計

## 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (カスタマイズ可能なRadix UIベース)
- **State Management**: React Context API + Zustand (必要に応じて)
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts
- **DnD**: @dnd-kit

### バックエンド
- **BaaS**: Supabase
  - Authentication (メール/パスワード, Google OAuth)
  - Database (PostgreSQL)
  - Realtime subscriptions
  - Storage (ファイルアップロード用)
  - Edge Functions (必要に応じて)

## ディレクトリ構成

```
survey-app/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 認証関連ページ
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/         # ダッシュボード（認証必須）
│   │   ├── surveys/
│   │   │   ├── [id]/
│   │   │   │   ├── edit/
│   │   │   │   ├── report/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── survey/              # 公開アンケート回答
│   │   └── [token]/
│   ├── preview/             # プレビュー
│   │   └── [token]/
│   ├── api/                 # APIルート
│   │   ├── auth/
│   │   └── surveys/
│   ├── layout.tsx
│   └── page.tsx             # ランディングページ
├── components/               # 共通コンポーネント
│   ├── ui/                  # shadcn/uiコンポーネント
│   ├── survey/              # アンケート関連
│   │   ├── editor/
│   │   ├── preview/
│   │   ├── response/
│   │   └── report/
│   └── layout/
├── lib/                      # ユーティリティ
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── hooks/               # カスタムフック
│   ├── utils/
│   └── validations/         # Zodスキーマ
├── types/                    # TypeScript型定義
├── public/                   # 静的ファイル
├── styles/                   # グローバルCSS
└── docs/                     # ドキュメント
```

## データフロー

### アンケート作成フロー
1. ユーザーがログイン
2. 新規アンケート作成（下書きとして保存）
3. 質問を追加・編集（自動保存）
4. プレビューで確認
5. 公開設定を行い公開

### 回答フロー
1. 回答者がアンケートURLにアクセス
2. 公開設定の確認（認証など）
3. 回答を入力
4. 送信でデータ保存
5. リアルタイムで集計更新

## セキュリティ設計

### 認証・認可
- Supabase Authでのユーザー認証
- Row Level Security (RLS)でのデータアクセス制御
- JWTトークンでのセッション管理

### データ保護
- HTTPS通信
- パスワードのハッシュ化（Supabaseが処理）
- SQLインジェクション対策（Supabaseクライアント使用）

### RLSポリシー例
```sql
-- アンケートは作成者のみ編集可能
CREATE POLICY "Users can CRUD own surveys"
ON surveys
FOR ALL
USING (auth.uid() = user_id);

-- 公開アンケートは誰でも閲覧可能
CREATE POLICY "Public surveys are viewable"
ON surveys
FOR SELECT
USING (status = 'published');
```

## パフォーマンス最適化

### フロントエンド
- Next.jsのSSG/ISRを活用
- 画像最適化 (next/image)
- コード分割 (dynamic imports)
- React.memoでのコンポーネント最適化

### バックエンド
- Supabaseのインデックス最適化
- ページネーション
- キャッシュ戦略

## スケーラビリティ

### 水平スケーリング
- Vercelでのエッジデプロイ
- Supabaseのオートスケーリング

### 垂直スケーリング
- Supabaseのプランアップグレード
- データベースの最適化

## デプロイ戦略

### 開発環境
- ローカルでのNext.js開発サーバー
- Supabaseローカル開発環境 (オプション)

### ステージング環境
- Vercel Preview Deployments
- Supabaseのブランチ機能

### 本番環境
- Vercel Production
- Supabase Production
- カスタムドメイン設定