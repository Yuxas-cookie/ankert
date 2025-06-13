-- Add survey_collaborators table for team collaboration
-- Created: 2025-06-12

-- ===============================
-- 1. survey_collaboratorsテーブルの作成
-- ===============================

CREATE TABLE IF NOT EXISTS survey_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'respondent')),
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(survey_id, user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_survey_collaborators_survey_id ON survey_collaborators(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_collaborators_user_id ON survey_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_collaborators_role ON survey_collaborators(role);

-- ===============================
-- 2. RLS ポリシーの追加
-- ===============================

ALTER TABLE survey_collaborators ENABLE ROW LEVEL SECURITY;

-- アンケート所有者と管理者がコラボレーターを管理可能
CREATE POLICY "Survey owners and admins can manage collaborators" ON survey_collaborators
    FOR ALL USING (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM survey_collaborators sc
            WHERE sc.survey_id = survey_collaborators.survey_id
            AND sc.user_id = auth.uid()
            AND sc.role IN ('owner', 'admin')
        )
    );

-- ユーザーは自分が参加しているコラボレーションを確認可能
CREATE POLICY "Users can view their own collaborations" ON survey_collaborators
    FOR SELECT USING (user_id = auth.uid());

-- ===============================
-- 3. profilesテーブルにdefault_role列を追加
-- ===============================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS default_role TEXT DEFAULT 'viewer' 
CHECK (default_role IN ('owner', 'admin', 'editor', 'viewer', 'respondent'));

-- ===============================
-- 4. 監査ログテーブルの作成（存在しない場合）
-- ===============================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- RLSポリシー
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 管理者のみがアクセス可能
CREATE POLICY "Only admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND default_role IN ('owner', 'admin')
        )
    );

-- ===============================
-- 5. 既存のアンケート所有者をコラボレーターテーブルに追加
-- ===============================

INSERT INTO survey_collaborators (survey_id, user_id, role)
SELECT id, user_id, 'owner' 
FROM surveys
WHERE NOT EXISTS (
    SELECT 1 FROM survey_collaborators sc
    WHERE sc.survey_id = surveys.id
    AND sc.user_id = surveys.user_id
)
ON CONFLICT (survey_id, user_id) DO NOTHING;

-- ===============================
-- 6. ヘルパー関数の作成
-- ===============================

-- ユーザーがアンケートに対して特定の役割を持っているかチェック
CREATE OR REPLACE FUNCTION user_has_survey_role(
    p_survey_id UUID,
    p_user_id UUID,
    p_role TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM survey_collaborators
        WHERE survey_id = p_survey_id
        AND user_id = p_user_id
        AND role = p_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザーのアンケートに対する役割を取得
CREATE OR REPLACE FUNCTION get_user_survey_role(
    p_survey_id UUID,
    p_user_id UUID
) RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM survey_collaborators
    WHERE survey_id = p_survey_id
    AND user_id = p_user_id;
    
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 7. 更新日時の自動更新トリガー
-- ===============================

CREATE OR REPLACE FUNCTION update_survey_collaborators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_survey_collaborators_updated_at
    BEFORE UPDATE ON survey_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION update_survey_collaborators_updated_at();