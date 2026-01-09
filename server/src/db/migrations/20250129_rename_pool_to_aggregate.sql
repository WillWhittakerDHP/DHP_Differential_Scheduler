-- Migration: Rename entity_pools table to entity_aggregates and update column names
-- Date: 2025-01-29
-- Purpose: Migrate from pool/coordinator/member terminology to aggregate/particle terminology

DO $$ 
BEGIN
    -- Rename table if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'entity_pools'
    ) THEN
        -- Rename table
        ALTER TABLE entity_pools RENAME TO entity_aggregates;
        
        -- Rename columns
        ALTER TABLE entity_aggregates RENAME COLUMN pool_coordinator_id TO aggregate_id;
        ALTER TABLE entity_aggregates RENAME COLUMN member_id TO particle_id;
        
        -- Rename indexes
        DROP INDEX IF EXISTS idx_pool_coordinator;
        CREATE INDEX idx_aggregate ON entity_aggregates(aggregate_id);
        
        DROP INDEX IF EXISTS idx_member;
        CREATE INDEX idx_particle ON entity_aggregates(particle_id);
        
        -- Rename constraint
        ALTER TABLE entity_aggregates DROP CONSTRAINT IF EXISTS unique_pool_membership;
        ALTER TABLE entity_aggregates ADD CONSTRAINT unique_aggregate_particle UNIQUE (aggregate_id, particle_id);
        
        -- Update comments
        COMMENT ON TABLE entity_aggregates IS 'Through table for entity aggregation relationships. Allows entities of the same type to aggregate other entities of the same type, creating aggregated/composite entities.';
        COMMENT ON COLUMN entity_aggregates.aggregate_id IS 'ID of the aggregate entity';
        COMMENT ON COLUMN entity_aggregates.particle_id IS 'ID of the particle entity';
        COMMENT ON COLUMN entity_aggregates.entity_type IS 'Type of entity being aggregated (e.g., blockProfile, partProfile)';
        COMMENT ON COLUMN entity_aggregates.order_index IS 'Order of this particle within the aggregate';
        COMMENT ON COLUMN entity_aggregates.disabled IS 'Soft delete flag - when true, this aggregation membership is disabled';
        
        RAISE NOTICE 'Renamed entity_pools table to entity_aggregates and updated column names';
    ELSE
        RAISE NOTICE 'Table entity_pools does not exist, skipping rename';
    END IF;
END $$;

