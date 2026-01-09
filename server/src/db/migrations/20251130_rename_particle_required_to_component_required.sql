-- Migration: Rename particle_required to component_required on block_instances
-- Date: 2025-11-30
-- Purpose: Rename column from particle_required to component_required to match codebase terminology
DO $$
BEGIN
    -- Check if particle_required exists and component_required doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_instances' 
        AND column_name = 'particle_required'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_instances' 
        AND column_name = 'component_required'
    ) THEN
        -- Rename particle_required to component_required
        ALTER TABLE block_instances RENAME COLUMN particle_required TO component_required;
        RAISE NOTICE 'Renamed particle_required to component_required on block_instances';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_instances' 
        AND column_name = 'component_required'
    ) THEN
        -- component_required already exists, do nothing
        RAISE NOTICE 'component_required already exists on block_instances, skipping';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_instances' 
        AND column_name = 'particle_required'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_instances' 
        AND column_name = 'component_required'
    ) THEN
        -- Neither exists, add component_required
        ALTER TABLE block_instances ADD COLUMN component_required BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added component_required column to block_instances';
    END IF;
END $$;


