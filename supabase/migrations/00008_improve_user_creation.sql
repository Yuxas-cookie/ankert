-- Improve user creation process and error handling
-- Created: 2025-06-12

-- ===============================
-- 1. ユーザー作成トリガーの最終改良版
-- ===============================

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 改良されたユーザー作成ハンドラー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- ユーザー名を決定（メタデータから取得、なければメールのローカル部分）
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    -- プロファイル作成を試行
    INSERT INTO profiles (
        id, 
        email, 
        full_name, 
        created_at, 
        updated_at,
        last_sign_in_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        user_name,
        NOW(),
        NOW(),
        NEW.created_at
    );
    
    -- 成功ログ
    RAISE NOTICE 'Profile created successfully for user % (%)', NEW.id, NEW.email;
    
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        -- プロファイルが既に存在する場合
        RAISE NOTICE 'Profile already exists for user % (%), updating email if needed', NEW.id, NEW.email;
        
        -- メールアドレスが変更されている場合は更新
        UPDATE profiles 
        SET 
            email = NEW.email,
            updated_at = NOW(),
            last_sign_in_at = NEW.created_at
        WHERE id = NEW.id;
        
        RETURN NEW;
        
    WHEN foreign_key_violation THEN
        -- auth.usersへの参照エラー
        RAISE NOTICE 'Foreign key violation for user %: %', NEW.id, SQLERRM;
        RAISE EXCEPTION 'Failed to create profile: invalid user reference';
        
    WHEN check_violation THEN
        -- CHECK制約違反
        RAISE NOTICE 'Check constraint violation for user %: %', NEW.id, SQLERRM;
        RAISE EXCEPTION 'Failed to create profile: invalid data format';
        
    WHEN not_null_violation THEN
        -- NOT NULL制約違反
        RAISE NOTICE 'NOT NULL violation for user %: %', NEW.id, SQLERRM;
        RAISE EXCEPTION 'Failed to create profile: missing required data';
        
    WHEN OTHERS THEN
        -- その他のエラー
        RAISE NOTICE 'Unexpected error creating profile for user %: % [%]', NEW.id, SQLERRM, SQLSTATE;
        RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを再作成
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===============================
-- 2. プロファイル更新用の補助関数
-- ===============================

-- ユーザーサインイン時の最終ログイン時刻更新
CREATE OR REPLACE FUNCTION update_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
    -- last_sign_in_atが更新された場合にprofilesテーブルも更新
    IF OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
        UPDATE profiles 
        SET 
            last_sign_in_at = NEW.last_sign_in_at,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- サインイン時刻更新のトリガー
CREATE TRIGGER on_auth_user_sign_in
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_last_sign_in();

-- ===============================
-- 3. データベース整合性チェック関数
-- ===============================

-- 孤立したプロファイルをチェック
CREATE OR REPLACE FUNCTION check_orphaned_profiles()
RETURNS TABLE(profile_id UUID, email TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.created_at
    FROM profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    WHERE u.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersに対応するプロファイルがないユーザーをチェック
CREATE OR REPLACE FUNCTION check_missing_profiles()
RETURNS TABLE(user_id UUID, email TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.created_at
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 不整合を修復する関数
CREATE OR REPLACE FUNCTION fix_profile_inconsistencies()
RETURNS JSON AS $$
DECLARE
    missing_count INTEGER := 0;
    orphaned_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- 不足しているプロファイルを作成
    FOR user_record IN 
        SELECT u.id, u.email, u.created_at, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN profiles p ON u.id = p.id
        WHERE p.id IS NULL
    LOOP
        INSERT INTO profiles (id, email, full_name, created_at, updated_at)
        VALUES (
            user_record.id,
            user_record.email,
            COALESCE(
                user_record.raw_user_meta_data->>'full_name',
                user_record.raw_user_meta_data->>'name',
                split_part(user_record.email, '@', 1)
            ),
            user_record.created_at,
            NOW()
        );
        missing_count := missing_count + 1;
    END LOOP;
    
    -- 孤立したプロファイルを削除
    DELETE FROM profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = p.id
    );
    GET DIAGNOSTICS orphaned_count = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'created_profiles', missing_count,
        'deleted_orphaned_profiles', orphaned_count,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 4. プロファイル管理のヘルパー関数
-- ===============================

-- プロファイル完全削除（GDPR対応）
CREATE OR REPLACE FUNCTION delete_user_data(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_surveys INTEGER := 0;
    deleted_responses INTEGER := 0;
BEGIN
    -- ユーザーが作成したアンケートを削除
    DELETE FROM surveys WHERE user_id = user_uuid;
    GET DIAGNOSTICS deleted_surveys = ROW_COUNT;
    
    -- ユーザーの回答を匿名化
    UPDATE responses 
    SET user_id = NULL, session_id = 'deleted_user_' || user_uuid
    WHERE user_id = user_uuid;
    GET DIAGNOSTICS deleted_responses = ROW_COUNT;
    
    -- チームメンバーシップを削除
    DELETE FROM team_members WHERE user_id = user_uuid;
    
    -- 通知を削除
    DELETE FROM notifications WHERE user_id = user_uuid;
    
    -- プロファイルを削除（auth.usersは自動でカスケード削除される）
    DELETE FROM profiles WHERE id = user_uuid;
    
    RAISE NOTICE 'User % data deleted: % surveys, % responses anonymized', 
        user_uuid, deleted_surveys, deleted_responses;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;