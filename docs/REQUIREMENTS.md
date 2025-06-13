# アンケートWebアプリ 要件定義書

## 1. プロジェクト概要
アンケートの作成・配布・回答収集・集計・レポート作成を一元管理できるWebアプリケーションを開発する。

## 2. ユーザーロール

### 2.1 アンケート作成者
- アンケートの作成・編集・削除
- 回答結果の閲覧・集計
- レポートの生成・エクスポート

### 2.2 アンケート回答者
- アンケートへの回答
- 公開設定に応じたアクセス

## 3. 機能要件

### 3.1 認証機能
- **Supabase Authを使用**
  - メール/パスワード認証
  - Google OAuth認証
  - セッション管理
  - パスワードリセット

### 3.2 アンケート作成機能

#### 3.2.1 質問タイプ
- 単一選択（ラジオボタン）
- 複数選択（チェックボックス）
- 自由記述（テキストフィールド/テキストエリア）
- 評価スケール（1-5、1-10等）
- マトリックス質問
- 日付/時刻選択
- ファイルアップロード

#### 3.2.2 アンケート設定
- タイトル・説明文
- 質問の必須/任意設定
- 条件分岐（前の回答による表示制御）
- ドラッグ&ドロップでの質問順序変更

#### 3.2.3 下書き・プレビュー機能
- 自動保存（編集中2-3秒ごと）
- 下書き一覧表示
- リアルタイムプレビュー
- テスト回答機能
- プレビュー共有URL生成
- モバイル/PC表示切り替え

### 3.3 公開設定
- 一般公開（誰でも回答可能）
- URLを知っている人のみ
- ログインユーザーのみ
- 特定グループ/メールアドレスのみ
- 公開期間設定

### 3.4 集計・レポート機能

#### 3.4.1 リアルタイム集計
- 回答数のリアルタイム更新
- 各質問の集計結果表示

#### 3.4.2 グラフ表示
- 円グラフ
- 棒グラフ
- 折れ線グラフ
- インタラクティブな操作

#### 3.4.3 分析機能
- 回答詳細一覧
- フィルタリング
- クロス集計

### 3.5 エクスポート機能
- PDF形式（レポート全体）
- Excel/CSV形式（生データ）
- グラフ画像（PNG/SVG）

## 4. 非機能要件

### 4.1 パフォーマンス
- ページ読み込み時間: 3秒以内
- 同時アクセス数: 1000ユーザー以上

### 4.2 セキュリティ
- HTTPS通信
- データ暗号化
- CSRF対策
- XSS対策

### 4.3 ユーザビリティ
- レスポンシブデザイン
- 直感的なUI/UX
- アクセシビリティ対応

### 4.4 互換性
- モダンブラウザ対応
- iOS/Android対応

## 5. データベース設計

### 5.1 テーブル構成
```sql
-- ユーザー情報（Supabase Authで管理）
users

-- アンケート
surveys
  id
  user_id
  title
  description
  status (draft/published/closed/archived)
  is_draft
  draft_updated_at
  preview_token
  created_at
  updated_at
  published_at
  closed_at

-- 質問
questions
  id
  survey_id
  question_type
  question_text
  is_required
  order_index
  settings (JSON)
  created_at
  updated_at

-- 選択肢
question_options
  id
  question_id
  option_text
  order_index
  created_at

-- 回答セッション
responses
  id
  survey_id
  user_id (nullable)
  is_test_response
  started_at
  completed_at
  ip_address
  user_agent

-- 個別回答
answers
  id
  response_id
  question_id
  answer_text
  answer_value
  created_at

-- 公開設定
survey_permissions
  id
  survey_id
  permission_type
  allowed_emails (ARRAY)
  password_hash
  start_date
  end_date

-- プレビュー共有
survey_previews
  id
  survey_id
  token
  password_hash
  expires_at
  created_at
```

## 6. 画面構成

### 6.1 作成者用画面
1. **ダッシュボード**
   - 作成したアンケート一覧
   - 下書き/公開中/終了のステータス表示
   - 統計情報

2. **アンケート作成/編集**
   - 左側：編集エリア
   - 右側：リアルタイムプレビュー
   - 上部：保存状態、プレビュー共有ボタン

3. **レポート表示**
   - 集計結果ダッシュボード
   - グラフ表示エリア
   - 回答詳細テーブル

4. **設定画面**
   - アカウント設定
   - 公開設定

### 6.2 回答者用画面
1. **アンケート回答**
   - レスポンシブ対応
   - 進捗バー表示
   - 一時保存機能

2. **プレビュー専用画面**
   - 実際の回答画面と同じUI
   - テストモード表示

## 7. 開発スケジュール（目安）
1. 基本設計・環境構築（1週間）
2. 認証機能実装（1週間）
3. アンケート作成機能（2週間）
4. 回答機能（1週間）
5. 集計・レポート機能（2週間）
6. テスト・デバッグ（1週間）

## 8. 今後の拡張性
- テンプレート機能
- AIを使った質問作成支援
- リマインダー機能
- 多言語対応
- Webhook連携