-- Migration: Add poolable column to block_types
-- Date: 2025-01-27
-- Purpose: Add poolable boolean property to BlockType to control whether BlockProfiles of that type can participate in pooling

-- Add poolable column to block_types table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_types' AND column_name = 'poolable'
    ) THEN
        ALTER TABLE block_types ADD COLUMN poolable BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added poolable column to block_types table';
        
        -- Add index for performance when filtering by poolable
        CREATE INDEX IF NOT EXISTS idx_block_types_poolable ON block_types(poolable);
        RAISE NOTICE 'Created index on block_types.poolable';
    ELSE
        RAISE NOTICE 'Column block_types.poolable already exists, skipping';
    END IF;
END $$;

