-- 🚀 アンケートWebアプリ 初期データ投入
-- Created: 2025-06-11
-- 基本的な役割、権限、設定データを投入

-- ===============================
-- 1. システム役割の作成
-- ===============================

-- 基本役割の定義
INSERT INTO roles (id, name, description, permissions, is_system_role) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'owner', 
    'チーム所有者 - 全ての権限を持つ',
    ARRAY[
        'team.manage', 'team.delete', 'team.settings',
        'members.invite', 'members.remove', 'members.manage_roles',
        'surveys.create', 'surveys.edit', 'surveys.delete', 'surveys.publish',
        'surveys.share', 'surveys.export', 'surveys.view_responses',
        'analytics.view', 'analytics.export'
    ],
    true
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'admin',
    '管理者 - 大部分の管理権限を持つ',
    ARRAY[
        'members.invite', 'members.manage_roles',
        'surveys.create', 'surveys.edit', 'surveys.delete', 'surveys.publish',
        'surveys.share', 'surveys.export', 'surveys.view_responses',
        'analytics.view', 'analytics.export'
    ],
    true
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'editor',
    '編集者 - アンケート作成・編集権限',
    ARRAY[
        'surveys.create', 'surveys.edit', 'surveys.publish',
        'surveys.share', 'surveys.view_responses',
        'analytics.view'
    ],
    true
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'viewer',
    '閲覧者 - アンケート閲覧権限のみ',
    ARRAY[
        'surveys.view_responses',
        'analytics.view'
    ],
    true
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'respondent',
    '回答者 - アンケート回答権限のみ',
    ARRAY[
        'surveys.respond'
    ],
    true
);

-- ===============================
-- 2. プロファイル作成トリガー
-- ===============================

-- 新規ユーザー登録時に自動でプロファイルを作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===============================
-- 3. チーム作成時の自動処理
-- ===============================

-- チーム作成時に所有者を自動でメンバーに追加
CREATE OR REPLACE FUNCTION handle_new_team()
RETURNS TRIGGER AS $$
BEGIN
    -- チーム所有者を自動でownerロールでメンバーに追加
    INSERT INTO team_members (team_id, user_id, role_id, status)
    VALUES (
        NEW.id,
        NEW.owner_id,
        '550e8400-e29b-41d4-a716-446655440000', -- owner role
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成
CREATE TRIGGER on_team_created
    AFTER INSERT ON teams
    FOR EACH ROW EXECUTE FUNCTION handle_new_team();

-- ===============================
-- 4. アンケート統計更新トリガー
-- ===============================

-- 回答完了時にアンケート統計を更新
CREATE OR REPLACE FUNCTION handle_response_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- 完了状態が変更された場合
    IF OLD.is_complete != NEW.is_complete AND NEW.is_complete = true THEN
        PERFORM update_survey_stats(NEW.survey_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成
CREATE TRIGGER on_response_completed
    AFTER UPDATE ON responses
    FOR EACH ROW EXECUTE FUNCTION handle_response_completion();

-- 新規回答作成時にも統計更新
CREATE OR REPLACE FUNCTION handle_new_response()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_survey_stats(NEW.survey_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成
CREATE TRIGGER on_response_created
    AFTER INSERT ON responses
    FOR EACH ROW EXECUTE FUNCTION handle_new_response();

-- ===============================
-- 5. 監査ログ自動記録
-- ===============================

-- アンケート操作の監査ログ記録
CREATE OR REPLACE FUNCTION log_survey_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
        VALUES (NEW.user_id, 'survey.created', 'survey', NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
        VALUES (NEW.user_id, 'survey.updated', 'survey', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values)
        VALUES (OLD.user_id, 'survey.deleted', 'survey', OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成
CREATE TRIGGER survey_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON surveys
    FOR EACH ROW EXECUTE FUNCTION log_survey_changes();

-- ===============================
-- 6. リアルタイムセッション管理
-- ===============================

-- セッション期限切れ自動削除
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM realtime_sessions 
    WHERE expires_at < NOW() OR last_ping < NOW() - INTERVAL '5 minutes';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 7. 通知管理関数
-- ===============================

-- チーム招待通知作成
CREATE OR REPLACE FUNCTION create_team_invitation_notification(
    team_uuid UUID,
    invited_email TEXT,
    inviter_id UUID
)
RETURNS UUID AS $$
DECLARE
    team_name TEXT;
    inviter_name TEXT;
    notification_id UUID;
BEGIN
    -- チーム名と招待者名を取得
    SELECT name INTO team_name FROM teams WHERE id = team_uuid;
    SELECT full_name INTO inviter_name FROM profiles WHERE id = inviter_id;
    
    -- 招待されたユーザーのIDを取得（既存ユーザーの場合）
    INSERT INTO notifications (id, user_id, team_id, type, title, message, data)
    SELECT 
        uuid_generate_v4(),
        p.id,
        team_uuid,
        'team_invitation',
        'チーム招待',
        inviter_name || 'さんがあなたを' || team_name || 'チームに招待しました。',
        jsonb_build_object(
            'team_id', team_uuid,
            'team_name', team_name,
            'inviter_id', inviter_id,
            'inviter_name', inviter_name
        )
    FROM profiles p
    WHERE p.email = invited_email
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 8. パフォーマンス最適化関数
-- ===============================

-- 古いパフォーマンスメトリクスの削除（30日以上前）
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM performance_metrics 
    WHERE created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 古い監査ログの削除（90日以上前）
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 9. セキュリティ関数
-- ===============================

-- ユーザーがチームメンバーかチェック
CREATE OR REPLACE FUNCTION is_team_member(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM team_members 
        WHERE team_id = team_uuid 
        AND user_id = user_uuid 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザーが特定の権限を持つかチェック
CREATE OR REPLACE FUNCTION has_permission(team_uuid UUID, user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM team_members tm
        JOIN roles r ON tm.role_id = r.id
        WHERE tm.team_id = team_uuid 
        AND tm.user_id = user_uuid 
        AND tm.status = 'active'
        AND permission_name = ANY(r.permissions)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- アンケートアクセス権チェック（拡張版）
CREATE OR REPLACE FUNCTION can_access_survey(survey_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    survey_record RECORD;
    user_email TEXT;
BEGIN
    -- アンケート情報を取得
    SELECT * INTO survey_record FROM surveys WHERE id = survey_uuid;
    
    -- 存在しないアンケート
    IF survey_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 作成者は常にアクセス可能
    IF survey_record.user_id = user_uuid THEN
        RETURN TRUE;
    END IF;
    
    -- チームメンバーでアンケート閲覧権限がある場合
    IF survey_record.team_id IS NOT NULL AND user_uuid IS NOT NULL THEN
        IF has_permission(survey_record.team_id, user_uuid, 'surveys.view_responses') THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    -- 公開されていないアンケートは作成者・チームメンバーのみ
    IF survey_record.status != 'published' THEN
        RETURN FALSE;
    END IF;
    
    -- 期間制限チェック
    IF survey_record.start_date IS NOT NULL AND NOW() < survey_record.start_date THEN
        RETURN FALSE;
    END IF;
    
    IF survey_record.end_date IS NOT NULL AND NOW() > survey_record.end_date THEN
        RETURN FALSE;
    END IF;
    
    -- アクセスタイプ別チェック
    CASE survey_record.access_type
        WHEN 'public' THEN
            RETURN TRUE;
        WHEN 'url_only' THEN
            RETURN TRUE;
        WHEN 'authenticated' THEN
            RETURN user_uuid IS NOT NULL;
        WHEN 'email_restricted' THEN
            IF user_uuid IS NULL THEN
                RETURN FALSE;
            END IF;
            SELECT email INTO user_email FROM profiles WHERE id = user_uuid;
            RETURN user_email = ANY(survey_record.allowed_emails);
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;