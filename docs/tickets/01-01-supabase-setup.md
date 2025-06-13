# チケット1-1: Supabase環境構築

## 概要
Supabaseプロジェクトの作成とデータベース環境の構築を行う

## 目標
- Supabaseプロジェクトの初期設定
- データベーススキーマの実装
- 認証設定の基盤構築

## タスク詳細

### 1. Supabaseプロジェクト作成
- [ ] Supabaseダッシュボードでプロジェクト作成
- [ ] プロジェクト名: `survey-app`
- [ ] リージョン選択（最寄り）
- [ ] データベースパスワード設定

### 2. 環境変数設定
- [ ] `.env.local`ファイル作成
- [ ] `NEXT_PUBLIC_SUPABASE_URL`設定
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`設定
- [ ] `SUPABASE_SERVICE_ROLE_KEY`設定

### 3. データベーススキーマ実装
```sql
-- 以下のテーブルを作成
- surveys（アンケート）
- questions（質問）
- question_options（選択肢）
- responses（回答セッション）
- answers（個別回答）
- survey_permissions（公開設定）
- survey_previews（プレビュー共有）
```

#### 3.1 基本テーブル作成
- [ ] UUID拡張の有効化
- [ ] surveysテーブル作成
- [ ] questionsテーブル作成
- [ ] question_optionsテーブル作成
- [ ] responsesテーブル作成
- [ ] answersテーブル作成

#### 3.2 権限管理テーブル作成
- [ ] survey_permissionsテーブル作成
- [ ] survey_previewsテーブル作成

### 4. Row Level Security設定
- [ ] 全テーブルでRLSを有効化
- [ ] surveysテーブルのポリシー作成
  - 作成者のみCRUD可能
  - 公開アンケートは閲覧可能
- [ ] questionsテーブルのポリシー作成
- [ ] question_optionsテーブルのポリシー作成
- [ ] responsesテーブルのポリシー作成
- [ ] answersテーブルのポリシー作成

### 5. 認証プロバイダー設定
- [ ] Email/Password認証の確認
- [ ] Google OAuth設定準備
  - Google Cloud Console設定
  - クライアントID/シークレット取得
  - リダイレクトURI設定

### 6. インデックス最適化
- [ ] パフォーマンス向上のためのインデックス作成
- [ ] 外部キー制約の確認

## 完了条件
- [ ] Supabaseプロジェクトが正常に作成されている
- [ ] 全テーブルが要件通りに作成されている
- [ ] RLSポリシーが適切に設定されている
- [ ] 認証設定が完了している
- [ ] ローカル環境からSupabaseに接続できる

## テストケース
1. Supabase clientからデータベースに接続できる
2. surveysテーブルにサンプルデータを挿入・取得できる
3. RLSが正常に動作する（他ユーザーのデータにアクセスできない）
4. 認証フローが動作する

## 依存関係
- なし（最初に実装すべきチケット）

## 次のチケット
- チケット1-3: 認証システム実装
- チケット2-1: アンケート作成基盤

## 参考資料
- docs/SETUP.md
- docs/REQUIREMENTS.md（データベース設計）
- Supabase公式ドキュメント