-- Clear Active Relationships Migration
-- 
-- LEARNING: Clears all active relationships (activeCascades, activeConstituents, activeCompositions)
-- WHY: After phase 9 renaming, existing active relationships may be invalid or misaligned
--      Clearing them allows testing with clean data and verifying the UI works correctly
-- 
-- NOTE: This is a data cleanup migration, not a schema change
-- Run this to clear all active relationships before testing the UI

-- Clear activeCascades
DELETE FROM active_cascades;

-- Clear activeConstituents
DELETE FROM active_constituents;

-- Clear activeCompositions
DELETE FROM active_compositions;

-- Optional: Reset sequences if using auto-increment IDs (PostgreSQL)
-- ALTER SEQUENCE active_cascades_id_seq RESTART WITH 1;
-- ALTER SEQUENCE active_constituents_id_seq RESTART WITH 1;
-- ALTER SEQUENCE active_compositions_id_seq RESTART WITH 1;

