/**
 * Migration: Seed admin_relationship_metadata for blockShape relationships
 * Date: 2026-01-14
 * Purpose: Provide relationship field metadata so contexts can be created on initial load
 *
 * LEARNING: Relationship fields live only in metadata (not on entity objects)
 * WHY: Without metadata rows, relationship fields never get contexts on page load
 * PATTERN: Seed global shape config (sentinel UUID) with relationship metadata
 */

import { randomUUID } from 'crypto'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001'
    const now = new Date()
    const jsonbLiteral = (value) => Sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`)

    await queryInterface.bulkInsert('admin_relationship_metadata', [
      {
        id: randomUUID(),
        entity_type: 'blockShape',
        entity_id: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
        relationship_key: 'validCascades',
        data_type: 'reference',
        label: 'Valid Cascades',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 1,
        section: null,
        render_as: 'reference',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'validCascades',
          globalField: 'validCascades',
          selectedParentKey: 'blockShape',
          selectedChildKey: 'blockShape',
          selectedChildPath: ['validCascades'],
          candidateParentKey: 'blockShape',
          candidateParentPath: [],
          candidateChildKey: 'blockShape',
          candidateChildPath: [],
          selectType: 'validCascadeSelect',
          selectMode: 'multiple',
          placeholder: 'No cascades selected',
        }),
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        entity_type: 'blockShape',
        entity_id: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
        relationship_key: 'validConstituents',
        data_type: 'reference',
        label: 'Valid Constituents',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 2,
        section: null,
        render_as: 'reference',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'validConstituents',
          globalField: 'validConstituents',
          selectedParentKey: 'blockShape',
          selectedChildKey: 'partShape',
          selectedChildPath: ['validConstituents'],
          candidateParentKey: 'blockShape',
          candidateParentPath: [],
          candidateChildKey: 'partShape',
          candidateChildPath: [],
          selectType: 'validConstituentSelect',
          selectMode: 'multiple',
          placeholder: 'No constituents selected',
        }),
        created_at: now,
        updated_at: now,
      },
    ])
  },

  async down(queryInterface) {
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001'
    await queryInterface.bulkDelete('admin_relationship_metadata', {
      entity_type: 'blockShape',
      entity_id: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
      relationship_key: ['validCascades', 'validConstituents'],
    })
  },
}
