-- Migration: Rename _type_id columns to _type_ref
-- Date: 2025-10-19
-- Purpose: Standardize foreign key naming convention from _id to _ref

-- Rename part_profiles.part_type_id to part_type_ref
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'part_profiles' AND column_name = 'part_type_id'
    ) THEN
        ALTER TABLE part_profiles RENAME COLUMN part_type_id TO part_type_ref;
        RAISE NOTICE 'Renamed part_profiles.part_type_id to part_type_ref';
    ELSE
        RAISE NOTICE 'Column part_profiles.part_type_id does not exist, skipping';
    END IF;
END $$;

-- Rename block_profiles.block_type_id to block_type_ref
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_profiles' AND column_name = 'block_type_id'
    ) THEN
        ALTER TABLE block_profiles RENAME COLUMN block_type_id TO block_type_ref;
        RAISE NOTICE 'Renamed block_profiles.block_type_id to block_type_ref';
    ELSE
        RAISE NOTICE 'Column block_profiles.block_type_id does not exist, skipping';
    END IF;
END $$;

-- Check for any other tables with _type_id pattern
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name LIKE '%_type_id'
        AND table_name NOT IN ('part_profiles', 'block_profiles')
    LOOP
        RAISE NOTICE 'Found additional column to rename: %.%', r.table_name, r.column_name;
    END LOOP;
END $$;
