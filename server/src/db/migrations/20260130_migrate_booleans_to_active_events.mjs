/**
 * Migration: Migrate boolean/ternary flags to ActiveEvent relationships
 * Date: 2026-01-30
 * Purpose: 
 * - Convert existing onSite/clientPresent/moveable flags on PartInstance to ActiveEvent relationships
 * - Group by part_shape_ref (shape-level migration)
 * - Create ActiveEvent linking PartShape to EventInstance for each flag that is true/override
 * 
 * LEARNING: Migrates at shape level, not instance level
 * WHY: Events are configured per shape, all instances of a shape inherit the same configuration
 * PATTERN: Group PartInstances by part_shape_ref, create one ActiveEvent per shape if any instance has the flag
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting boolean to ActiveEvent migration...');

    // Check if required tables exist
    const partInstancesExists = await queryInterface.tableExists('part_instances');
    const eventShapesExists = await queryInterface.tableExists('event_shapes');
    const eventInstancesExists = await queryInterface.tableExists('event_instances');
    const activeEventsExists = await queryInterface.tableExists('active_events');

    if (!partInstancesExists) {
      console.log('⚠️  part_instances table does not exist, skipping migration');
      return;
    }

    if (!eventShapesExists || !eventInstancesExists || !activeEventsExists) {
      console.log('⚠️  Event tables do not exist. Run create_event_tables and seed_initial_event_shapes migrations first.');
      return;
    }

    // Get event shape IDs
    const [onSiteShape] = await queryInterface.sequelize.query(`
      SELECT id FROM event_shapes WHERE name = 'OnSite'
    `);
    const [moveableShape] = await queryInterface.sequelize.query(`
      SELECT id FROM event_shapes WHERE name = 'Moveable'
    `);
    const [clientPresentShape] = await queryInterface.sequelize.query(`
      SELECT id FROM event_shapes WHERE name = 'ClientPresent'
    `);

    if (onSiteShape.length === 0 || moveableShape.length === 0 || clientPresentShape.length === 0) {
      console.log('⚠️  Event shapes not found. Run seed_initial_event_shapes migration first.');
      return;
    }

    const onSiteShapeId = onSiteShape[0].id;
    const moveableShapeId = moveableShape[0].id;
    const clientPresentShapeId = clientPresentShape[0].id;

    // Get default event instances for each shape
    const [onSiteInstance] = await queryInterface.sequelize.query(`
      SELECT id FROM event_instances WHERE event_shape_ref = '${onSiteShapeId}' LIMIT 1
    `);
    const [moveableInstance] = await queryInterface.sequelize.query(`
      SELECT id FROM event_instances WHERE event_shape_ref = '${moveableShapeId}' LIMIT 1
    `);
    const [clientPresentInstance] = await queryInterface.sequelize.query(`
      SELECT id FROM event_instances WHERE event_shape_ref = '${clientPresentShapeId}' LIMIT 1
    `);

    if (onSiteInstance.length === 0 || moveableInstance.length === 0 || clientPresentInstance.length === 0) {
      console.log('⚠️  Event instances not found. Run seed_initial_event_shapes migration first.');
      return;
    }

    const onSiteInstanceId = onSiteInstance[0].id;
    const moveableInstanceId = moveableInstance[0].id;
    const clientPresentInstanceId = clientPresentInstance[0].id;

    console.log('📝 Migrating boolean flags to ActiveEvent relationships...');

    // Group PartInstances by part_shape_ref and check for flags
    // For each unique part_shape_ref, check if ANY instance has the flag set to 'true' or 'override'
    const [partShapesWithFlags] = await queryInterface.sequelize.query(`
      SELECT DISTINCT
        part_shape_ref,
        BOOL_OR(on_site IN ('true', 'override')) as has_on_site,
        BOOL_OR(client_present IN ('true', 'override')) as has_client_present,
        BOOL_OR(moveable = true) as has_moveable,
        MAX(CASE WHEN on_site = 'override' THEN 1 ELSE 0 END) as has_on_site_override,
        MAX(CASE WHEN client_present = 'override' THEN 1 ELSE 0 END) as has_client_present_override
      FROM part_instances
      GROUP BY part_shape_ref
    `);

    let onSiteCount = 0;
    let clientPresentCount = 0;
    let moveableCount = 0;

    for (const shape of partShapesWithFlags) {
      const partShapeId = shape.part_shape_ref;

      // Check if ActiveEvent already exists for this shape (avoid duplicates)
      const [existingOnSite] = await queryInterface.sequelize.query(`
        SELECT id FROM active_events 
        WHERE part_shape_id = '${partShapeId}' 
        AND event_instance_id = '${onSiteInstanceId}'
      `);

      if (shape.has_on_site && existingOnSite.length === 0) {
        // Determine ternary value: 'override' if any instance has override, else 'true'
        const ternaryValue = shape.has_on_site_override ? 'override' : 'true';
        
        await queryInterface.sequelize.query(`
          INSERT INTO active_events (id, part_shape_id, event_instance_id, order_index, ternary_value, created_at, updated_at)
          VALUES (gen_random_uuid(), '${partShapeId}', '${onSiteInstanceId}', 0, '${ternaryValue}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        onSiteCount++;
      }

      const [existingClientPresent] = await queryInterface.sequelize.query(`
        SELECT id FROM active_events 
        WHERE part_shape_id = '${partShapeId}' 
        AND event_instance_id = '${clientPresentInstanceId}'
      `);

      if (shape.has_client_present && existingClientPresent.length === 0) {
        const ternaryValue = shape.has_client_present_override ? 'override' : 'true';
        
        await queryInterface.sequelize.query(`
          INSERT INTO active_events (id, part_shape_id, event_instance_id, order_index, ternary_value, created_at, updated_at)
          VALUES (gen_random_uuid(), '${partShapeId}', '${clientPresentInstanceId}', 0, '${ternaryValue}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        clientPresentCount++;
      }

      const [existingMoveable] = await queryInterface.sequelize.query(`
        SELECT id FROM active_events 
        WHERE part_shape_id = '${partShapeId}' 
        AND event_instance_id = '${moveableInstanceId}'
      `);

      if (shape.has_moveable && existingMoveable.length === 0) {
        await queryInterface.sequelize.query(`
          INSERT INTO active_events (id, part_shape_id, event_instance_id, order_index, ternary_value, created_at, updated_at)
          VALUES (gen_random_uuid(), '${partShapeId}', '${moveableInstanceId}', 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        moveableCount++;
      }
    }

    console.log(`   ✅ Created ${onSiteCount} OnSite ActiveEvent relationships`);
    console.log(`   ✅ Created ${clientPresentCount} ClientPresent ActiveEvent relationships`);
    console.log(`   ✅ Created ${moveableCount} Moveable ActiveEvent relationships`);
    console.log('✅ Boolean to ActiveEvent migration completed');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting boolean to ActiveEvent migration...');

    // Get event instance IDs
    const [onSiteShape] = await queryInterface.sequelize.query(`
      SELECT id FROM event_shapes WHERE name = 'OnSite'
    `);
    const [moveableShape] = await queryInterface.sequelize.query(`
      SELECT id FROM event_shapes WHERE name = 'Moveable'
    `);
    const [clientPresentShape] = await queryInterface.sequelize.query(`
      SELECT id FROM event_shapes WHERE name = 'ClientPresent'
    `);

    if (onSiteShape.length > 0 && moveableShape.length > 0 && clientPresentShape.length > 0) {
      const onSiteShapeId = onSiteShape[0].id;
      const moveableShapeId = moveableShape[0].id;
      const clientPresentShapeId = clientPresentShape[0].id;

      // Delete ActiveEvent relationships for these event shapes
      await queryInterface.sequelize.query(`
        DELETE FROM active_events 
        WHERE event_instance_id IN (
          SELECT id FROM event_instances 
          WHERE event_shape_ref IN ('${onSiteShapeId}', '${moveableShapeId}', '${clientPresentShapeId}')
        )
      `);
      console.log('   ✅ Deleted ActiveEvent relationships');
    }

    console.log('✅ Boolean to ActiveEvent migration reverted');
  },
};
