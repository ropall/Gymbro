-- ==============================================================================
-- Migration 003: Add snapshot fields to session_sets for immutable session history
-- ==============================================================================

ALTER TABLE public.session_sets
  ADD COLUMN IF NOT EXISTS snapshot_nombre TEXT,
  ADD COLUMN IF NOT EXISTS snapshot_grupo_muscular TEXT,
  ADD COLUMN IF NOT EXISTS snapshot_series_objetivo INTEGER,
  ADD COLUMN IF NOT EXISTS snapshot_reps_objetivo_min INTEGER,
  ADD COLUMN IF NOT EXISTS snapshot_reps_objetivo_max INTEGER,
  ADD COLUMN IF NOT EXISTS snapshot_rpe_objetivo INTEGER,
  ADD COLUMN IF NOT EXISTS snapshot_descanso_segundos INTEGER;

COMMENT ON COLUMN public.session_sets.snapshot_nombre IS 'Immutable copy of exercise name at session time';
COMMENT ON COLUMN public.session_sets.snapshot_grupo_muscular IS 'Immutable copy of muscle group at session time';
COMMENT ON COLUMN public.session_sets.snapshot_series_objetivo IS 'Immutable copy of target sets at session time';
COMMENT ON COLUMN public.session_sets.snapshot_reps_objetivo_min IS 'Immutable copy of target min reps at session time';
COMMENT ON COLUMN public.session_sets.snapshot_reps_objetivo_max IS 'Immutable copy of target max reps at session time';
COMMENT ON COLUMN public.session_sets.snapshot_rpe_objetivo IS 'Immutable copy of target RPE at session time';
COMMENT ON COLUMN public.session_sets.snapshot_descanso_segundos IS 'Immutable copy of target rest seconds at session time';
