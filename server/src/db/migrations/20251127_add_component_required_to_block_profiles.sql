-- Migration: Add particle_required column to block_profiles
-- Note: If component_required exists, rename it; otherwise add particle_required
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_profiles' 
        AND column_name = 'component_required'
    ) THEN
        ALTER TABLE block_profiles RENAME COLUMN component_required TO particle_required;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_profiles' 
        AND column_name = 'particle_required'
    ) THEN
        ALTER TABLE block_profiles ADD COLUMN particle_required BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

