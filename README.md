# Survey App - 宇宙的デザインのアンケート作成・管理アプリ

Apple iPhone 16 Pro風の宇宙的（Cosmic）デザインを採用した、美しく機能的なアンケート作成・管理アプリケーションです。

## 特徴

### デザイン
- **Cosmic Design System**: チタニウム風の質感とネビュラエフェクト
- **ダークモード対応**: 完全なテーマ切り替え機能
- **レスポンシブデザイン**: モバイルからデスクトップまで対応
- **アニメーション**: Framer Motionによる滑らかなインタラクション

### 機能
- **アンケート作成**: 直感的なドラッグ&ドロップビルダー
- **多様な質問タイプ**: テキスト、選択式、評価、マトリックス等
- **リアルタイム分析**: 回答の即時可視化
- **チーム協力**: 複数人での編集・管理
- **セキュアな認証**: Supabase Authによる安全な認証システム

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **スタイリング**: Tailwind CSS v4
- **アニメーション**: Framer Motion
- **UIコンポーネント**: shadcn/ui (カスタマイズ版)
- **言語**: TypeScript

## セットアップ

### 必要条件
- Node.js 18.x以上
- npm または yarn
- Supabaseアカウント

### インストール手順

1. リポジトリをクローン
```bash
git clone https://github.com/Yuxas-cookie/ankert.git
cd ankert
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
`.env.local.example`をコピーして`.env.local`を作成し、Supabaseの認証情報を設定：
```bash
cp .env.local.example .env.local
```

4. Supabaseプロジェクトをセットアップ
- [Supabase](https://supabase.com)でプロジェクトを作成
- SQLエディタで`supabase/migrations/`内のマイグレーションファイルを実行

5. 開発サーバーを起動
```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## デプロイ

Vercelへのデプロイ手順は[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)を参照してください。

## プロジェクト構成

```
survey-app/
├── app/                # Next.js App Router
├── components/         # Reactコンポーネント
│   ├── ui/            # 基本UIコンポーネント
│   ├── survey/        # アンケート関連
│   └── analytics/     # 分析関連
├── lib/               # ユーティリティ関数
├── hooks/             # カスタムフック
├── types/             # TypeScript型定義
└── supabase/          # データベーススキーマ
```

## 開発ガイドライン

詳細な開発ガイドラインは[CLAUDE.md](./CLAUDE.md)を参照してください。

## スクリーンショット

### ダッシュボード
宇宙的なデザインを採用したメインダッシュボード

### アンケートビルダー
直感的なドラッグ&ドロップインターフェース

### 分析画面
リアルタイムでの回答分析と可視化

## ライセンス

このプロジェクトはプライベートリポジトリとして管理されています。

## 貢献

現在、このプロジェクトはプライベート開発中です。

## サポート

問題や質問がある場合は、Issueを作成してください。

---

Built with ❤️ using Next.js and Supabase