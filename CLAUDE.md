# Survey App 開発ガイドライン

## プロジェクト概要
このプロジェクトは、Apple iPhone 16 Pro風の宇宙的（Cosmic）デザインを採用した最先端のアンケート作成・管理アプリケーションです。

## 技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **スタイリング**: Tailwind CSS v4
- **アニメーション**: Framer Motion
- **UI コンポーネント**: shadcn/ui (カスタマイズ版)
- **言語**: TypeScript

## デザインシステム

### Cosmic Design System
- **インスピレーション**: Apple iPhone 16 Pro
- **主要な要素**:
  - チタニウム風の質感
  - ネビュラ（星雲）エフェクト
  - オーロラグラデーション
  - グラスモーフィズム
  - Dynamic Island風のUI要素

### カラーパレット
CSS変数として定義（`app/globals.css`参照）:
```css
--cosmic-nebula: #5E5CE6;  /* 紫 */
--cosmic-star: #0A84FF;    /* 青 */
--cosmic-galaxy: #FF375F;  /* 赤 */
--cosmic-aurora: #30D158;  /* 緑 */
--cosmic-solar: #FFD60A;   /* 黄 */
```

## 開発ルール

### 1. テーマ対応
- **必須**: 全ての新規コンポーネントはライトモード・ダークモード両方に対応すること
- ハードコードされた色は使用禁止
- 必ずCSS変数またはTailwindのテーマクラスを使用:
  ```tsx
  // ❌ 悪い例
  <div className="text-white bg-black">
  
  // ✅ 良い例
  <div className="text-foreground bg-background">
  ```

### 2. コンポーネント作成規則
- Cosmicデザインシステムに準拠
- アニメーションはFramer Motionを使用
- インタラクティブな要素には必ずホバー・タップエフェクトを追加
- アクセシビリティを考慮（ARIA属性、キーボードナビゲーション）

### 3. ファイル構成
```
components/
├── ui/           # 基本UIコンポーネント（ボタン、カード等）
├── auth/         # 認証関連コンポーネント
├── survey/       # アンケート関連コンポーネント
├── layout/       # レイアウトコンポーネント
└── analytics/    # 分析関連コンポーネント
```

### 4. 命名規則
- **コンポーネント**: PascalCase（例: `CosmicButton.tsx`）
- **関数・変数**: camelCase（例: `handleSubmit`）
- **CSS変数**: kebab-case（例: `--cosmic-nebula`）
- **型定義**: PascalCase + 接尾辞（例: `SurveyType`, `UserInput`）

### 5. スタイリング優先順位
1. Tailwind CSSクラス
2. CSS変数（テーマ関連）
3. Framer Motion（アニメーション）
4. インラインスタイル（動的な値のみ）

### 6. パフォーマンス最適化
- 画像は最適化して使用
- 重いアニメーションは`will-change`を適用
- `use client`は必要な場合のみ使用
- 大きなコンポーネントは動的インポート

### 7. エラーハンドリング
- ユーザーフレンドリーなエラーメッセージ（日本語）
- トースト通知またはアラートコンポーネントを使用
- コンソールエラーは本番環境で非表示

### 8. 国際化対応
- 現在は日本語がメイン
- ハードコードされたテキストは最小限に
- 将来的な多言語対応を考慮した構造

## よく使うコンポーネント

### UIコンポーネント
- `CosmicButton`: 宇宙的なボタン（4つのバリアント）
- `CosmicCard`: 3D効果付きカード（4つのバリアント）
- `FuturisticButton`: 未来的なボタン（5つのバリアント）
- `FuturisticCard`: 未来的なカード（4つのバリアント）
- `CosmicThemeToggle`: テーマ切り替えトグル

### レイアウト
- `FuturisticHeader`: メインヘッダー
- `Container`: コンテンツラッパー

## コマンド一覧
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run typecheck

# リント
npm run lint

# Supabase関連
npx supabase start    # ローカル開発
npx supabase db push  # マイグレーション適用
```

## トラブルシューティング

### ポート3000が使用中の場合
開発サーバーが自動的に3001番ポートを使用します。

### テーマが正しく適用されない場合
1. `globals.css`のCSS変数定義を確認
2. `next-themes`の設定を確認
3. コンポーネントでハードコードされた色がないか確認

### アニメーションがカクつく場合
1. `will-change`プロパティを追加
2. GPU アクセラレーションを有効化（`transform: translateZ(0)`）
3. 不要なre-renderを防ぐ

## 今後の開発方針
1. **機能拡張**: AI分析機能、リアルタイムコラボレーション
2. **デザイン改善**: より洗練されたアニメーション、マイクロインタラクション
3. **パフォーマンス**: Next.js 15の新機能を活用した最適化
4. **アクセシビリティ**: WCAG 2.1 AA準拠を目指す

## 重要な注意事項
- **プロダクション環境ではまだ使用しないこと**（開発中）
- デザインの一貫性を保つため、新規UIは既存コンポーネントを参考に
- パフォーマンスとUXのバランスを常に意識
- コードレビュー前に必ずテーマ切り替えをテスト

---

最終更新: 2025年6月12日
作成者: Claude Code + Yasuhiro Hashimoto