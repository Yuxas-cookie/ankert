# アナリティクス機能ガイド

## 概要

Survey Appのアナリティクス機能は、アンケートの回答データを分析し、視覚的に表示する包括的なソリューションです。基本的な統計分析から高度なテキスト分析まで、幅広い分析機能を提供します。

## 機能一覧

### 1. 基本分析（Basic Analytics）

#### 主要メトリクス
- **総回答数**: アンケートに対する全回答数
- **完了率**: 回答を最後まで完了したユーザーの割合
- **平均完了時間**: 回答完了までの平均時間
- **回答速度**: 1日あたりの平均回答数

#### チャート表示
- **回答トレンド**: 日別の回答数推移をラインチャートで表示
- **デバイス分布**: モバイル、デスクトップ、タブレットの利用割合
- **完了ファネル**: 質問ごとの回答率を表示

#### 質問パフォーマンス
- 質問ごとの回答率
- 平均回答時間
- 離脱率

### 2. 高度な分析（Advanced Analytics）

#### 統計分析
- **記述統計**: 平均、中央値、標準偏差、範囲
- **相関分析**: 回答時間と回答率の相関
- **トレンド分析**: 回答数の増減傾向と予測
- **問題のある質問の特定**: 低回答率や高離脱率の質問を検出

#### テキスト分析
- **感情分析**: ポジティブ、ネガティブ、ニュートラルの分類
- **キーインサイト抽出**: 称賛、苦情、提案、問題点の自動検出
- **トピック分析**: 頻出トピックとキーワードの抽出
- **言語メトリクス**: 読みやすさ、語彙の多様性、複雑さの評価

### 3. フィルタリング機能

#### 利用可能なフィルター
- **日付範囲**: カスタム期間、プリセット（今日、週、月、年）
- **回答ステータス**: 完了済み、未完了、全て
- **デバイスタイプ**: モバイル、デスクトップ、タブレット
- **質問タイプ**: 特定の質問タイプのみを分析

### 4. エクスポート機能

#### エクスポート形式
- **CSV**: 基本的なデータエクスポート
- **Excel**: 詳細な分析レポート（複数シート）
- **PDF**: プレゼンテーション用レポート

#### カスタマイズオプション
- ブランディング（ロゴ、カラー）
- チャートの含有/除外
- 詳細レベルの選択

## 使用方法

### 1. アナリティクスページへのアクセス

```
/surveys/[surveyId]/responses
```

回答一覧ページから「基本分析」「高度な分析」タブで切り替え

### 2. テストページでの確認

```
/test-analytics
```

モックデータを使用してアナリティクス機能をテスト

### 3. APIエンドポイント

#### パフォーマンスメトリクス取得
```
GET /api/analytics/performance?surveyId={surveyId}
```

### 4. コンポーネントの使用

```tsx
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview'
import { AdvancedInsights } from '@/components/analytics/AdvancedInsights'

// 基本分析
<AnalyticsOverview 
  data={analyticsData} 
  surveyId={surveyId}
  loading={isLoading}
/>

// 高度な分析
<AdvancedInsights 
  data={analyticsData}
  textResponses={textResponses}
/>
```

## データ構造

### AnalyticsData型

```typescript
interface AnalyticsData {
  totalResponses: number
  completionRate: number
  avgCompletionTime: number
  responseVelocity: number
  questionMetrics: QuestionMetric[]
  trends: TrendData[]
  demographics: Demographics
}
```

### QuestionMetric型

```typescript
interface QuestionMetric {
  questionId: string
  question: string
  responseRate: number
  avgTime?: number
  dropOffRate?: number
}
```

## パフォーマンス最適化

### 実装済みの最適化
- データのメモ化（useMemo）
- 遅延ローディング
- チャートの仮想化
- キャッシュ戦略

### 推奨事項
- 大量データの場合はページネーション使用
- リアルタイムデータは必要時のみ有効化
- 重いチャートはユーザーアクションで表示

## トラブルシューティング

### よくある問題

1. **チャートが表示されない**
   - データが正しい形式か確認
   - コンソールエラーをチェック
   - チャートライブラリの依存関係を確認

2. **分析が遅い**
   - データ量を確認（1000件以上は要注意）
   - ブラウザのパフォーマンスツールで確認
   - 不要な再レンダリングをチェック

3. **エクスポートが失敗する**
   - ブラウザのポップアップブロッカーを確認
   - メモリ使用量を確認
   - データサイズの制限を確認

## 今後の改善予定

1. **リアルタイム分析**
   - WebSocketを使用したライブアップデート
   - ストリーミングデータの処理

2. **AI機能の強化**
   - より高度な自然言語処理
   - 予測分析の精度向上
   - 自動レポート生成

3. **ビジュアライゼーション**
   - インタラクティブなダッシュボード
   - カスタマイズ可能なチャート
   - 3Dビジュアライゼーション

## 開発者向け情報

### 新しい分析機能の追加

1. 分析ロジックを `/lib/analytics/` に追加
2. チャートコンポーネントを `/components/charts/` に作成
3. `AnalyticsData` 型を拡張
4. UIコンポーネントに統合

### テスト

```bash
# アナリティクス機能のテスト
node scripts/test-analytics.js

# E2Eテスト
npm run test:e2e -- analytics.spec.ts
```

### デバッグ

```typescript
// デバッグモードの有効化
localStorage.setItem('analytics_debug', 'true')

// パフォーマンスログの確認
window.performance.measure('analytics-calculation')
```

## セキュリティとプライバシー

- 個人情報は分析から除外
- 集計データのみを表示
- アクセス権限の確認
- データの匿名化処理

## サポート

問題や質問がある場合は、以下を参照してください：

- GitHub Issues
- 開発ドキュメント
- テクニカルサポート

---

最終更新: 2025年6月13日
作成者: Claude Code + Yasuhiro Hashimoto