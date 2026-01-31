/**
 * Migration: Add attendeeAssignments metadata for EventShape
 * Date: 2026-01-31
 * Purpose: 
 * - Add attendeeAssignments metadata entry for EventShape (multi-select of UserTypeBlock BlockInstances)
 * - Enables admin UI to configure which user types attend each event shape
 * 
 * LEARNING: Attendee assignments enable event shapes to define which user types attend the event
 * WHY: Event shapes need to define which user types (inspector, client, agent) attend the event
 * PATTERN: Seed global shape config (sentinel UUID) with relationship metadata
 */

import { randomUUID } from 'crypto'

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding attendeeAssignments metadata for EventShape...');

    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010';
    const now = new Date();
    const jsonbLiteral = (value) => Sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`);

    // Check if metadata already exists
    const [existing] = await queryInterface.sequelize.query(`
      SELECT id FROM admin_metadata
      WHERE entity_type = 'eventShape'
        AND entity_id = $1
        AND field_key = 'attendeeAssignments'
        AND metadata_type = 'relationship'
    `, {
      bind: [EVENT_SHAPE_GLOBAL_CONFIG_ID],
      type: Sequelize.QueryTypes.SELECT,
    });

    if (existing && existing.length > 0) {
      console.log('ℹ️  attendeeAssignments metadata already exists for EventShape, skipping');
      return;
    }

    await queryInterface.bulkInsert('admin_metadata', [
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'eventShape',
        entity_id: EVENT_SHAPE_GLOBAL_CONFIG_ID,
        field_key: 'attendeeAssignments',
        block_shape_ref: null,
        data_type: 'reference',
        label: 'Attendees',
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
          targetKey: 'attendeeAssignments',
          globalField: 'attendees',
          selectedParentKey: 'eventShape',
          selectedChildKey: 'blockInstance',
          selectedChildPath: ['attendees'],
          candidateParentKey: 'eventShape',
          candidateParentPath: [],
          candidateChildKey: 'blockInstance',
          candidateChildPath: [],
          selectType: 'attendeeSelect',
          selectMode: 'multiple',
          placeholder: 'No attendees selected'
        }),
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log('✅ Added attendeeAssignments metadata for EventShape');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing attendeeAssignments metadata for EventShape...');

    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010';

    await queryInterface.sequelize.query(`
      DELETE FROM admin_metadata
      WHERE entity_type = 'eventShape'
        AND entity_id = $1
        AND field_key = 'attendeeAssignments'
        AND metadata_type = 'relationship'
    `, {
      bind: [EVENT_SHAPE_GLOBAL_CONFIG_ID],
    });

    console.log('✅ Removed attendeeAssignments metadata for EventShape');
  },
}
