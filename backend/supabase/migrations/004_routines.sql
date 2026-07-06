-- =============================================================================
-- Migration 004: Multiple routines per user, one active at a time
-- Run with: supabase db push (or via Supabase SQL Editor)
-- =============================================================================

-- =============================================================================
-- 1. CREATE routines TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.routines IS 'Named training routines (7-day plans) per user; only one can be active at a time';

-- Enforce "only one active routine per profile" at the DB level.
CREATE UNIQUE INDEX IF NOT EXISTS routines_one_active_per_profile
  ON public.routines (profile_id)
  WHERE (activa);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own routines" ON public.routines;
CREATE POLICY "Users can manage own routines"
  ON public.routines FOR ALL
  USING (profile_id = auth.uid());

-- =============================================================================
-- 2. BACKFILL: one routine per profile that already has blocks
-- =============================================================================

-- Guarded with NOT EXISTS so this migration is safe to run more than once
-- (e.g. re-applied by mistake) without creating duplicate routines or
-- tripping the one-active-routine-per-profile index below.
INSERT INTO public.routines (profile_id, nombre, activa)
SELECT DISTINCT b.profile_id, 'Mi rutina', TRUE
FROM public.blocks b
WHERE NOT EXISTS (
  SELECT 1 FROM public.routines r WHERE r.profile_id = b.profile_id
);

-- =============================================================================
-- 3. blocks: add routine_id, re-scope the position uniqueness to the routine
-- =============================================================================

ALTER TABLE public.blocks
  ADD COLUMN IF NOT EXISTS routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE;

UPDATE public.blocks b
SET routine_id = r.id
FROM public.routines r
WHERE r.profile_id = b.profile_id
  AND b.routine_id IS NULL;

ALTER TABLE public.blocks
  ALTER COLUMN routine_id SET NOT NULL;

-- Drop the old profile-wide uniqueness and replace it with one scoped to the
-- routine, so different routines can each have their own days 1-7.
ALTER TABLE public.blocks
  DROP CONSTRAINT IF EXISTS blocks_profile_id_posicion_key;

-- Deferrable: reordering (see reorder_blocks below) needs to be able to leave
-- positions transiently duplicated within a single transaction.
ALTER TABLE public.blocks
  DROP CONSTRAINT IF EXISTS blocks_routine_id_posicion_key;
ALTER TABLE public.blocks
  ADD CONSTRAINT blocks_routine_id_posicion_key
  UNIQUE (routine_id, posicion) DEFERRABLE INITIALLY IMMEDIATE;

-- =============================================================================
-- 4. cycles: add routine_id (nullable, ON DELETE SET NULL)
-- =============================================================================
-- Nullable on purpose: deleting a routine must not delete its past cycles/
-- sessions, since session_sets store immutable snapshots and history should
-- survive routine deletion (see CLAUDE.md).

ALTER TABLE public.cycles
  ADD COLUMN IF NOT EXISTS routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL;

UPDATE public.cycles c
SET routine_id = r.id
FROM public.routines r
WHERE r.profile_id = c.profile_id
  AND c.routine_id IS NULL;

-- =============================================================================
-- 5. reorder_blocks RPC
-- =============================================================================
-- NOTE: this function was previously created ad-hoc directly in the Supabase
-- SQL editor and was never captured in a migration file. This is the first
-- time it's formally defined here, now scoped to (routine_id, posicion)
-- instead of (profile_id, posicion), and hardened with an explicit ownership
-- check (it's SECURITY DEFINER, so it bypasses RLS and must check itself).

CREATE OR REPLACE FUNCTION public.reorder_blocks(block_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.blocks b
    WHERE b.id = ANY(block_ids)
      AND b.profile_id <> auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para reordenar estos bloques';
  END IF;

  -- Defer the (routine_id, posicion) uniqueness check to the end of this
  -- transaction so the temporary duplicate positions produced while swapping
  -- rows around don't raise a spurious violation.
  SET CONSTRAINTS public.blocks_routine_id_posicion_key DEFERRED;

  UPDATE public.blocks AS b
  SET posicion = x.new_posicion
  FROM (
    SELECT id, ordinality::int AS new_posicion
    FROM UNNEST(block_ids) WITH ORDINALITY AS t(id, ordinality)
  ) AS x
  WHERE b.id = x.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reorder_blocks(UUID[]) TO authenticated;
