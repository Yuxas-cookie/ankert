-- Fix missing survey_previews table and related issues
-- Created: 2025-06-12

-- ===============================
-- 1. 不足しているsurvey_previewsテーブルの作成
-- ===============================

CREATE TABLE IF NOT EXISTS survey_previews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_survey_previews_survey_id ON survey_previews(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_previews_token ON survey_previews(token);
CREATE INDEX IF NOT EXISTS idx_survey_previews_expires_at ON survey_previews(expires_at);

-- ===============================
-- 2. RLS ポリシーの追加
-- ===============================

ALTER TABLE survey_previews ENABLE ROW LEVEL SECURITY;

-- プレビュー作成者とアンケート所有者がアクセス可能
CREATE POLICY "Survey owners can manage previews" ON survey_previews
    FOR ALL USING (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE user_id = auth.uid() OR (
                team_id IS NOT NULL AND (
                    has_permission(team_id, auth.uid(), 'surveys.edit') OR
                    has_permission(team_id, auth.uid(), 'surveys.view_responses')
                )
            )
        )
    );

-- システムがプレビューアクセスを確認可能
CREATE POLICY "System can verify preview tokens" ON survey_previews
    FOR SELECT USING (true);

-- ===============================
-- 3. プレビュー管理関数の修正
-- ===============================

-- プレビュートークン生成関数の改良
CREATE OR REPLACE FUNCTION generate_survey_preview_token(survey_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    new_token TEXT;
BEGIN
    -- 32バイトのランダムトークンを生成
    new_token := encode(gen_random_bytes(32), 'base64url');
    
    -- プレビューレコードを作成
    INSERT INTO survey_previews (survey_id, token, created_by)
    VALUES (survey_uuid, new_token, auth.uid());
    
    RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- プレビュートークン検証関数の修正
CREATE OR REPLACE FUNCTION can_access_survey_preview(survey_uuid UUID, token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM surveys s
        LEFT JOIN survey_previews sp ON s.id = sp.survey_id
        WHERE s.id = survey_uuid 
        AND (
            s.preview_token = token OR 
            (sp.token = token AND sp.expires_at > NOW())
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- プレビュー使用記録関数
CREATE OR REPLACE FUNCTION record_preview_usage(token_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE survey_previews 
    SET 
        used_at = NOW(),
        usage_count = usage_count + 1
    WHERE token = token_param 
    AND expires_at > NOW();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 4. 期限切れプレビュートークンのクリーンアップ
-- ===============================

CREATE OR REPLACE FUNCTION cleanup_expired_preview_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM survey_previews 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 5. アンケート削除時のクリーンアップトリガー
-- ===============================

CREATE OR REPLACE FUNCTION cleanup_survey_data()
RETURNS TRIGGER AS $$
BEGIN
    -- プレビュートークンを削除
    DELETE FROM survey_previews WHERE survey_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成
CREATE TRIGGER survey_cleanup_trigger
    BEFORE DELETE ON surveys
    FOR EACH ROW EXECUTE FUNCTION cleanup_survey_data();