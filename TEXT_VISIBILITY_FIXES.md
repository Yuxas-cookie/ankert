# Text Visibility Fixes Report

## 問題
アナリティクスと回答一覧画面で、一部のテキストが読みづらい状態でした。特にダークモードで、ハードコードされた色が原因で視認性が低下していました。

## 修正内容

### 1. **回答一覧ページ (app/surveys/[id]/responses/page.tsx)**
- `text-gray-600` → `text-muted-foreground` に変更
- `text-gray-500` → `text-muted-foreground` に変更
- `text-gray-300` → `text-muted-foreground/50` に変更
- アイコンの色にダークモード対応を追加:
  - `text-blue-600` → `text-blue-600 dark:text-blue-400`
  - `text-green-600` → `text-green-600 dark:text-green-400`
  - `text-purple-600` → `text-purple-600 dark:text-purple-400`
  - `text-orange-600` → `text-orange-600 dark:text-orange-400`
  - `text-red-600` → `text-red-600 dark:text-red-400`

### 2. **AnalyticsOverview コンポーネント**
- メトリックカードのテキスト色を修正:
  - `text-gray-600` → `text-muted-foreground`
  - `text-gray-900` → `text-foreground`
  - `text-gray-500` → `text-muted-foreground`
- カラークラスの背景色を半透明に変更し、ダークモード対応を追加:
  - `bg-blue-50` → `bg-blue-500/10 dark:bg-blue-500/5`
  - `bg-green-50` → `bg-green-500/10 dark:bg-green-500/5`
  - `bg-amber-50` → `bg-amber-500/10 dark:bg-amber-500/5`
  - `bg-purple-50` → `bg-purple-500/10 dark:bg-purple-500/5`
- スケルトンローディングの背景色:
  - `bg-gray-200` → `bg-muted`
- パフォーマンステーブルの条件付き色にダークモード対応を追加

### 3. **AdvancedInsights コンポーネント**
- すべての `text-gray-600` → `text-muted-foreground`
- すべての `text-gray-500` → `text-muted-foreground/80`
- 統計メトリックの色にダークモード対応を追加
- 背景色を半透明に変更:
  - `bg-yellow-50` → `bg-yellow-500/10 dark:bg-yellow-500/5`
  - `bg-blue-50` → `bg-blue-500/10 dark:bg-blue-500/5`
  - `bg-gray-100 text-gray-700` → `bg-muted text-muted-foreground`
- センチメント分析の色:
  - `text-green-600` → `text-green-600 dark:text-green-400`
  - `text-red-600` → `text-red-600 dark:text-red-400`
  - `text-gray-600` → `text-muted-foreground`
- インジケーターの色:
  - `bg-green-500` → `bg-green-500 dark:bg-green-400`
  - `bg-red-500` → `bg-red-500 dark:bg-red-400`
  - `bg-gray-500` → `bg-muted`

### 4. **ResponseDetailDialog コンポーネント**
- レーティングの星の色:
  - `text-gray-300` → `text-muted-foreground/30`
  - `text-yellow-500` → `text-yellow-500 dark:text-yellow-400`
- チェックマークアイコン:
  - `text-green-600` → `text-green-600 dark:text-green-400`
- エラーメッセージ:
  - `text-red-600` → `text-red-600 dark:text-red-400`

## 結果
これらの修正により、ライトモードとダークモードの両方で適切なコントラストが確保され、テキストの視認性が大幅に向上しました。すべてのハードコードされた色がテーマ対応のクラスに置き換えられ、Tailwind CSSのテーマシステムと完全に統合されました。

## テスト方法
1. アプリケーションを起動: `npm run dev`
2. 回答一覧ページ (`/surveys/[id]/responses`) にアクセス
3. 右上のテーマトグルでライトモード/ダークモードを切り替え
4. すべてのテキストが適切に表示されることを確認

## 今後の推奨事項
- 新しいコンポーネントを作成する際は、必ずテーマ対応のクラスを使用する
- `text-gray-xxx` のようなハードコードされた色は避け、`text-muted-foreground` などのセマンティックなクラスを使用する
- 条件付きの色を使用する場合は、必ずダークモードバリアントも追加する（例: `text-green-600 dark:text-green-400`）