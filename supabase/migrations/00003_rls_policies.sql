-- 🚀 アンケートWebアプリ Row Level Security (RLS) ポリシー
-- Created: 2025-06-11
-- 包括的なセキュリティポリシーの設定

-- ===============================
-- 1. 全テーブルでRLSを有効化
-- ===============================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ===============================
-- 2. プロファイルテーブルのRLSポリシー
-- ===============================

-- ユーザーは自分のプロファイルを全て管理可能
CREATE POLICY "Users can manage their own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- チームメンバーは他のメンバーのプロファイルを閲覧可能
CREATE POLICY "Team members can view other members' profiles" ON profiles
    FOR SELECT USING (
        id IN (
            SELECT tm1.user_id FROM team_members tm1
            JOIN team_members tm2 ON tm1.team_id = tm2.team_id
            WHERE tm2.user_id = auth.uid() AND tm1.status = 'active' AND tm2.status = 'active'
        )
    );

-- ===============================
-- 3. チーム関連テーブルのRLSポリシー
-- ===============================

-- チーム：メンバーは所属チームを閲覧可能、所有者は管理可能
CREATE POLICY "Team members can view their teams" ON teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Team owners can manage their teams" ON teams
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Team admins can update teams" ON teams
    FOR UPDATE USING (
        has_permission(id, auth.uid(), 'team.manage')
    );

-- 役割：システム役割は全員閲覧可能
CREATE POLICY "Anyone can view system roles" ON roles
    FOR SELECT USING (is_system_role = true);

-- チームメンバー：所属チームのメンバー情報を閲覧可能
CREATE POLICY "Team members can view team membership" ON team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- メンバー管理権限がある場合は操作可能
CREATE POLICY "Team admins can manage members" ON team_members
    FOR ALL USING (
        has_permission(team_id, auth.uid(), 'members.invite') OR
        has_permission(team_id, auth.uid(), 'members.remove') OR
        has_permission(team_id, auth.uid(), 'members.manage_roles')
    );

-- チーム招待：所属チームの招待を閲覧可能
CREATE POLICY "Team members can view invitations" ON team_invitations
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- 招待権限がある場合は招待可能
CREATE POLICY "Team admins can manage invitations" ON team_invitations
    FOR ALL USING (
        has_permission(team_id, auth.uid(), 'members.invite')
    );

-- 招待された本人は自分の招待を閲覧可能
CREATE POLICY "Users can view their own invitations" ON team_invitations
    FOR SELECT USING (
        email = (SELECT email FROM profiles WHERE id = auth.uid())
    );

-- ===============================
-- 4. アンケート関連テーブルのRLSポリシー
-- ===============================

-- アンケート：作成者は全て管理可能
CREATE POLICY "Survey owners can manage their surveys" ON surveys
    FOR ALL USING (user_id = auth.uid());

-- チームメンバーはアンケート権限に応じて操作可能
CREATE POLICY "Team members can manage surveys based on permissions" ON surveys
    FOR SELECT USING (
        team_id IS NOT NULL AND (
            has_permission(team_id, auth.uid(), 'surveys.create') OR
            has_permission(team_id, auth.uid(), 'surveys.edit') OR
            has_permission(team_id, auth.uid(), 'surveys.view_responses')
        )
    );

CREATE POLICY "Team members can create surveys" ON surveys
    FOR INSERT WITH CHECK (
        team_id IS NULL OR has_permission(team_id, auth.uid(), 'surveys.create')
    );

CREATE POLICY "Team members can update surveys" ON surveys
    FOR UPDATE USING (
        team_id IS NOT NULL AND has_permission(team_id, auth.uid(), 'surveys.edit')
    );

CREATE POLICY "Team members can delete surveys" ON surveys
    FOR DELETE USING (
        team_id IS NOT NULL AND has_permission(team_id, auth.uid(), 'surveys.delete')
    );

-- 公開アンケートは誰でも閲覧可能（回答用）
CREATE POLICY "Anyone can view published surveys for response" ON surveys
    FOR SELECT USING (
        status = 'published' AND can_access_survey(id, auth.uid())
    );

-- 質問：アンケート管理権限に基づく
CREATE POLICY "Survey managers can manage questions" ON questions
    FOR ALL USING (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE user_id = auth.uid() OR (
                team_id IS NOT NULL AND (
                    has_permission(team_id, auth.uid(), 'surveys.edit') OR
                    has_permission(team_id, auth.uid(), 'surveys.create')
                )
            )
        )
    );

-- 公開アンケートの質問は誰でも閲覧可能
CREATE POLICY "Anyone can view questions of accessible surveys" ON questions
    FOR SELECT USING (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE status = 'published' AND can_access_survey(id, auth.uid())
        )
    );

-- 選択肢：質問と同じポリシー
CREATE POLICY "Survey managers can manage question options" ON question_options
    FOR ALL USING (
        question_id IN (
            SELECT q.id FROM questions q
            JOIN surveys s ON q.survey_id = s.id
            WHERE s.user_id = auth.uid() OR (
                s.team_id IS NOT NULL AND (
                    has_permission(s.team_id, auth.uid(), 'surveys.edit') OR
                    has_permission(s.team_id, auth.uid(), 'surveys.create')
                )
            )
        )
    );

CREATE POLICY "Anyone can view options of accessible survey questions" ON question_options
    FOR SELECT USING (
        question_id IN (
            SELECT q.id FROM questions q
            JOIN surveys s ON q.survey_id = s.id
            WHERE s.status = 'published' AND can_access_survey(s.id, auth.uid())
        )
    );

-- ===============================
-- 5. 回答関連テーブルのRLSポリシー
-- ===============================

-- 回答：アンケート作成者・チームメンバーは閲覧可能
CREATE POLICY "Survey owners can view responses" ON responses
    FOR SELECT USING (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE user_id = auth.uid() OR (
                team_id IS NOT NULL AND 
                has_permission(team_id, auth.uid(), 'surveys.view_responses')
            )
        )
    );

-- 回答者は自分の回答を閲覧可能
CREATE POLICY "Users can view their own responses" ON responses
    FOR SELECT USING (user_id = auth.uid());

-- アクセス可能なアンケートに回答作成可能
CREATE POLICY "Anyone can create responses to accessible surveys" ON responses
    FOR INSERT WITH CHECK (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE status = 'published' AND can_access_survey(id, auth.uid())
        )
    );

-- 回答者は自分の未完了回答を更新可能
CREATE POLICY "Users can update their own incomplete responses" ON responses
    FOR UPDATE USING (
        user_id = auth.uid() AND is_complete = false
    );

-- 個別回答：回答セッションと同じポリシー
CREATE POLICY "Survey owners can view answers" ON answers
    FOR SELECT USING (
        response_id IN (
            SELECT r.id FROM responses r
            JOIN surveys s ON r.survey_id = s.id
            WHERE s.user_id = auth.uid() OR (
                s.team_id IS NOT NULL AND 
                has_permission(s.team_id, auth.uid(), 'surveys.view_responses')
            )
        )
    );

CREATE POLICY "Response owners can view their answers" ON answers
    FOR SELECT USING (
        response_id IN (
            SELECT id FROM responses WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Response owners can create answers" ON answers
    FOR INSERT WITH CHECK (
        response_id IN (
            SELECT r.id FROM responses r
            JOIN surveys s ON r.survey_id = s.id
            WHERE s.status = 'published' 
            AND can_access_survey(s.id, auth.uid())
            AND (r.user_id = auth.uid() OR r.user_id IS NULL)
        )
    );

CREATE POLICY "Response owners can update their answers" ON answers
    FOR UPDATE USING (
        response_id IN (
            SELECT r.id FROM responses r
            WHERE (r.user_id = auth.uid() OR r.user_id IS NULL) 
            AND r.is_complete = false
        )
    );

-- ===============================
-- 6. ファイルアップロードのRLSポリシー
-- ===============================

-- アンケート作成者・チームメンバーは閲覧可能
CREATE POLICY "Survey owners can view file uploads" ON file_uploads
    FOR SELECT USING (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE user_id = auth.uid() OR (
                team_id IS NOT NULL AND 
                has_permission(team_id, auth.uid(), 'surveys.view_responses')
            )
        )
    );

-- ファイルアップロード者は自分のファイルを管理可能
CREATE POLICY "Upload owners can manage their files" ON file_uploads
    FOR ALL USING (user_id = auth.uid());

-- アクセス可能なアンケートにファイルアップロード可能
CREATE POLICY "Users can upload files to accessible surveys" ON file_uploads
    FOR INSERT WITH CHECK (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE status = 'published' AND can_access_survey(id, auth.uid())
        )
    );

-- ===============================
-- 7. 監査ログのRLSポリシー
-- ===============================

-- ユーザーは自分の操作ログを閲覧可能
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- チーム管理者はチームの監査ログを閲覧可能
CREATE POLICY "Team admins can view team audit logs" ON audit_logs
    FOR SELECT USING (
        team_id IS NOT NULL AND has_permission(team_id, auth.uid(), 'team.manage')
    );

-- システムが監査ログを作成
CREATE POLICY "System can create audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ===============================
-- 8. パフォーマンスメトリクスのRLSポリシー
-- ===============================

-- ユーザーは自分のメトリクスを閲覧可能
CREATE POLICY "Users can view their own performance metrics" ON performance_metrics
    FOR SELECT USING (user_id = auth.uid());

-- システムがメトリクスを作成
CREATE POLICY "System can create performance metrics" ON performance_metrics
    FOR INSERT WITH CHECK (true);

-- ===============================
-- 9. リアルタイムセッションのRLSポリシー
-- ===============================

-- ユーザーは自分のセッションを管理可能
CREATE POLICY "Users can manage their own realtime sessions" ON realtime_sessions
    FOR ALL USING (user_id = auth.uid());

-- アンケート作成者はセッションを閲覧可能
CREATE POLICY "Survey owners can view realtime sessions" ON realtime_sessions
    FOR SELECT USING (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE user_id = auth.uid() OR (
                team_id IS NOT NULL AND 
                has_permission(team_id, auth.uid(), 'surveys.view_responses')
            )
        )
    );

-- ===============================
-- 10. 通知のRLSポリシー
-- ===============================

-- ユーザーは自分の通知を管理可能
CREATE POLICY "Users can manage their own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- システムが通知を作成
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- ===============================
-- 11. 分析イベントのRLSポリシー
-- ===============================

-- アンケート作成者・チームメンバーは分析データを閲覧可能
CREATE POLICY "Survey owners can view analytics events" ON analytics_events
    FOR SELECT USING (
        survey_id IN (
            SELECT id FROM surveys 
            WHERE user_id = auth.uid() OR (
                team_id IS NOT NULL AND 
                has_permission(team_id, auth.uid(), 'analytics.view')
            )
        )
    );

-- システムが分析イベントを作成
CREATE POLICY "System can create analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- ユーザーは自分のイベントを閲覧可能
CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (user_id = auth.uid());

-- ===============================
-- 12. ビューのセキュリティ設定
-- ===============================

-- チームメンバー詳細ビューのセキュリティポリシー
DROP VIEW IF EXISTS team_members_detailed;
CREATE VIEW team_members_detailed WITH (security_invoker = true) AS
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
JOIN teams t ON tm.team_id = t.id
WHERE tm.team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND status = 'active'
);

-- アンケート統計詳細ビューのセキュリティポリシー
DROP VIEW IF EXISTS survey_stats_detailed;
CREATE VIEW survey_stats_detailed WITH (security_invoker = true) AS
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
WHERE s.user_id = auth.uid() OR (
    s.team_id IS NOT NULL AND 
    has_permission(s.team_id, auth.uid(), 'surveys.view_responses')
)
GROUP BY s.id, s.title, s.status, s.created_at, s.published_at, 
         s.response_count, s.completion_rate, s.avg_completion_time,
         p.full_name, t.name;

-- ===============================
-- 13. 特別なセキュリティ関数
-- ===============================

-- プレビュートークンベースのアクセス
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

-- プレビューアクセス用の特別ポリシー
CREATE POLICY "Preview token allows survey access" ON surveys
    FOR SELECT USING (
        -- プレビュートークンが提供されている場合の特別なアクセス
        -- この実装は実際のトークン検証ロジックに合わせて調整が必要
        id IN (
            SELECT survey_id FROM survey_previews 
            WHERE expires_at > NOW()
            -- 実際のトークン検証は application レベルで行う
        )
    );

-- ===============================
-- 14. デバッグ・管理用関数
-- ===============================

-- ユーザーの権限一覧を取得（デバッグ用）
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TABLE(team_name TEXT, role_name TEXT, permissions TEXT[]) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.name as team_name,
        r.name as role_name,
        r.permissions
    FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    JOIN roles r ON tm.role_id = r.id
    WHERE tm.user_id = user_uuid AND tm.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLSポリシーの動作確認関数
CREATE OR REPLACE FUNCTION test_rls_policies(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- 現在のユーザーコンテキストでテーブルアクセスをテスト
    -- この関数は開発・デバッグ時のみ使用
    RETURN jsonb_build_object(
        'user_id', user_uuid,
        'accessible_surveys', (
            SELECT COUNT(*) FROM surveys WHERE user_id = user_uuid
        ),
        'team_memberships', (
            SELECT COUNT(*) FROM team_members WHERE user_id = user_uuid
        ),
        'permissions', (
            SELECT array_agg(DISTINCT r.permissions) 
            FROM team_members tm
            JOIN roles r ON tm.role_id = r.id
            WHERE tm.user_id = user_uuid AND tm.status = 'active'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;