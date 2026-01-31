/**
 * Migration: Migrate metadata from relationship tables to shape tables
 * Date: 2026-02-03
 * Purpose: Copy metadata (ternaryValue, orderIndex, isDefault) from event_assignments/annotation_assignments to event_shapes/annotation_shapes
 * 
 * LEARNING: Shape tables store metadata as columns
 * WHY: Metadata belongs in shape tables, not in relationship tables
 * PATTERN: Relationships just indicate which shapes are active - metadata lives in shape tables
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting migrate metadata to shape tables migration...');

    // Check if tables exist
    const eventShapesExists = await queryInterface.tableExists('event_shapes');
    const annotationShapesExists = await queryInterface.tableExists('annotation_shapes');
    const eventInstancesExists = await queryInterface.tableExists('event_instances');
    const eventAssignmentsExists = await queryInterface.tableExists('event_assignments');
    const annotationAssignmentsExists = await queryInterface.tableExists('annotation_assignments');

    if (!eventShapesExists || !annotationShapesExists) {
      console.log('⚠️  Shape tables do not exist. Run shape table creation migrations first.');
      return;
    }

    // Migrate event metadata from event_assignments to event_shapes
    if (eventAssignmentsExists && eventInstancesExists) {
      console.log('📝 Migrating event metadata from event_assignments to event_shapes...');
      
      // Check if columns exist before querying (they may have been removed by later migration)
      const eventAssignmentsColumns = await queryInterface.describeTable('event_assignments').catch(() => ({}));
      const hasTernaryValue = 'ternary_value' in eventAssignmentsColumns;
      const hasOrderIndex = 'order_index' in eventAssignmentsColumns;
      
      if (!hasTernaryValue || !hasOrderIndex) {
        console.log('ℹ️  Metadata columns (ternary_value, order_index) do not exist in event_assignments, skipping migration');
        console.log('   This is expected if 20260203_remove_metadata_from_relationship_tables.mjs has already run');
      } else {
        // LEARNING: Aggregate metadata by event_shape
        // WHY: Multiple event_assignments relationships may reference the same event_shape via eventInstance
        // PATTERN: Group by event_shape, use most common or first non-null value for defaults
        // NOTE: PostgreSQL doesn't have MODE() - use array_agg and unnest to find most common value
        const [eventMetadata] = await queryInterface.sequelize.query(`
          WITH ranked_values AS (
            SELECT 
              es.id as event_shape_id,
              es.name as event_shape_name,
              ae.ternary_value,
              ae.order_index,
              COUNT(*) OVER (PARTITION BY es.id, ae.ternary_value) as ternary_count,
              COUNT(*) OVER (PARTITION BY es.id, ae.order_index) as order_count
            FROM event_shapes es
            INNER JOIN event_instances ei ON ei.event_shape_ref = es.id
            INNER JOIN event_assignments ae ON ae.event_instance_id = ei.id
          ),
          aggregated AS (
            SELECT DISTINCT ON (event_shape_id)
              event_shape_id,
              event_shape_name,
              FIRST_VALUE(ternary_value) OVER (PARTITION BY event_shape_id ORDER BY ternary_count DESC, ternary_value) as default_ternary_value,
              FIRST_VALUE(order_index) OVER (PARTITION BY event_shape_id ORDER BY order_count DESC, order_index) as default_order_index
            FROM ranked_values
          )
          SELECT * FROM aggregated
        `);

        // Update event_shapes with aggregated metadata
        for (const metadata of eventMetadata) {
          await queryInterface.sequelize.query(`
            UPDATE event_shapes
            SET 
              default_ternary_value = :ternaryValue::enum_event_shapes_default_ternary_value,
              default_order_index = :orderIndex
            WHERE id = :eventShapeId
          `, {
            replacements: {
              eventShapeId: metadata.event_shape_id,
              ternaryValue: metadata.default_ternary_value || 'true',
              orderIndex: metadata.default_order_index || 0
            }
          });
        }

        console.log(`   ✅ Migrated metadata for ${eventMetadata.length} event shapes`);
      }
    } else {
      console.log('ℹ️  active_events or event_instances table does not exist, skipping event metadata migration');
    }

    // Migrate annotation metadata from annotation_assignments to annotation_shapes
    if (annotationAssignmentsExists) {
      console.log('📝 Migrating annotation metadata from annotation_assignments to annotation_shapes...');
      
      // Check if columns exist before querying (they may have been removed by later migration)
      const annotationAssignmentsColumns = await queryInterface.describeTable('annotation_assignments').catch(() => ({}));
      const hasOrderIndex = 'order_index' in annotationAssignmentsColumns;
      const hasIsDefault = 'is_default' in annotationAssignmentsColumns;
      
      if (!hasOrderIndex || !hasIsDefault) {
        console.log('ℹ️  Metadata columns (order_index, is_default) do not exist in active_annotations, skipping migration');
        console.log('   This is expected if 20260203_remove_metadata_from_relationship_tables.mjs has already run');
      } else {
        // LEARNING: Aggregate metadata by annotation_shape (via annotation_instance.type)
        // WHY: Multiple active_annotations relationships may reference the same annotation_shape
        // PATTERN: Group by annotation_shape, use most common or first non-null value for defaults
        const [annotationMetadata] = await queryInterface.sequelize.query(`
          WITH ranked_values AS (
            SELECT 
              as_table.id as annotation_shape_id,
              as_table.name as annotation_shape_name,
              aa.order_index,
              aa.is_default,
              COUNT(*) OVER (PARTITION BY as_table.id, aa.order_index) as order_count,
              COUNT(*) OVER (PARTITION BY as_table.id, aa.is_default) as default_count
            FROM annotation_shapes as_table
            INNER JOIN annotation_instances ai ON ai.type = as_table.id
            INNER JOIN active_annotations aa ON aa.annotation_id = ai.id
          ),
          aggregated AS (
            SELECT DISTINCT ON (annotation_shape_id)
              annotation_shape_id,
              annotation_shape_name,
              FIRST_VALUE(order_index) OVER (PARTITION BY annotation_shape_id ORDER BY order_count DESC, order_index) as default_order_index,
              FIRST_VALUE(is_default) OVER (PARTITION BY annotation_shape_id ORDER BY default_count DESC, is_default) as default_is_default
            FROM ranked_values
          )
          SELECT * FROM aggregated
        `);

        // Update annotation_shapes with aggregated metadata
        for (const metadata of annotationMetadata) {
          await queryInterface.sequelize.query(`
            UPDATE annotation_shapes
            SET 
              default_order_index = :orderIndex,
              default_is_default = :isDefault
            WHERE id = :annotationShapeId
          `, {
            replacements: {
              annotationShapeId: metadata.annotation_shape_id,
              orderIndex: metadata.default_order_index || 0,
              isDefault: metadata.default_is_default || false
            }
          });
        }

        console.log(`   ✅ Migrated metadata for ${annotationMetadata.length} annotation shapes`);
      }
    } else {
      console.log('ℹ️  annotation_assignments table does not exist, skipping annotation metadata migration');
    }

    console.log('✅ Migration completed: metadata migrated to shape tables');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back migrate metadata to shape tables migration...');
    
    // Clear metadata columns in shape tables
    const eventShapesExists = await queryInterface.tableExists('event_shapes');
    if (eventShapesExists) {
      await queryInterface.sequelize.query(`
        UPDATE event_shapes
        SET default_ternary_value = NULL, default_order_index = NULL
      `);
      console.log('   ✅ Cleared event_shapes metadata');
    }

    const annotationShapesExists = await queryInterface.tableExists('annotation_shapes');
    if (annotationShapesExists) {
      await queryInterface.sequelize.query(`
        UPDATE annotation_shapes
        SET default_order_index = NULL, default_is_default = NULL
      `);
      console.log('   ✅ Cleared annotation_shapes metadata');
    }

    console.log('✅ Rollback completed');
  }
};
