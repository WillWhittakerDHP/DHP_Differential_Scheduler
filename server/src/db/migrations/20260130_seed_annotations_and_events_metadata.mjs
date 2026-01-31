/**
 * Migration: Seed metadata for annotations and events relationships
 * Date: 2026-01-30
 * Purpose: Seed metadata entries for validAnnotations, activeAnnotations, and activeEvents
 *          These relationships were added but metadata wasn't seeded
 * 
 * LEARNING: Adds metadata for new relationship collection types
 * WHY: Metadata modals only show fields that exist in database - need to seed these relationships
 * PATTERN: Seed relationship metadata entries matching existing activeParts pattern
 */

import { randomUUID } from 'crypto'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Seeding annotations and events relationship metadata...')

    // Sentinel UUIDs for global configs
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001'
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002'
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'

    const now = new Date()
    const jsonbLiteral = (value) => Sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`)

    // Seed validAnnotations metadata (BlockShape → AnnotationShape)
    await queryInterface.bulkInsert('admin_metadata', [
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'blockShape',
        entity_id: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
        field_key: 'validAnnotations',
        data_type: 'reference',
        label: 'Valid Annotations',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 3,
        render_as: 'relationshipCollection',
        status_button_color: null,
        panel: 'annotations',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'validAnnotations',
          globalField: 'validAnnotations',
          selectedParentKey: 'blockShape',
          selectedChildKey: 'annotationShape',
          selectedChildPath: ['validAnnotations'],
          candidateParentKey: 'blockShape',
          candidateParentPath: [],
          candidateChildKey: 'annotationShape',
          candidateChildPath: [],
          selectType: 'validAnnotationSelect',
          selectMode: 'multiple',
          placeholder: 'No annotation shapes selected',
        }),
        created_at: now,
        updated_at: now,
      },
      // Seed activeAnnotations metadata (BlockInstance → AnnotationInstance)
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'blockInstance',
        entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
        field_key: 'activeAnnotations',
        data_type: 'reference',
        label: 'Active Annotations',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 5,
        render_as: 'relationshipCollection',
        status_button_color: null,
        panel: 'annotations',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'annotationAssignments',
          globalField: 'annotationAssignments',
          selectedParentKey: 'blockInstance',
          selectedChildKey: 'annotationInstance',
          selectedChildPath: ['annotationAssignments'],
          candidateParentKey: 'blockShape',
          candidateParentPath: ['blockShapeRef'],
          candidateChildKey: 'annotationInstance',
          candidateChildPath: [],
          selectType: 'annotationAssignmentSelect',
          selectMode: 'multiple',
          placeholder: 'No annotations selected',
        }),
        created_at: now,
        updated_at: now,
      },
      // Seed activeEvents metadata (BlockShape → EventInstance)
      // LEARNING: ActiveEvent is shape-level, not instance-level
      // WHY: Events are configured at shape level - all instances of a shape inherit the same event configuration
      // PATTERN: Seed for BlockShape (and PartShape if needed) since ActiveEvent links to shapes
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'blockShape',
        entity_id: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
        field_key: 'eventAssignments',
        data_type: 'reference',
        label: 'Event Assignments',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 4,
        render_as: 'relationshipCollection',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'activeEvents',
          globalField: 'activeEvents',
          selectedParentKey: 'blockShape',
          selectedChildKey: 'eventInstance',
          selectedChildPath: ['activeEvents'],
          candidateParentKey: 'blockShape',
          candidateParentPath: [],
          candidateChildKey: 'eventInstance',
          candidateChildPath: [],
          selectType: 'activeEventSelect',
          selectMode: 'multiple',
          placeholder: 'No events selected',
        }),
        created_at: now,
        updated_at: now,
      },
      // Seed activeEvents metadata for PartShape (PartShape → EventInstance)
      // LEARNING: ActiveEvent can link to both BlockShape and PartShape
      // WHY: Events can be configured for both block shapes and part shapes
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'partShape',
        entity_id: PART_SHAPE_GLOBAL_CONFIG_ID,
        field_key: 'eventAssignments',
        data_type: 'reference',
        label: 'Event Assignments',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 1,
        render_as: 'relationshipCollection',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'activeEvents',
          globalField: 'activeEvents',
          selectedParentKey: 'partShape',
          selectedChildKey: 'eventInstance',
          selectedChildPath: ['activeEvents'],
          candidateParentKey: 'partShape',
          candidateParentPath: [],
          candidateChildKey: 'eventInstance',
          candidateChildPath: [],
          selectType: 'activeEventSelect',
          placeholder: 'No events selected',
        }),
        created_at: now,
        updated_at: now,
      },
    ], {
      ignoreDuplicates: true
    })

    console.log('✅ Seeded annotations and events relationship metadata')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting annotations and events relationship metadata seed...')
    
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001'
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002'
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'

    // Delete seeded entries
    await queryInterface.bulkDelete('admin_metadata', {
      entity_id: [
        BLOCK_SHAPE_GLOBAL_CONFIG_ID,
        PART_SHAPE_GLOBAL_CONFIG_ID,
        BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
      ],
      field_key: ['validAnnotations', 'annotationAssignments', 'eventAssignments'],
      metadata_type: 'relationship',
    })
    
    console.log('✅ Reverted annotations and events relationship metadata seed')
  },
}
