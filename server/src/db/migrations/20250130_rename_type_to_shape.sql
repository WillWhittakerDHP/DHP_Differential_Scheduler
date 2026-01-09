-- Migration: Rename Type to Shape Terminology
-- Purpose: Rename block_types/part_types tables and block_type_ref/part_type_ref columns to use "shape" terminology
-- Date: 2025-01-30

BEGIN;

-- 1. Rename tables
ALTER TABLE IF EXISTS block_types RENAME TO block_shapes;
ALTER TABLE IF EXISTS part_types RENAME TO part_shapes;

-- 2. Rename columns in block_profiles table
ALTER TABLE IF EXISTS block_profiles RENAME COLUMN block_type_ref TO block_shape_ref;

-- 3. Rename columns in part_profiles table
ALTER TABLE IF EXISTS part_profiles RENAME COLUMN part_type_ref TO part_shape_ref;

-- 4. Update foreign key constraints in valid_parts table
-- Drop old foreign keys
ALTER TABLE IF EXISTS valid_parts DROP CONSTRAINT IF EXISTS valid_parts_parent_id_fkey;
ALTER TABLE IF EXISTS valid_parts DROP CONSTRAINT IF EXISTS valid_parts_child_id_fkey;

-- Add new foreign keys with updated table references
ALTER TABLE IF EXISTS valid_parts 
  ADD CONSTRAINT valid_parts_parent_id_fkey 
  FOREIGN KEY (parent_id) REFERENCES block_shapes(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS valid_parts 
  ADD CONSTRAINT valid_parts_child_id_fkey 
  FOREIGN KEY (child_id) REFERENCES part_shapes(id) ON DELETE CASCADE;

-- 5. Update foreign key constraints in valid_blocks table
-- Drop old foreign keys
ALTER TABLE IF EXISTS valid_blocks DROP CONSTRAINT IF EXISTS valid_blocks_parent_id_fkey;
ALTER TABLE IF EXISTS valid_blocks DROP CONSTRAINT IF EXISTS valid_blocks_child_id_fkey;

-- Add new foreign keys with updated table references
ALTER TABLE IF EXISTS valid_blocks 
  ADD CONSTRAINT valid_blocks_parent_id_fkey 
  FOREIGN KEY (parent_id) REFERENCES block_shapes(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS valid_blocks 
  ADD CONSTRAINT valid_blocks_child_id_fkey 
  FOREIGN KEY (child_id) REFERENCES block_shapes(id) ON DELETE CASCADE;

-- 6. Update foreign key constraints in block_profiles table
ALTER TABLE IF EXISTS block_profiles DROP CONSTRAINT IF EXISTS block_profiles_block_type_ref_fkey;
ALTER TABLE IF EXISTS block_profiles 
  ADD CONSTRAINT block_profiles_block_shape_ref_fkey 
  FOREIGN KEY (block_shape_ref) REFERENCES block_shapes(id) ON DELETE RESTRICT;

-- 7. Update foreign key constraints in part_profiles table
ALTER TABLE IF EXISTS part_profiles DROP CONSTRAINT IF EXISTS part_profiles_part_type_ref_fkey;
ALTER TABLE IF EXISTS part_profiles 
  ADD CONSTRAINT part_profiles_part_shape_ref_fkey 
  FOREIGN KEY (part_shape_ref) REFERENCES part_shapes(id) ON DELETE RESTRICT;

COMMIT;

