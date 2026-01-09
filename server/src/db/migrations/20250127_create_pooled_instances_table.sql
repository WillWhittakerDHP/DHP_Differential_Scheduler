-- Migration: Create pooled_instances table
-- Date: 2025-01-27
-- Purpose: Create table for entity pooling relationships (through table for many-to-many pooling)

-- Create pooled_instances table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'pooled_instances'
    ) THEN
        CREATE TABLE pooled_instances (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            pool_master_id UUID NOT NULL,
            pool_member_id UUID NOT NULL,
            entity_type VARCHAR(255) NOT NULL,
            order_index INTEGER NOT NULL DEFAULT 0,
            disabled BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            -- Unique constraint: prevent duplicate pool memberships
            CONSTRAINT unique_pool_membership UNIQUE (pool_master_id, pool_member_id)
        );
        
        RAISE NOTICE 'Created pooled_instances table';
        
        -- Create indexes for performance
        CREATE INDEX idx_pool_master ON pooled_instances(pool_master_id);
        CREATE INDEX idx_pool_member ON pooled_instances(pool_member_id);
        CREATE INDEX idx_entity_type ON pooled_instances(entity_type);
        
        RAISE NOTICE 'Created indexes on pooled_instances table';
        
        -- Add comment to table
        COMMENT ON TABLE pooled_instances IS 'Through table for entity pooling relationships. Allows entities of the same type to pool other entities of the same type, creating aggregated/composite entities.';
        COMMENT ON COLUMN pooled_instances.pool_master_id IS 'ID of the master entity in the pool';
        COMMENT ON COLUMN pooled_instances.pool_member_id IS 'ID of the member entity in the pool';
        COMMENT ON COLUMN pooled_instances.entity_type IS 'Type of entity being pooled (e.g., blockProfile, partProfile)';
        COMMENT ON COLUMN pooled_instances.order_index IS 'Order of this member within the pool';
        COMMENT ON COLUMN pooled_instances.disabled IS 'Soft delete flag - when true, this pool membership is disabled';
        
    ELSE
        RAISE NOTICE 'Table pooled_instances already exists, skipping';
    END IF;
END $$;

