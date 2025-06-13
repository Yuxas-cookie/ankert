-- デバッグ用: トリガー関数を詳細なエラーログ付きに更新
-- Created: 2025-06-12

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- デバッグ用のトリガー関数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- デバッグ: 入力値をログ
    RAISE NOTICE 'New user signup - ID: %, Email: %', NEW.id, NEW.email;
    
    -- プロファイル作成を試行
    BEGIN
        INSERT INTO profiles (id, email, full_name, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Profile created successfully for user %', NEW.id;
    EXCEPTION
        WHEN unique_violation THEN
            -- プロファイルが既に存在する場合はスキップ
            RAISE NOTICE 'Profile already exists for user %, skipping', NEW.id;
        WHEN OTHERS THEN
            -- その他のエラー
            RAISE NOTICE 'Error creating profile: % - %', SQLERRM, SQLSTATE;
            -- エラーを再発生させる
            RAISE;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを再作成
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- profiles テーブルの制約を確認
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_namespace nsp ON nsp.oid = con.connamespace
JOIN pg_class cls ON cls.oid = con.conrelid
WHERE nsp.nspname = 'public' 
    AND cls.relname = 'profiles';

-- カラムの確認
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position;