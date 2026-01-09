-- Migration: Create descriptions system tables
-- Date: 2025-02-01
-- Purpose: Create Description entity and BlockInstanceDescription through-table for user-specific descriptions

-- Create descriptions table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'descriptions'
    ) THEN
        CREATE TABLE descriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            text TEXT NOT NULL,
            user_type VARCHAR(255) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- Create index on user_type for filtering
        CREATE INDEX idx_descriptions_user_type ON descriptions(user_type);

        RAISE NOTICE 'Created descriptions table with indexes';
    ELSE
        RAISE NOTICE 'Table descriptions already exists, skipping';
    END IF;
END $$;

-- Create block_instance_descriptions through-table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'block_instance_descriptions'
    ) THEN
        CREATE TABLE block_instance_descriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            block_instance_id UUID NOT NULL REFERENCES block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE,
            description_id UUID NOT NULL REFERENCES descriptions(id) ON UPDATE CASCADE ON DELETE CASCADE,
            user_type VARCHAR(255) NULL,
            order_index INTEGER NOT NULL DEFAULT 0,
            is_default BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_block_instance_description_user_type UNIQUE (block_instance_id, description_id, user_type)
        );

        -- Create indexes for performance
        CREATE INDEX idx_block_instance_descriptions_block_instance_id ON block_instance_descriptions(block_instance_id);
        CREATE INDEX idx_block_instance_descriptions_description_id ON block_instance_descriptions(description_id);
        CREATE INDEX idx_block_instance_descriptions_order_index ON block_instance_descriptions(order_index);

        RAISE NOTICE 'Created block_instance_descriptions table with indexes and constraints';
    ELSE
        RAISE NOTICE 'Table block_instance_descriptions already exists, skipping';
    END IF;
END $$;

