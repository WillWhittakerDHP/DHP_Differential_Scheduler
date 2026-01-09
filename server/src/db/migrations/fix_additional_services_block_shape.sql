-- Fix Additional Services Block Shape Reference
-- Run this SQL script to manually fix the foreign key constraint issue
-- This updates all block_instances that reference Additional Service blockShape to use Base Service instead

-- Step 1: Find the Base Service (service) blockShape ID
-- Replace :baseServiceId with the actual UUID from the query result below
-- SELECT id FROM block_shapes WHERE name = 'service';

-- Step 2: Find the Additional Service blockShape ID  
-- Replace :additionalServiceId with the actual UUID from the query result below
-- SELECT id FROM block_shapes WHERE LOWER(name) LIKE '%additional%service%' OR LOWER(name) = 'additional_service' OR LOWER(name) = 'additional service';

-- Step 3: Update all block_instances (replace the UUIDs with actual values from steps 1 and 2)
-- UPDATE block_instances 
-- SET block_shape_ref = '<BASE_SERVICE_BLOCKSHAPE_ID>'
-- WHERE block_shape_ref = '<ADDITIONAL_SERVICE_BLOCKSHAPE_ID>';

-- Step 4: Update valid_cascades relationships
-- UPDATE valid_cascades 
-- SET child_id = '<BASE_SERVICE_BLOCKSHAPE_ID>'
-- WHERE child_id = '<ADDITIONAL_SERVICE_BLOCKSHAPE_ID>';

-- UPDATE valid_cascades 
-- SET parent_id = '<BASE_SERVICE_BLOCKSHAPE_ID>'
-- WHERE parent_id = '<ADDITIONAL_SERVICE_BLOCKSHAPE_ID>';

-- Step 5: Verify no remaining references
-- SELECT COUNT(*) FROM block_instances WHERE block_shape_ref = '<ADDITIONAL_SERVICE_BLOCKSHAPE_ID>';
-- SELECT COUNT(*) FROM valid_cascades WHERE parent_id = '<ADDITIONAL_SERVICE_BLOCKSHAPE_ID>' OR child_id = '<ADDITIONAL_SERVICE_BLOCKSHAPE_ID>';

-- Step 6: Delete the Additional Service blockShape (only after verifying step 5 returns 0)
-- DELETE FROM block_shapes WHERE id = '<ADDITIONAL_SERVICE_BLOCKSHAPE_ID>';

-- OR: Run this complete script (replace UUIDs first):
DO $$
DECLARE
    base_service_id UUID;
    additional_service_id UUID;
    instance_count INTEGER;
    cascade_count INTEGER;
BEGIN
    -- Find Base Service blockShape
    SELECT id INTO base_service_id FROM block_shapes WHERE name = 'service' LIMIT 1;
    
    IF base_service_id IS NULL THEN
        RAISE EXCEPTION 'Base Service blockShape not found';
    END IF;
    
    -- Find Additional Service blockShape
    SELECT id INTO additional_service_id FROM block_shapes 
    WHERE LOWER(name) LIKE '%additional%service%' 
       OR LOWER(name) = 'additional_service'
       OR LOWER(name) = 'additional service'
    LIMIT 1;
    
    IF additional_service_id IS NULL THEN
        RAISE NOTICE 'Additional Service blockShape not found - nothing to migrate';
        RETURN;
    END IF;
    
    -- Update block_instances
    UPDATE block_instances 
    SET block_shape_ref = base_service_id
    WHERE block_shape_ref = additional_service_id;
    
    GET DIAGNOSTICS instance_count = ROW_COUNT;
    RAISE NOTICE 'Updated % block_instances', instance_count;
    
    -- Update valid_cascades (child_id)
    UPDATE valid_cascades 
    SET child_id = base_service_id
    WHERE child_id = additional_service_id;
    
    -- Update valid_cascades (parent_id)
    UPDATE valid_cascades 
    SET parent_id = base_service_id
    WHERE parent_id = additional_service_id;
    
    GET DIAGNOSTICS cascade_count = ROW_COUNT;
    RAISE NOTICE 'Updated valid_cascades relationships';
    
    -- Verify no remaining references
    SELECT COUNT(*) INTO instance_count FROM block_instances WHERE block_shape_ref = additional_service_id;
    SELECT COUNT(*) INTO cascade_count FROM valid_cascades WHERE parent_id = additional_service_id OR child_id = additional_service_id;
    
    IF instance_count > 0 OR cascade_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete: % block_instances and % valid_cascades still reference Additional Service blockShape', instance_count, cascade_count;
    END IF;
    
    -- Delete Additional Service blockShape
    DELETE FROM block_shapes WHERE id = additional_service_id;
    RAISE NOTICE 'Successfully deleted Additional Service blockShape';
END $$;

