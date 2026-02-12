/**
 * Migration: Create property_field_mappings table
 * Date: 2026-02-01
 * Purpose: Field-to-model mappings for MLS property enrichment (source_field -> target_field)
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE property_field_mappings (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        data_source varchar(50) NOT NULL DEFAULT 'bright_mls',
        source_field varchar(100) NOT NULL,
        target_field varchar(100) NOT NULL,
        value_mapping jsonb,
        fallback_value text,
        active boolean NOT NULL DEFAULT true,
        notes text,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_property_field_mappings_data_source_active
        ON property_field_mappings (data_source, active);
    `);
    console.log('[property_field_mappings] Created property_field_mappings table');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS property_field_mappings;`);
    console.log('[property_field_mappings] Dropped property_field_mappings table');
  },
};
