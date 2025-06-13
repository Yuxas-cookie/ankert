-- 🚀 アンケートWebアプリ 包括的データベーススキーマ
-- Created: 2025-06-11
-- Version: 2.0 (完全リニューアル)

-- 必要な拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================
-- 1. ユーザープロファイルテーブル
-- ===============================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    timezone TEXT DEFAULT 'Asia/Tokyo',
    language TEXT DEFAULT 'ja',
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================
-- 2. チーム管理テーブル
-- ===============================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    max_members INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================
-- 3. 役割・権限システム
-- ===============================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- チームメンバーテーブル
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    invited_by UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    UNIQUE(team_id, user_id)
);

-- チーム招待テーブル
CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    invited_by UUID NOT NULL REFERENCES profiles(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, email)
);

-- ===============================
-- 4. アンケートテーブル（拡張版）
-- ===============================
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'closed', 'archived')) DEFAULT 'draft',
    is_draft BOOLEAN NOT NULL DEFAULT true,
    draft_updated_at TIMESTAMPTZ,
    preview_token TEXT UNIQUE,
    
    -- アクセス制御
    access_type TEXT DEFAULT 'public' CHECK (access_type IN (
        'public', 'url_only', 'password', 'authenticated', 'email_restricted'
    )),
    access_password TEXT,
    allowed_emails TEXT[],
    max_responses INTEGER,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- 設定
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    
    -- メタデータ
    folder_id UUID,
    tags TEXT[] DEFAULT '{}',
    
    -- 統計キャッシュ
    response_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    avg_completion_time INTEGER, -- 秒
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- ===============================
-- 5. 質問テーブル（拡張版）
-- ===============================
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL CHECK (question_type IN (
        'single_choice', 'multiple_choice', 'text_short', 'text_long', 
        'rating_scale', 'matrix_single', 'matrix_multiple', 'date', 'time', 
        'datetime', 'file_upload', 'slider', 'ranking'
    )),
    question_text TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL,
    
    -- 質問設定
    settings JSONB DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    
    -- 条件分岐ロジック
    logic_conditions JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(survey_id, order_index)
);

-- ===============================
-- 6. 選択肢テーブル（拡張版）
-- ===============================
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_value TEXT,
    order_index INTEGER NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(question_id, order_index)
);

-- ===============================
-- 7. 回答セッションテーブル（拡張版）
-- ===============================
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    
    -- 回答状態
    is_test_response BOOLEAN NOT NULL DEFAULT false,
    is_complete BOOLEAN NOT NULL DEFAULT false,
    completion_percentage INTEGER DEFAULT 0,
    
    -- タイムスタンプ
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- メタデータ
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    device_info JSONB DEFAULT '{}',
    
    -- 計測データ
    time_spent INTEGER, -- 秒
    page_views INTEGER DEFAULT 0
);

-- ===============================
-- 8. 個別回答テーブル（拡張版）
-- ===============================
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    -- 回答データ
    answer_text TEXT,
    answer_value JSONB,
    answer_numeric DECIMAL,
    answer_date DATE,
    answer_timestamp TIMESTAMPTZ,
    
    -- メタデータ
    time_spent INTEGER, -- この質問にかけた時間（秒）
    revision_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(response_id, question_id)
);

-- ===============================
-- 9. ファイルアップロードテーブル
-- ===============================
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- ファイル情報
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    storage_bucket TEXT DEFAULT 'survey-uploads',
    
    -- メタデータ
    upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'completed', 'failed')),
    virus_scan_status TEXT DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ===============================
-- 10. 監査ログテーブル
-- ===============================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    survey_id UUID REFERENCES surveys(id) ON DELETE SET NULL,
    
    -- イベント情報
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    
    -- 詳細データ
    details JSONB DEFAULT '{}',
    old_values JSONB,
    new_values JSONB,
    
    -- メタデータ
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================
-- 11. パフォーマンスメトリクステーブル
-- ===============================
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- ページ情報
    page_name TEXT NOT NULL,
    url TEXT,
    
    -- Core Web Vitals
    page_load_time INTEGER,
    first_contentful_paint INTEGER,
    largest_contentful_paint INTEGER,
    cumulative_layout_shift DECIMAL(10,6),
    first_input_delay INTEGER,
    time_to_interactive INTEGER,
    
    -- メタデータ
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================
-- 12. リアルタイムセッションテーブル
-- ===============================
CREATE TABLE realtime_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    
    -- セッション状態
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    
    -- メタデータ
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- ===============================
-- 13. 通知テーブル
-- ===============================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- 通知内容
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    
    -- 状態
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================
-- 14. 分析イベントテーブル
-- ===============================
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    
    -- イベント情報
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    
    -- メタデータ
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT
);

-- ===============================
-- インデックス作成
-- ===============================

-- プロファイル
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_last_sign_in ON profiles(last_sign_in_at);

-- チーム
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);

-- アンケート
CREATE INDEX idx_surveys_user_id ON surveys(user_id);
CREATE INDEX idx_surveys_team_id ON surveys(team_id);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_created_at ON surveys(created_at);
CREATE INDEX idx_surveys_published_at ON surveys(published_at);

-- 質問・選択肢
CREATE INDEX idx_questions_survey_id ON questions(survey_id);
CREATE INDEX idx_questions_order ON questions(survey_id, order_index);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);

-- 回答
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_responses_session_id ON responses(session_id);
CREATE INDEX idx_responses_completed_at ON responses(completed_at);
CREATE INDEX idx_answers_response_id ON answers(response_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- ファイルアップロード
CREATE INDEX idx_file_uploads_answer_id ON file_uploads(answer_id);
CREATE INDEX idx_file_uploads_survey_id ON file_uploads(survey_id);
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);

-- 監査ログ
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- パフォーマンス
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_page_name ON performance_metrics(page_name);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);

-- リアルタイム
CREATE INDEX idx_realtime_sessions_user_id ON realtime_sessions(user_id);
CREATE INDEX idx_realtime_sessions_survey_id ON realtime_sessions(survey_id);
CREATE INDEX idx_realtime_sessions_token ON realtime_sessions(session_token);

-- 通知
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- 分析
CREATE INDEX idx_analytics_events_survey_id ON analytics_events(survey_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);

-- ===============================
-- トリガー関数とトリガー
-- ===============================

-- 更新日時の自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- プロファイルトリガー
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- チームトリガー
CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- アンケートトリガー
CREATE TRIGGER update_surveys_updated_at 
    BEFORE UPDATE ON surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 質問トリガー
CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 回答トリガー
CREATE TRIGGER update_answers_updated_at 
    BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================
-- 便利な関数
-- ===============================

-- プレビュートークン生成関数
CREATE OR REPLACE FUNCTION generate_preview_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- チーム招待トークン生成関数
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- アンケート統計更新関数
CREATE OR REPLACE FUNCTION update_survey_stats(survey_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE surveys SET
        response_count = (
            SELECT COUNT(*) FROM responses 
            WHERE survey_id = survey_uuid AND is_test_response = false
        ),
        completion_rate = (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0 
                ELSE (COUNT(CASE WHEN is_complete THEN 1 END) * 100.0 / COUNT(*))
            END
            FROM responses 
            WHERE survey_id = survey_uuid AND is_test_response = false
        ),
        avg_completion_time = (
            SELECT AVG(time_spent)
            FROM responses 
            WHERE survey_id = survey_uuid 
                AND is_test_response = false 
                AND is_complete = true
                AND time_spent IS NOT NULL
        )
    WHERE id = survey_uuid;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- ビュー作成
-- ===============================

-- チームメンバー詳細ビュー
CREATE VIEW team_members_detailed AS
SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role_id,
    tm.status,
    tm.joined_at,
    p.email,
    p.full_name,
    p.avatar_url,
    r.name as role_name,
    r.permissions,
    t.name as team_name
FROM team_members tm
JOIN profiles p ON tm.user_id = p.id
JOIN roles r ON tm.role_id = r.id
JOIN teams t ON tm.team_id = t.id;

-- アンケート統計ビュー
CREATE VIEW survey_stats_detailed AS
SELECT 
    s.id,
    s.title,
    s.status,
    s.created_at,
    s.published_at,
    s.response_count,
    s.completion_rate,
    s.avg_completion_time,
    COUNT(DISTINCT q.id) as question_count,
    p.full_name as creator_name,
    t.name as team_name
FROM surveys s
LEFT JOIN questions q ON s.id = q.survey_id
LEFT JOIN profiles p ON s.user_id = p.id
LEFT JOIN teams t ON s.team_id = t.id
GROUP BY s.id, s.title, s.status, s.created_at, s.published_at, 
         s.response_count, s.completion_rate, s.avg_completion_time,
         p.full_name, t.name;