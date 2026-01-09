-- Migration: Rename pooled_instances table to entity_pools and update column names
-- Date: 2025-01-28
-- Purpose: Rename pooling terminology to use "coordinator" instead of "master"

DO $$ 
BEGIN
    -- Rename table if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'pooled_instances'
    ) THEN
        -- Rename table
        ALTER TABLE pooled_instances RENAME TO entity_pools;
        
        -- Rename columns
        ALTER TABLE entity_pools RENAME COLUMN pool_master_id TO pool_coordinator_id;
        ALTER TABLE entity_pools RENAME COLUMN pool_member_id TO member_id;
        
        -- Rename indexes
        DROP INDEX IF EXISTS idx_pool_master;
        CREATE INDEX idx_pool_coordinator ON entity_pools(pool_coordinator_id);
        
        DROP INDEX IF EXISTS idx_pool_member;
        CREATE INDEX idx_member ON entity_pools(member_id);
        
        -- Rename constraint
        ALTER TABLE entity_pools RENAME CONSTRAINT unique_pool_membership TO unique_pool_membership;
        
        -- Update constraint to use new column names (drop and recreate)
        ALTER TABLE entity_pools DROP CONSTRAINT IF EXISTS unique_pool_membership;
        ALTER TABLE entity_pools ADD CONSTRAINT unique_pool_membership UNIQUE (pool_coordinator_id, member_id);
        
        -- Update comments
        COMMENT ON TABLE entity_pools IS 'Through table for entity pooling relationships. Allows entities of the same type to pool other entities of the same type, creating aggregated/composite entities.';
        COMMENT ON COLUMN entity_pools.pool_coordinator_id IS 'ID of the coordinator entity in the pool';
        COMMENT ON COLUMN entity_pools.member_id IS 'ID of the member entity in the pool';
        COMMENT ON COLUMN entity_pools.entity_type IS 'Type of entity being pooled (e.g., blockProfile, partProfile)';
        COMMENT ON COLUMN entity_pools.order_index IS 'Order of this member within the pool';
        COMMENT ON COLUMN entity_pools.disabled IS 'Soft delete flag - when true, this pool membership is disabled';
        
        RAISE NOTICE 'Renamed pooled_instances table to entity_pools and updated column names';
    ELSE
        RAISE NOTICE 'Table pooled_instances does not exist, skipping rename';
    END IF;
END $$;

