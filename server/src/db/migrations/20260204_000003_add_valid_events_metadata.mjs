/**
 * Migration: Add validEvents metadata for PartShape
 * Date: 2026-02-04
 * Purpose: 
 * - Add validEvents metadata entry for PartShape (multi-select of EventShapes)
 * - Similar to validParts metadata for BlockShape
 * 
 * LEARNING: Valid events enable part shapes to define which event shapes are valid
 * WHY: Part shapes need to define which event shapes can be assigned to their instances
 * PATTERN: Seed global shape config (sentinel UUID) with relationship metadata
 */

import { randomUUID } from 'crypto'

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding validEvents metadata for PartShape...');

    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';
    const now = new Date();
    const jsonbLiteral = (value) => Sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`);

    // Check if metadata already exists
    const [existing] = await queryInterface.sequelize.query(`
      SELECT id FROM admin_metadata
      WHERE entity_type = 'partShape'
        AND entity_id = $1
        AND field_key = 'validEvents'
        AND metadata_type = 'relationship'
    `, {
      bind: [PART_SHAPE_GLOBAL_CONFIG_ID],
      type: Sequelize.QueryTypes.SELECT,
    });

    if (existing && existing.length > 0) {
      console.log('ℹ️  validEvents metadata already exists for PartShape, skipping');
      return;
    }

    await queryInterface.bulkInsert('admin_metadata', [
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        config_type: 'entity',
        entity_type: 'partShape',
        entity_id: PART_SHAPE_GLOBAL_CONFIG_ID,
        config_id: null,
        field_key: 'validEvents',
        block_shape_ref: null,
        data_type: 'reference',
        label: 'Valid Events',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 1,
        render_as: 'multiselect',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'validEvents',
          globalField: 'validEvents',
          selectedParentKey: 'partShape',
          selectedChildKey: 'eventShape',
          selectedChildPath: ['validEvents'],
          candidateParentKey: 'partShape',
          candidateParentPath: [],
          candidateChildKey: 'eventShape',
          candidateChildPath: [],
          selectType: 'validEventSelect',
          selectMode: 'multiple',
          placeholder: 'No events selected',
        }),
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log('✅ Added validEvents metadata for PartShape');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing validEvents metadata for PartShape...');

    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';

    await queryInterface.sequelize.query(`
      DELETE FROM admin_metadata
      WHERE entity_type = 'partShape'
        AND entity_id = $1
        AND field_key = 'validEvents'
        AND metadata_type = 'relationship'
    `, {
      bind: [PART_SHAPE_GLOBAL_CONFIG_ID],
    });

    console.log('✅ Removed validEvents metadata for PartShape');
  },
}
