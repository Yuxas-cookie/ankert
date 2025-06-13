-- 🚀 Supabase Storage設定
-- Created: 2025-06-11
-- ファイルアップロード機能のためのストレージ設定

-- ===============================
-- 1. ストレージバケットの作成
-- ===============================

-- アンケート用ファイルアップロードバケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'survey-uploads',
  'survey-uploads', 
  false, -- 非公開
  10485760, -- 10MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'text/plain', 'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- プロファイル用アバターバケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- 公開
  2097152, -- 2MB  
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- チームロゴ用バケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-logos',
  'team-logos',
  true, -- 公開
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- アンケートブランディング用バケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'survey-branding',
  'survey-branding',
  true, -- 公開
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ===============================
-- 2. ストレージポリシー設定
-- ===============================

-- アンケートファイルアップロード用ポリシー
CREATE POLICY "Users can upload files to accessible surveys" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'survey-uploads' AND
    -- ファイルパスにユーザーIDが含まれている
    (auth.uid()::text = (storage.foldername(name))[1] OR
     -- または、アンケートに回答権限がある
     (storage.foldername(name))[2] IN (
       SELECT s.id::text FROM surveys s
       WHERE can_access_survey(s.id::uuid, auth.uid())
     ))
  );

CREATE POLICY "Users can view files they uploaded or have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'survey-uploads' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     -- アンケート作成者・チームメンバーは閲覧可能
     (storage.foldername(name))[2] IN (
       SELECT s.id::text FROM surveys s
       WHERE s.user_id = auth.uid() OR
       (s.team_id IS NOT NULL AND 
        has_permission(s.team_id, auth.uid(), 'surveys.view_responses'))
     ))
  );

CREATE POLICY "File uploaders can delete their files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'survey-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- アバター用ポリシー
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- チームロゴ用ポリシー
CREATE POLICY "Team logos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'team-logos');

CREATE POLICY "Team owners can upload team logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'team-logos' AND
    (storage.foldername(name))[1] IN (
      SELECT t.id::text FROM teams t
      WHERE t.owner_id = auth.uid() OR
      has_permission(t.id, auth.uid(), 'team.manage')
    )
  );

CREATE POLICY "Team owners can update team logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'team-logos' AND
    (storage.foldername(name))[1] IN (
      SELECT t.id::text FROM teams t
      WHERE t.owner_id = auth.uid() OR
      has_permission(t.id, auth.uid(), 'team.manage')
    )
  );

CREATE POLICY "Team owners can delete team logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'team-logos' AND
    (storage.foldername(name))[1] IN (
      SELECT t.id::text FROM teams t
      WHERE t.owner_id = auth.uid() OR
      has_permission(t.id, auth.uid(), 'team.manage')
    )
  );

-- アンケートブランディング用ポリシー
CREATE POLICY "Survey branding images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'survey-branding');

CREATE POLICY "Survey owners can upload branding images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'survey-branding' AND
    (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM surveys s
      WHERE s.user_id = auth.uid() OR
      (s.team_id IS NOT NULL AND 
       has_permission(s.team_id, auth.uid(), 'surveys.edit'))
    )
  );

CREATE POLICY "Survey owners can update branding images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'survey-branding' AND
    (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM surveys s
      WHERE s.user_id = auth.uid() OR
      (s.team_id IS NOT NULL AND 
       has_permission(s.team_id, auth.uid(), 'surveys.edit'))
    )
  );

CREATE POLICY "Survey owners can delete branding images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'survey-branding' AND
    (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM surveys s
      WHERE s.user_id = auth.uid() OR
      (s.team_id IS NOT NULL AND 
       has_permission(s.team_id, auth.uid(), 'surveys.edit'))
    )
  );

-- ===============================
-- 3. ストレージヘルパー関数
-- ===============================

-- ファイルアップロード記録関数
CREATE OR REPLACE FUNCTION record_file_upload(
  file_path TEXT,
  original_name TEXT,
  file_size_bytes INTEGER,
  mime_type_str TEXT,
  survey_uuid UUID DEFAULT NULL,
  answer_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  upload_id UUID;
BEGIN
  INSERT INTO file_uploads (
    id,
    filename,
    original_filename,
    file_size,
    mime_type,
    file_path,
    user_id,
    survey_id,
    answer_id,
    upload_status
  )
  VALUES (
    uuid_generate_v4(),
    split_part(file_path, '/', -1), -- ファイル名を抽出
    original_name,
    file_size_bytes,
    mime_type_str,
    file_path,
    auth.uid(),
    survey_uuid,
    answer_uuid,
    'completed'
  )
  RETURNING id INTO upload_id;
  
  RETURN upload_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ファイル削除時のクリーンアップ関数
CREATE OR REPLACE FUNCTION cleanup_file_upload(file_path_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- file_uploadsテーブルからレコードを削除
  DELETE FROM file_uploads 
  WHERE file_path = file_path_param 
  AND (user_id = auth.uid() OR 
       survey_id IN (
         SELECT id FROM surveys 
         WHERE user_id = auth.uid() OR
         (team_id IS NOT NULL AND 
          has_permission(team_id, auth.uid(), 'surveys.edit'))
       ));
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 4. ストレージ管理関数
-- ===============================

-- 期限切れファイルのクリーンアップ
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- 期限切れのファイルアップロードレコードを検索
  FOR file_record IN 
    SELECT file_path FROM file_uploads 
    WHERE expires_at IS NOT NULL AND expires_at < NOW()
  LOOP
    -- ストレージからファイルを削除（この部分は実際にはSupabase Storage APIを使用）
    -- DELETE FROM storage.objects WHERE name = file_record.file_path;
    
    -- file_uploadsテーブルからレコードを削除
    DELETE FROM file_uploads WHERE file_path = file_record.file_path;
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 孤立ファイルのクリーンアップ
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- answer_idが設定されているが、対応するanswerが存在しないファイル
  DELETE FROM file_uploads 
  WHERE answer_id IS NOT NULL 
  AND answer_id NOT IN (SELECT id FROM answers);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- survey_idが設定されているが、対応するsurveyが存在しないファイル
  DELETE FROM file_uploads 
  WHERE survey_id IS NOT NULL 
  AND survey_id NOT IN (SELECT id FROM surveys);
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;