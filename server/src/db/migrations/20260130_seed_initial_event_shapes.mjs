/**
 * Migration: Seed initial event shapes
 * Date: 2026-01-30
 * Purpose: 
 * - Create initial EventShapes: "OnSite", "Moveable", "ClientPresent"
 * - Create default EventInstances for each shape with basic templates
 * 
 * LEARNING: Seeds the foundational event shapes that replace hardcoded boolean flags
 * WHY: Provides initial event configuration that matches existing boolean behavior
 * PATTERN: Seed migration following annotation pattern
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting initial event shapes seed migration...');

    // Check if event_shapes table exists
    const eventShapesExists = await queryInterface.tableExists('event_shapes');
    if (!eventShapesExists) {
      console.log('⚠️  event_shapes table does not exist. Run create_event_tables migration first.');
      return;
    }

    // Check if shapes already exist
    const [existingShapes] = await queryInterface.sequelize.query(`
      SELECT name FROM event_shapes WHERE name IN ('OnSite', 'Moveable', 'ClientPresent')
    `);

    if (existingShapes.length > 0) {
      console.log(`ℹ️  Found ${existingShapes.length} existing event shapes, skipping seed`);
      return;
    }

    // Create EventShapes
    console.log('📝 Creating initial event shapes...');
    
    const [onSiteShape] = await queryInterface.sequelize.query(`
      INSERT INTO event_shapes (id, name, created_at, updated_at)
      VALUES (gen_random_uuid(), 'OnSite', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `);
    const onSiteShapeId = onSiteShape[0].id;
    console.log(`   ✅ Created EventShape: OnSite (${onSiteShapeId})`);

    const [moveableShape] = await queryInterface.sequelize.query(`
      INSERT INTO event_shapes (id, name, created_at, updated_at)
      VALUES (gen_random_uuid(), 'Moveable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `);
    const moveableShapeId = moveableShape[0].id;
    console.log(`   ✅ Created EventShape: Moveable (${moveableShapeId})`);

    const [clientPresentShape] = await queryInterface.sequelize.query(`
      INSERT INTO event_shapes (id, name, created_at, updated_at)
      VALUES (gen_random_uuid(), 'ClientPresent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `);
    const clientPresentShapeId = clientPresentShape[0].id;
    console.log(`   ✅ Created EventShape: ClientPresent (${clientPresentShapeId})`);

    // Check if event_instances table exists
    const eventInstancesExists = await queryInterface.tableExists('event_instances');
    if (!eventInstancesExists) {
      console.log('⚠️  event_instances table does not exist. Run create_event_tables migration first.');
      return;
    }

    // Create default EventInstances with templates
    console.log('📝 Creating default event instances...');

    await queryInterface.sequelize.query(`
      INSERT INTO event_instances (id, event_shape_ref, name, title_template, description_template, location_template, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        '${onSiteShapeId}',
        'Default OnSite Template',
        '{service} on {propertyType}',
        '{clientName} - {propertyAddress}',
        '{propertyAddress}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Created EventInstance for OnSite');

    await queryInterface.sequelize.query(`
      INSERT INTO event_instances (id, event_shape_ref, name, title_template, description_template, location_template, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        '${moveableShapeId}',
        'Default Moveable Template',
        '{service} - Moveable',
        '{clientName} - Flexible scheduling',
        '{propertyAddress}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Created EventInstance for Moveable');

    await queryInterface.sequelize.query(`
      INSERT INTO event_instances (id, event_shape_ref, name, title_template, description_template, location_template, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        '${clientPresentShapeId}',
        'Default ClientPresent Template',
        '{service} - Client Present',
        '{clientName} present at {propertyAddress}',
        '{propertyAddress}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Created EventInstance for ClientPresent');

    console.log('✅ Initial event shapes seed migration completed');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting initial event shapes seed migration...');

    // Delete event instances first (due to foreign key constraints)
    await queryInterface.sequelize.query(`
      DELETE FROM event_instances 
      WHERE event_shape_ref IN (
        SELECT id FROM event_shapes WHERE name IN ('OnSite', 'Moveable', 'ClientPresent')
      )
    `);
    console.log('   ✅ Deleted event instances');

    // Delete event shapes
    await queryInterface.sequelize.query(`
      DELETE FROM event_shapes 
      WHERE name IN ('OnSite', 'Moveable', 'ClientPresent')
    `);
    console.log('   ✅ Deleted event shapes');

    console.log('✅ Initial event shapes seed migration reverted');
  },
};
