/**
 * Migration: Fix Field Visibility Settings
 * Date: 2026-01-15
 * Purpose: Update visibility settings for critical fields from 'notConfigured' to proper visibility values
 *          so fields render correctly on admin pages
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing field visibility settings...');

    // Sentinel UUIDs for global configs
    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';

    // LEARNING: Update partInstance.name to titleRow (CRITICAL FIX)
    // WHY: Name field should always be visible - it's the primary identifier
    // PATTERN: Use UPDATE with WHERE clause to target specific field
    await queryInterface.sequelize.query(
      `UPDATE admin_input_metadata
       SET visibility = 'titleRow',
           updated_at = NOW()
       WHERE entity_type = 'partInstance'
         AND entity_id = :entity_id
         AND field_key = 'name'
         AND visibility = 'notConfigured'`,
      {
        replacements: {
          entity_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
        },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );
    console.log('✅ Fixed partInstance.name visibility');

    // LEARNING: Update blockInstance critical fields to expandedDirect
    // WHY: These fields should be visible when the card is expanded
    // PATTERN: Update multiple fields in one query using IN clause
    const blockInstanceFields = [
      'baseSqFt',
      'icon',
      'composite',
      'differential',
      'allowMultiple',
      'dependent',
    ];

    await queryInterface.sequelize.query(
      `UPDATE admin_input_metadata
       SET visibility = 'expandedDirect',
           updated_at = NOW()
       WHERE entity_type = 'blockInstance'
         AND entity_id = :entity_id
         AND field_key IN (:field_keys)
         AND visibility = 'notConfigured'`,
      {
        replacements: {
          entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
          field_keys: blockInstanceFields,
        },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );
    console.log(`✅ Fixed ${blockInstanceFields.length} blockInstance fields visibility`);

    // LEARNING: Update blockInstance relationship fields to expandedPanel
    // WHY: Relationship fields should appear in the Relationships panel
    // PATTERN: Update relationship fields separately with panel assignment
    const blockInstanceRelationshipFields = [
      'activeConstituents',
      'bookingCascades',
      'instanceComponents',
      'dependentInstanceOptions',
    ];

    await queryInterface.sequelize.query(
      `UPDATE admin_input_metadata
       SET visibility = 'expandedPanel',
           panel = 'relationships',
           updated_at = NOW()
       WHERE entity_type = 'blockInstance'
         AND entity_id = :entity_id
         AND field_key IN (:field_keys)
         AND visibility = 'notConfigured'`,
      {
        replacements: {
          entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
          field_keys: blockInstanceRelationshipFields,
        },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );
    console.log(`✅ Fixed ${blockInstanceRelationshipFields.length} blockInstance relationship fields visibility`);

    // LEARNING: Update partInstance critical fields to expandedDirect
    // WHY: These fields should be visible when the card is expanded
    // PATTERN: Update multiple fields in one query
    const partInstanceFields = [
      'baseFee',
      'baseTime',
      'rateOverBaseFee',
      'rateOverBaseTime',
      'onSite',
      'clientPresent',
      'moveable',
      'zeroOutPart',
    ];

    await queryInterface.sequelize.query(
      `UPDATE admin_input_metadata
       SET visibility = 'expandedDirect',
           updated_at = NOW()
       WHERE entity_type = 'partInstance'
         AND entity_id = :entity_id
         AND field_key IN (:field_keys)
         AND visibility = 'notConfigured'`,
      {
        replacements: {
          entity_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
          field_keys: partInstanceFields,
        },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );
    console.log(`✅ Fixed ${partInstanceFields.length} partInstance fields visibility`);

    // LEARNING: Verify updates by counting changed rows
    // WHY: Confirm that updates were successful
    // PATTERN: Query to check visibility distribution after update
    const [results] = await queryInterface.sequelize.query(
      `SELECT 
        entity_type,
        visibility,
        COUNT(*) as count
      FROM admin_input_metadata
      WHERE entity_id IN (:block_instance_id, :part_instance_id)
      GROUP BY entity_type, visibility
      ORDER BY entity_type, visibility`,
      {
        replacements: {
          block_instance_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
          part_instance_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
        },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    console.log('📊 Visibility distribution after update:');
    console.table(results);

    console.log('✅ Completed fixing field visibility settings');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting field visibility settings...');

    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';

    // LEARNING: Revert visibility changes back to notConfigured
    // WHY: Allow rollback if needed
    // PATTERN: Set visibility back to notConfigured for fields we changed

    // Revert partInstance.name
    await queryInterface.sequelize.query(
      `UPDATE admin_input_metadata
       SET visibility = 'notConfigured',
           updated_at = NOW()
       WHERE entity_type = 'partInstance'
         AND entity_id = :entity_id
         AND field_key = 'name'
         AND visibility = 'titleRow'`,
      {
        replacements: {
          entity_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
        },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    // Revert blockInstance fields
    const blockInstanceFields = [
      'baseSqFt',
      'icon',
      'composite',
      'differential',
      'allowMultiple',
      'dependent',
      'activeConstituents',
      'bookingCascades',
      'instanceComponents',
      'dependentInstanceOptions',
    ];

    await queryInterface.sequelize.query(
      `UPDATE admin_input_metadata
       SET visibility = 'notConfigured',
           panel = 'none',
           updated_at = NOW()
       WHERE entity_type = 'blockInstance'
         AND entity_id = :entity_id
         AND field_key IN (:field_keys)
         AND visibility IN ('expandedDirect', 'expandedPanel')`,
      {
        replacements: {
          entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
          field_keys: blockInstanceFields,
        },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    // Revert partInstance fields
    const partInstanceFields = [
      'baseFee',
      'baseTime',
      'rateOverBaseFee',
      'rateOverBaseTime',
      'onSite',
      'clientPresent',
      'moveable',
      'zeroOutPart',
    ];

    await queryInterface.sequelize.query(
      `UPDATE admin_input_metadata
       SET visibility = 'notConfigured',
           updated_at = NOW()
       WHERE entity_type = 'partInstance'
         AND entity_id = :entity_id
         AND field_key IN (:field_keys)
         AND visibility = 'expandedDirect'`,
      {
        replacements: {
          entity_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
          field_keys: partInstanceFields,
        },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    console.log('✅ Reverted field visibility settings');
  }
};
