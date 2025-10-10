-- Step 1: Add user_id columns to tables
ALTER TABLE public.user_exports ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.ai_learning_history ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.voice_recordings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.generated_images ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.generated_code ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.prompt_templates ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Drop old public policies
DROP POLICY IF EXISTS "Allow public read on user_exports" ON public.user_exports;
DROP POLICY IF EXISTS "Allow public insert on user_exports" ON public.user_exports;

DROP POLICY IF EXISTS "Allow public read on ai_learning_history" ON public.ai_learning_history;
DROP POLICY IF EXISTS "Allow public insert on ai_learning_history" ON public.ai_learning_history;

DROP POLICY IF EXISTS "Allow public read on voice_recordings" ON public.voice_recordings;
DROP POLICY IF EXISTS "Allow public insert on voice_recordings" ON public.voice_recordings;

DROP POLICY IF EXISTS "Allow public read on generated_images" ON public.generated_images;
DROP POLICY IF EXISTS "Allow public insert on generated_images" ON public.generated_images;

DROP POLICY IF EXISTS "Allow public read on generated_code" ON public.generated_code;
DROP POLICY IF EXISTS "Allow public insert on generated_code" ON public.generated_code;
DROP POLICY IF EXISTS "Allow public update on generated_code" ON public.generated_code;

DROP POLICY IF EXISTS "Allow public read on prompt_templates" ON public.prompt_templates;
DROP POLICY IF EXISTS "Allow public insert on prompt_templates" ON public.prompt_templates;
DROP POLICY IF EXISTS "Allow public update on prompt_templates" ON public.prompt_templates;

-- Step 3: Create user-based policies for user_exports
CREATE POLICY "Users can read own exports" 
  ON public.user_exports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports" 
  ON public.user_exports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Step 4: Create user-based policies for ai_learning_history
CREATE POLICY "Users can read own learning history" 
  ON public.ai_learning_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning history" 
  ON public.ai_learning_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Step 5: Create user-based policies for voice_recordings
CREATE POLICY "Users can read own voice recordings" 
  ON public.voice_recordings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice recordings" 
  ON public.voice_recordings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Step 6: Create user-based policies for generated_images
CREATE POLICY "Users can read own generated images" 
  ON public.generated_images FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated images" 
  ON public.generated_images FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Step 7: Create user-based policies for generated_code
CREATE POLICY "Users can read own generated code" 
  ON public.generated_code FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated code" 
  ON public.generated_code FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated code" 
  ON public.generated_code FOR UPDATE 
  USING (auth.uid() = user_id);

-- Step 8: Create policies for prompt_templates (shared read, creator-only edit)
CREATE POLICY "Everyone can read prompt templates" 
  ON public.prompt_templates FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own prompt templates" 
  ON public.prompt_templates FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own prompt templates" 
  ON public.prompt_templates FOR UPDATE 
  USING (auth.uid() = created_by);