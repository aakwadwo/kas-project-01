-- Run once in the Supabase SQL editor (safe to run again).
-- The registration code stores REGISTERED / CANCELLED in a "status" column.
-- If your Registration table already has this column, nothing changes.

DO $$ BEGIN
  CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Registration"
  ADD COLUMN IF NOT EXISTS "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED';
