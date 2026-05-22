-- =============================================================================
-- Migration 002: Full Database Schema + RLS for Gymbro
-- Run with: supabase db push (or via Supabase SQL Editor)
-- =============================================================================

-- =============================================================================
-- 1. EXTEND EXISTING profiles TABLE
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sexo TEXT,
  ADD COLUMN IF NOT EXISTS altura INTEGER,           -- cm
  ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;

COMMENT ON TABLE public.profiles IS 'Extends auth.users with app-specific profile data';

-- =============================================================================
-- 2. CREATE NEW TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- weight_history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  peso DECIMAL(5,2) NOT NULL,                        -- kg
  fecha DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.weight_history IS 'Weekly weight tracking per user';

-- ---------------------------------------------------------------------------
-- measurement_history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.measurement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('pecho','cintura','cadera','biceps','muslo')),
  valor DECIMAL(5,2) NOT NULL,                       -- cm
  fecha DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.measurement_history IS 'Bi-weekly body measurements per user';

-- ---------------------------------------------------------------------------
-- progress_photos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.progress_photos IS 'Progress photo metadata (files stored in Supabase Storage)';

-- ---------------------------------------------------------------------------
-- global_exercises (public seed catalog, read-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.global_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  grupo_muscular TEXT NOT NULL,
  parent_id UUID REFERENCES public.global_exercises(id),
  equipo TEXT,
  variaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.global_exercises IS 'Global exercise catalog (seed data, read-only for users)';

-- ---------------------------------------------------------------------------
-- user_exercises (private per user)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  grupo_muscular TEXT NOT NULL,
  parent_id UUID REFERENCES public.global_exercises(id),
  equipo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_exercises IS 'User-created custom exercises';

-- ---------------------------------------------------------------------------
-- blocks (training templates, 1-7 positions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  posicion INTEGER NOT NULL CHECK (posicion BETWEEN 1 AND 7),
  es_descanso BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id, posicion)
);

COMMENT ON TABLE public.blocks IS 'Training block templates (7-day cycle positions)';

-- ---------------------------------------------------------------------------
-- block_exercises (exercises within a block + target params)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.block_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  global_exercise_id UUID REFERENCES public.global_exercises(id),
  user_exercise_id UUID REFERENCES public.user_exercises(id),
  series_objetivo INTEGER NOT NULL DEFAULT 3,
  reps_objetivo_min INTEGER,
  reps_objetivo_max INTEGER,
  rpe_objetivo INTEGER CHECK (rpe_objetivo BETWEEN 1 AND 10),
  descanso_segundos INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_one_exercise CHECK (
    (global_exercise_id IS NOT NULL) OR (user_exercise_id IS NOT NULL)
  )
);

COMMENT ON TABLE public.block_exercises IS 'Exercises assigned to a block with target sets/reps/RPE/rest';

-- ---------------------------------------------------------------------------
-- cycles (training cycle state)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  posicion_actual INTEGER NOT NULL DEFAULT 1 CHECK (posicion_actual BETWEEN 1 AND 7),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.cycles IS 'Active training cycle (7-day rotation)';

-- ---------------------------------------------------------------------------
-- sessions (immutable workout snapshots)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  block_id UUID REFERENCES public.blocks(id) ON DELETE SET NULL,
  fecha_completado TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sessions IS 'Completed workout sessions (immutable snapshots)';

-- ---------------------------------------------------------------------------
-- session_sets (per-set real data)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  block_exercise_id UUID NOT NULL REFERENCES public.block_exercises(id),
  peso DECIMAL(6,2),                                  -- kg
  reps_reales INTEGER,
  rpe_real INTEGER CHECK (rpe_real BETWEEN 1 AND 10),
  orden_serie INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.session_sets IS 'Real weight/reps/RPE logged per set during a workout';

-- ---------------------------------------------------------------------------
-- recovery_checklist (post-workout recovery data)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recovery_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  nivel_energia INTEGER NOT NULL CHECK (nivel_energia BETWEEN 1 AND 10),
  suplementos JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.recovery_checklist IS 'Post-workout recovery checklist (energy, supplements)';

-- ---------------------------------------------------------------------------
-- nutrition_menus
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nutrition_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  calorias INTEGER,
  proteinas INTEGER,
  carbohidratos INTEGER,
  grasas INTEGER,
  presupuesto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.nutrition_menus IS 'User-editable nutrition menus';

-- ---------------------------------------------------------------------------
-- nutrition_meals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nutrition_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.nutrition_menus(id) ON DELETE CASCADE,
  nombre_comida TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.nutrition_meals IS 'Meals within a nutrition menu';

-- =============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- =============================================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercises  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_sets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_meals ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. RLS POLICIES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles (existing policies from 001, adding DELETE)
-- ---------------------------------------------------------------------------
CREATE POLICY IF NOT EXISTS "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- weight_history: owner only
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own weight history"
  ON public.weight_history FOR ALL
  USING (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- measurement_history: owner only
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own measurements"
  ON public.measurement_history FOR ALL
  USING (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- progress_photos: owner only
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own progress photos"
  ON public.progress_photos FOR ALL
  USING (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- global_exercises: SELECT for all authenticated, no write
-- ---------------------------------------------------------------------------
CREATE POLICY "Authenticated users can read global exercises"
  ON public.global_exercises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert global exercises"
  ON public.global_exercises FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Authenticated users can update global exercises"
  ON public.global_exercises FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Authenticated users can delete global exercises"
  ON public.global_exercises FOR DELETE
  TO authenticated
  USING (false);

-- ---------------------------------------------------------------------------
-- user_exercises: owner only
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own custom exercises"
  ON public.user_exercises FOR ALL
  USING (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- blocks: owner only
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own blocks"
  ON public.blocks FOR ALL
  USING (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- block_exercises: via parent block ownership
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage exercises in their own blocks"
  ON public.block_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.blocks
      WHERE id = block_exercises.block_id
      AND profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- cycles: owner only
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own cycles"
  ON public.cycles FOR ALL
  USING (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- sessions: via parent cycle ownership
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own sessions"
  ON public.sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cycles
      WHERE id = sessions.cycle_id
      AND profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- session_sets: via session -> cycle ownership
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own session sets"
  ON public.session_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.cycles c ON s.cycle_id = c.id
      WHERE s.id = session_sets.session_id
      AND c.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- recovery_checklist: via session -> cycle ownership
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own recovery checklists"
  ON public.recovery_checklist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.cycles c ON s.cycle_id = c.id
      WHERE s.id = recovery_checklist.session_id
      AND c.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- nutrition_menus: owner only
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage own nutrition menus"
  ON public.nutrition_menus FOR ALL
  USING (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- nutrition_meals: via parent menu ownership
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can manage meals in their own menus"
  ON public.nutrition_meals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.nutrition_menus
      WHERE id = nutrition_meals.menu_id
      AND profile_id = auth.uid()
    )
  );

-- =============================================================================
-- 5. TRIGGER: auto-create profile on new auth.users
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid conflicts during re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 6. CREATE STORAGE BUCKET FOR PROGRESS PHOTOS
-- =============================================================================

-- This is typically done via Supabase Dashboard or Storage API.
-- SQL does not create Storage buckets directly.
-- 
-- MANUAL STEP REQUIRED IN SUPABASE DASHBOARD:
-- 1. Go to Storage -> Buckets -> New Bucket
-- 2. Name: progress-photos
-- 3. Set to "public" or configure signed URLs
-- 4. Add RLS policy: authenticated users can upload to {user_id}/* path
--
-- Example bucket RLS policies (configure in Dashboard):
-- SELECT: auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
-- INSERT: auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
-- DELETE: auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
