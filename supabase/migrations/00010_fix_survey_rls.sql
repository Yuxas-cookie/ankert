-- Fix RLS policies for surveys table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can create surveys" ON surveys;
DROP POLICY IF EXISTS "Users can update their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can delete their own surveys" ON surveys;

-- Create new policies with proper permissions
CREATE POLICY "Users can view their own surveys"
  ON surveys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create surveys"
  ON surveys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys"
  ON surveys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surveys"
  ON surveys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fix RLS policies for questions table
DROP POLICY IF EXISTS "Users can view questions of their surveys" ON questions;
DROP POLICY IF EXISTS "Users can create questions for their surveys" ON questions;
DROP POLICY IF EXISTS "Users can update questions of their surveys" ON questions;
DROP POLICY IF EXISTS "Users can delete questions of their surveys" ON questions;

-- Create new policies for questions
CREATE POLICY "Users can view questions of their surveys"
  ON questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = questions.survey_id
      AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create questions for their surveys"
  ON questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = questions.survey_id
      AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions of their surveys"
  ON questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = questions.survey_id
      AND surveys.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = questions.survey_id
      AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions of their surveys"
  ON questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = questions.survey_id
      AND surveys.user_id = auth.uid()
    )
  );

-- Fix RLS policies for question_options table
DROP POLICY IF EXISTS "Users can view options of their questions" ON question_options;
DROP POLICY IF EXISTS "Users can create options for their questions" ON question_options;
DROP POLICY IF EXISTS "Users can update options of their questions" ON question_options;
DROP POLICY IF EXISTS "Users can delete options of their questions" ON question_options;

-- Create new policies for question_options
CREATE POLICY "Users can view options of their questions"
  ON question_options
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN surveys ON surveys.id = questions.survey_id
      WHERE questions.id = question_options.question_id
      AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create options for their questions"
  ON question_options
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions
      JOIN surveys ON surveys.id = questions.survey_id
      WHERE questions.id = question_options.question_id
      AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update options of their questions"
  ON question_options
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN surveys ON surveys.id = questions.survey_id
      WHERE questions.id = question_options.question_id
      AND surveys.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions
      JOIN surveys ON surveys.id = questions.survey_id
      WHERE questions.id = question_options.question_id
      AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete options of their questions"
  ON question_options
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN surveys ON surveys.id = questions.survey_id
      WHERE questions.id = question_options.question_id
      AND surveys.user_id = auth.uid()
    )
  );