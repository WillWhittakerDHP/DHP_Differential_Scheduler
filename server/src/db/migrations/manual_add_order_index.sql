-- Manual migration: Add order_index to active_components
-- This can be run directly if migrations are blocked

-- Add order_index column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'active_components' 
        AND column_name = 'order_index'
    ) THEN
        ALTER TABLE active_components 
        ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
        
        COMMENT ON COLUMN active_components.order_index IS 'Order in which components should be displayed';
        
        RAISE NOTICE '✅ Added order_index column to active_components table';
    ELSE
        RAISE NOTICE 'ℹ️  order_index column already exists in active_components, skipping';
    END IF;
END $$;

-- Mark migration as run (optional - only if you want to track it)
-- INSERT INTO "SequelizeMeta" (name) VALUES ('20251203_add_order_index_to_active_components.mjs')
-- ON CONFLICT DO NOTHING;

