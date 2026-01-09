-- Migration: Rename aggregate_id to composer_id in active_compositions table
-- Purpose: Complete conversion to composition terminology
-- Date: 2025-02-01

DO $$
BEGIN
    -- Check if aggregate_id column exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'active_compositions'
        AND column_name = 'aggregate_id'
    ) THEN
        -- Rename aggregate_id column to composer_id
        ALTER TABLE active_compositions RENAME COLUMN aggregate_id TO composer_id;
        RAISE NOTICE 'Renamed aggregate_id column to composer_id in active_compositions table';
        
        -- Rename indexes
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'unique_aggregate_particle') THEN
            ALTER INDEX unique_aggregate_particle RENAME TO unique_composer_particle;
            RAISE NOTICE 'Renamed index unique_aggregate_particle to unique_composer_particle';
        END IF;
        
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_aggregate') THEN
            ALTER INDEX idx_aggregate RENAME TO idx_composer;
            RAISE NOTICE 'Renamed index idx_aggregate to idx_composer';
        END IF;
    ELSE
        -- Check if composer_id already exists
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'active_compositions'
            AND column_name = 'composer_id'
        ) THEN
            RAISE NOTICE 'Column composer_id already exists in active_compositions table. Migration may have already been applied.';
        ELSE
            RAISE EXCEPTION 'Column active_compositions.aggregate_id does not exist and active_compositions.composer_id does not exist. Cannot perform migration.';
        END IF;
    END IF;
END $$;

