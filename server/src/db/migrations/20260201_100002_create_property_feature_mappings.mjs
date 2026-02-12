/**
 * Migration: Create property_feature_mappings table
 * Date: 2026-02-01
 * Purpose: Feature-to-block mappings for MLS property enrichment (source_field -> block_instance_id)
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE property_feature_mappings (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        data_source varchar(50) NOT NULL DEFAULT 'bright_mls',
        source_field varchar(100) NOT NULL,
        match_type varchar(30) NOT NULL,
        match_value text,
        block_instance_id uuid NOT NULL REFERENCES block_instances(id) ON DELETE CASCADE,
        active boolean NOT NULL DEFAULT true,
        priority integer NOT NULL DEFAULT 0,
        notes text,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_property_feature_mappings_data_source_active
        ON property_feature_mappings (data_source, active);
    `);
    console.log('[property_feature_mappings] Created property_feature_mappings table');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS property_feature_mappings;`);
    console.log('[property_feature_mappings] Dropped property_feature_mappings table');
  },
};
