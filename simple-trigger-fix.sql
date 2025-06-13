-- シンプルなトリガー修正版
-- 問題を特定するため、最小限の機能で実装

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- シンプルなトリガー関数を作成（必須カラムのみ）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- デバッグログ
    RAISE LOG 'New user trigger called for user: %', NEW.id;
    
    -- 最小限の情報でprofileを作成
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        NOW(),
        NOW()
    );
    
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    RETURN NEW;
    
EXCEPTION 
    WHEN unique_violation THEN
        RAISE LOG 'Profile already exists for user: %', NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- エラーを再発生させず、ユーザー作成は成功させる
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを再作成
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- 確認クエリ
SELECT 'Trigger created successfully' AS status;