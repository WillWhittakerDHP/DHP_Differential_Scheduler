-- Migration: Rename poolable column to composable in block_shapes
-- Date: 2025-01-31
-- Purpose: Rename poolable column to composable to better reflect the concept of composable entities

-- Rename poolable column to composable in block_shapes table
DO $$ 
BEGIN
    -- Check if poolable column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'block_shapes' 
        AND column_name = 'poolable'
    ) THEN
        -- Rename the column
        ALTER TABLE block_shapes RENAME COLUMN poolable TO composable;
        RAISE NOTICE 'Renamed poolable column to composable in block_shapes table';
        
        -- Rename the index if it exists
        IF EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'block_shapes' 
            AND indexname = 'idx_block_shapes_poolable'
        ) THEN
            ALTER INDEX idx_block_shapes_poolable RENAME TO idx_block_shapes_composable;
            RAISE NOTICE 'Renamed index idx_block_shapes_poolable to idx_block_shapes_composable';
        END IF;
    ELSE
        -- Check if composable already exists (migration may have been run already)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'block_shapes' 
            AND column_name = 'composable'
        ) THEN
            RAISE NOTICE 'Column block_shapes.composable already exists, skipping migration';
        ELSE
            RAISE EXCEPTION 'Column block_shapes.poolable does not exist and block_shapes.composable does not exist. Cannot perform migration.';
        END IF;
    END IF;
END $$;

