/**
 * Migration: Seed admin_relationship_metadata for blockInstance relationships
 * Date: 2026-01-14
 * Purpose: Provide relationship field metadata so contexts can be created on initial load
 *
 * LEARNING: Relationship fields live only in metadata (not on entity objects)
 * WHY: Without metadata rows, relationship fields never get contexts on page load
 * PATTERN: Seed global instance config (sentinel UUID) with relationship metadata
 */
 
import { randomUUID } from 'crypto'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'
    const now = new Date()
    const jsonbLiteral = (value) => Sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`)

    await queryInterface.bulkInsert('admin_relationship_metadata', [
      {
        id: randomUUID(),
        entity_type: 'blockInstance',
        entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
        relationship_key: 'bookingCascades',
        data_type: 'reference',
        label: 'Booking Cascade',
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
          targetKey: 'bookingCascades',
          globalField: 'bookingCascades',
          selectedParentKey: 'blockInstance',
          selectedChildKey: 'blockInstance',
          selectedChildPath: ['bookingCascades'],
          candidateParentKey: 'blockShape',
          candidateParentPath: ['blockShapeRef'],
          candidateChildKey: 'blockInstance',
          candidateChildPath: [],
          selectType: 'bookingCascadeSelect',
          selectMode: 'multiple',
          groupByKey: 'blockShapeRef',
          placeholder: 'No cascades selected',
        }),
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        entity_type: 'blockInstance',
        entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
        relationship_key: 'activeParts',
        data_type: 'reference',
        label: 'Active Parts',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 2,
        section: null,
        render_as: 'partsCollection',
        status_button_color: null,
        panel: 'parts',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'activeParts',
          globalField: 'activeParts',
          selectedParentKey: 'blockInstance',
          selectedChildKey: 'partInstance',
          selectedChildPath: ['activeParts'],
          candidateParentKey: 'blockShape',
          candidateParentPath: ['blockShapeRef'],
          candidateChildKey: 'partInstance',
          candidateChildPath: [],
          selectType: 'activePartSelect',
          placeholder: 'No parts selected',
        }),
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        entity_type: 'blockInstance',
        entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
        relationship_key: 'dependentInstanceOptions',
        data_type: 'reference',
        label: 'Dependent Instance Options',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 3,
        section: null,
        render_as: 'reference',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'dependentInstanceOptions',
          globalField: 'dependentInstanceOptions',
          selectedParentKey: 'blockInstance',
          selectedChildKey: 'blockInstance',
          selectedChildPath: ['dependentInstanceOptions'],
          candidateParentKey: 'blockInstance',
          candidateParentPath: [],
          candidateChildKey: 'blockInstance',
          candidateChildPath: ['blockShapeRef'],
          selectType: 'dependentInstanceOptionSelect',
          selectMode: 'multiple',
          placeholder: 'No dependent instance options',
        }),
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        entity_type: 'blockInstance',
        entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
        relationship_key: 'instanceComponents',
        data_type: 'reference',
        label: '{blockShapeName} Components',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 4,
        section: null,
        render_as: 'reference',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'instanceComponents',
          globalField: 'instanceComponents',
          selectedParentKey: 'blockInstance',
          selectedChildKey: 'blockInstance',
          selectedChildPath: ['instanceComponents'],
          candidateParentKey: 'blockInstance',
          candidateParentPath: ['dependentInstanceOptions'],
          candidateChildKey: 'blockInstance',
          candidateChildPath: [],
          selectType: 'instanceComponentSelect',
          selectMode: 'multiple',
          placeholder: 'Select components...',
        }),
        created_at: now,
        updated_at: now,
      },
    ])
  },

  async down(queryInterface) {
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'
    await queryInterface.bulkDelete('admin_relationship_metadata', {
      entity_type: 'blockInstance',
      entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
      relationship_key: [
        'bookingCascades',
        'activeParts',
        'dependentInstanceOptions',
        'instanceComponents',
      ],
    })
  },
}
