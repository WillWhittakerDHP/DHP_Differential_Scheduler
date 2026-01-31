/**
 * Migration: Add selectMode to events and annotations metadata
 * Date: 2026-02-03
 * Purpose: Add selectMode: 'multiple' to existing eventAssignments, validAnnotations, and annotationAssignments metadata
 *          These fields were seeded without selectMode, causing errors when rendered as select fields
 * 
 * LEARNING: RelationshipCollection fields still need selectMode in inputConfig
 * WHY: Even though they're rendered as relationshipCollection, they may be used as selects in some contexts
 * PATTERN: Update JSONB field using jsonb_set to add selectMode property
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding selectMode to events and annotations metadata...');

    // Update eventAssignments metadata entries (both blockShape and partShape)
    const [updatedEventAssignments] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{selectMode}',
            '"multiple"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'eventAssignments'
        AND metadata_type = 'relationship'
        AND (input_config->>'selectMode' IS NULL OR input_config->>'selectMode' = '')
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const eventAssignmentsCount = Array.isArray(updatedEventAssignments) ? updatedEventAssignments.length : 0;
    if (eventAssignmentsCount > 0) {
      console.log(`✅ Updated ${eventAssignmentsCount} eventAssignments metadata entries with selectMode: 'multiple'`);
    } else {
      console.log('ℹ️  No eventAssignments metadata entries needed updating');
    }

    // Update validAnnotations metadata entries
    const [updatedValidAnnotations] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{selectMode}',
            '"multiple"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'validAnnotations'
        AND metadata_type = 'relationship'
        AND (input_config->>'selectMode' IS NULL OR input_config->>'selectMode' = '')
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const validAnnotationsCount = Array.isArray(updatedValidAnnotations) ? updatedValidAnnotations.length : 0;
    if (validAnnotationsCount > 0) {
      console.log(`✅ Updated ${validAnnotationsCount} validAnnotations metadata entries with selectMode: 'multiple'`);
    } else {
      console.log('ℹ️  No validAnnotations metadata entries needed updating');
    }

    // Update annotationAssignments metadata entries
    const [updatedAnnotationAssignments] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{selectMode}',
            '"multiple"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'annotationAssignments'
        AND metadata_type = 'relationship'
        AND (input_config->>'selectMode' IS NULL OR input_config->>'selectMode' = '')
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const annotationAssignmentsCount = Array.isArray(updatedAnnotationAssignments) ? updatedAnnotationAssignments.length : 0;
    if (annotationAssignmentsCount > 0) {
      console.log(`✅ Updated ${annotationAssignmentsCount} annotationAssignments metadata entries with selectMode: 'multiple'`);
    } else {
      console.log('ℹ️  No annotationAssignments metadata entries needed updating');
    }

    console.log('✅ Completed adding selectMode to events and annotations metadata');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing selectMode from events and annotations metadata...');

    // Remove selectMode from eventAssignments
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = input_config - 'selectMode',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'eventAssignments'
        AND metadata_type = 'relationship'
        AND input_config->>'selectMode' = 'multiple'
    `);

    // Remove selectMode from validAnnotations
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = input_config - 'selectMode',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'validAnnotations'
        AND metadata_type = 'relationship'
        AND input_config->>'selectMode' = 'multiple'
    `);

    // Remove selectMode from activeAnnotations
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = input_config - 'selectMode',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'annotationAssignments'
        AND metadata_type = 'relationship'
        AND input_config->>'selectMode' = 'multiple'
    `);

    console.log('✅ Removed selectMode from events and annotations metadata');
  },
};
