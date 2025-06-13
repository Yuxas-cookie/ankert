# UI/UX Component Library

Group 2 (UI/UXデザイン班) によって開発された包括的なコンポーネントライブラリです。

## 📚 コンポーネント一覧

### 🎨 基本UIコンポーネント
shadcn/ui ベースの統一されたデザインシステム

- **Button** - プライマリ、セカンダリ、アウトライン等
- **Input/Textarea** - フォーム入力要素
- **Card** - コンテンツカード
- **Dialog/Modal** - ダイアログとモーダル
- **Form** - フォーム管理
- **Select/Checkbox/Radio** - 選択要素
- **Toast** - 通知システム

### 🏗️ レイアウトコンポーネント
レスポンシブ対応の統一レイアウト

- **Container** - レスポンシブコンテナ
- **Header** - ナビゲーションヘッダー
- **Sidebar** - ダッシュボードサイドバー
- **MainLayout** - メインアプリケーションレイアウト
- **AuthLayout** - 認証ページレイアウト
- **PublicLayout** - 公開ページレイアウト

### 📝 Survey Builder (ドラッグ&ドロップUI)
直感的なアンケート作成インターフェース

- **SurveyBuilder** - メインビルダーコンポーネント
- **QuestionTypesPanel** - 質問タイプ選択パネル
- **SurveyCanvas** - ドラッグ&ドロップキャンバス
- **QuestionCard** - 個別質問カード

### 🔧 高度なフォームコンポーネント
専門的な入力要素

- **RatingScale** - 星、数値、絵文字評価
- **MatrixQuestion** - 表形式質問
- **FileUpload** - ドラッグ&ドロップファイルアップロード
- **DateTimePicker** - 日付・時刻選択

### 📊 データビジュアライゼーション
Recharts統合による包括的なチャートライブラリ

#### 基本チャート
- **BarChart** - 棒グラフ（水平・垂直）
- **PieChart/DonutChart** - 円グラフ・ドーナツグラフ
- **LineChart** - 折れ線グラフ・エリアチャート

#### Survey専用チャート
- **SurveyBarChart** - アンケート回答用棒グラフ
- **SurveyPieChart** - アンケート回答用円グラフ
- **ResponseFunnel** - 回答フロー視覚化
- **LikertScaleChart** - リッカート尺度分析
- **TimeSeriesChart** - 時系列回答データ
- **RatingTrendChart** - 評価推移

### ♿ アクセシビリティ機能
WCAG 2.1 AA準拠の包括的な機能

- **AccessibilityProvider** - 設定管理とコンテキスト
- **AccessibilitySettings** - ユーザー設定画面
- **キーボードナビゲーション** - 完全なキーボード操作
- **ハイコントラスト** - 視覚的アクセシビリティ
- **大文字表示** - 文字サイズ調整
- **動作軽減** - アニメーション制御

### 🎭 テーマシステム
ダークモード対応の統一テーマ

- **ThemeProvider** - テーマ管理
- **ThemeToggle** - ダークモード切り替え
- **デザイントークン** - 統一された色・サイズ体系

## 🚀 使用方法

### 基本的なインポート
```tsx
import { 
  Button, 
  Card, 
  Input,
  MainLayout 
} from '@/components/ui'

import { 
  SurveyBuilder, 
  RatingScale 
} from '@/components/survey/builder'

import { 
  BarChart, 
  ResponseFunnel 
} from '@/components/charts'
```

### Survey Builder の使用例
```tsx
import { SurveyBuilder } from '@/components/survey/builder'

function SurveyCreator() {
  const handleSave = (questions) => {
    console.log('保存:', questions)
  }

  return (
    <SurveyBuilder
      onSave={handleSave}
      onPreview={() => console.log('プレビュー')}
    />
  )
}
```

### Charts の使用例
```tsx
import { SurveyBarChart, ResponseFunnel } from '@/components/charts'

function Analytics() {
  const responses = [
    { option: '非常に満足', count: 45 },
    { option: '満足', count: 32 },
    { option: '普通', count: 12 },
    { option: '不満', count: 3 }
  ]

  return (
    <div className="space-y-6">
      <SurveyBarChart
        responses={responses}
        question="サービスの満足度"
        totalResponses={92}
      />
      
      <ResponseFunnel
        steps={funnelSteps}
        totalStarted={150}
      />
    </div>
  )
}
```

### アクセシビリティの設定
```tsx
import { AccessibilityProvider, AccessibilitySettings } from '@/components/accessibility'

function App() {
  return (
    <AccessibilityProvider>
      <MainLayout>
        <AccessibilitySettings />
      </MainLayout>
    </AccessibilityProvider>
  )
}
```

## 🎨 デザインシステム

### カラーパレット
- **Primary**: ブランドメインカラー
- **Secondary**: セカンダリカラー
- **Neutral**: グレースケール
- **Semantic**: Success, Warning, Error, Info

### タイポグラフィ
- **Font Family**: Inter (Sans), Fira Code (Mono)
- **Font Sizes**: xs (12px) ~ 6xl (60px)
- **Font Weights**: Light (300) ~ ExtraBold (800)

### スペーシング
- **Scale**: 4px基準の8倍数システム
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)

## 🔧 技術スタック

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **File Upload**: react-dropzone
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Theme**: next-themes

## ✅ 完成度

### ✅ 完了済み
- [x] 基本UIコンポーネント (shadcn/ui)
- [x] レイアウトコンポーネント
- [x] Survey Builder (ドラッグ&ドロップ)
- [x] 高度なフォームコンポーネント
- [x] データビジュアライゼーション
- [x] アクセシビリティ機能
- [x] テーマシステム
- [x] レスポンシブデザイン

### 🎯 品質指標
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応
- **パフォーマンス**: Core Web Vitals最適化
- **TypeScript**: 100%型安全
- **テーマ**: ダークモード完全対応

## 📝 コンポーネント設計原則

1. **再利用性**: 高度に再利用可能なコンポーネント設計
2. **アクセシビリティ**: 包括的なユーザビリティ
3. **型安全性**: TypeScriptによる完全な型定義
4. **一貫性**: 統一されたデザインシステム
5. **パフォーマンス**: 最適化されたレンダリング

## 🔗 関連ドキュメント

- [REQUIREMENTS.md](../../docs/REQUIREMENTS.md) - プロジェクト要件
- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - システム設計
- [GROUP_ASSIGNMENTS.md](../../docs/GROUP_ASSIGNMENTS.md) - チーム分担

---

**Group 2: UI/UXデザイン班** により開発完了 🎉