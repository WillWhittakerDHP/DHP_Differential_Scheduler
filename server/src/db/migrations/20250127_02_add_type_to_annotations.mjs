/**
 * Migration: Add type column to annotations table
 * Date: 2025-01-27
 * Purpose: 
 * - Add type column to annotations table (foreign key to annotation_types)
 * - Set default type to 'frontPage' for all existing annotations
 * - Add index on type field for filtering
 * 
 * LEARNING: This migration:
 * - Adds foreign key relationship to annotation_types table
 * - Migrates existing annotations to default 'frontPage' type
 * - Ensures data integrity with foreign key constraints
 * 
 * WHY: 
 * - Enables type-based filtering and organization of annotations
 * - Provides data integrity through foreign key constraints
 * - Defaults existing annotations to 'frontPage' for backward compatibility
 * 
 * PATTERN: Column addition migration with data migration and foreign key
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting annotations type column migration...');

    // Step 1: Ensure annotation_types table exists and has 'frontPage' type
    const annotationTypesExists = await queryInterface.tableExists('annotation_types');
    
    if (!annotationTypesExists) {
      throw new Error('annotation_types table must exist before adding type column to annotations. Run annotation_types migration first.');
    }

    // Get frontPage type ID, create it if it doesn't exist
    let frontPageTypeResult = await queryInterface.sequelize.query(`
      SELECT id FROM annotation_types WHERE name = 'frontPage' LIMIT 1
    `, {
      type: Sequelize.QueryTypes.SELECT
    });

    let frontPageType = Array.isArray(frontPageTypeResult) 
      ? frontPageTypeResult[0] 
      : (frontPageTypeResult?.[0] || null);

    let frontPageTypeId;
    
    if (!frontPageType) {
      // Create frontPage type if it doesn't exist
      console.log('📝 Creating frontPage annotation type...');
      const insertResult = await queryInterface.sequelize.query(`
        INSERT INTO annotation_types (id, name, created_at, updated_at)
        VALUES (gen_random_uuid(), 'frontPage', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, {
        type: Sequelize.QueryTypes.INSERT
      });
      
      frontPageTypeId = Array.isArray(insertResult) && insertResult[0] && insertResult[0][0]
        ? insertResult[0][0].id
        : (insertResult?.[0]?.[0]?.id || null);
      
      if (!frontPageTypeId) {
        // Try alternative query format
        const selectResult = await queryInterface.sequelize.query(`
          SELECT id FROM annotation_types WHERE name = 'frontPage' LIMIT 1
        `, {
          type: Sequelize.QueryTypes.SELECT
        });
        frontPageTypeId = Array.isArray(selectResult) && selectResult[0]
          ? selectResult[0].id
          : (selectResult?.[0]?.id || null);
      }
      
      if (!frontPageTypeId) {
        throw new Error('Failed to create frontPage annotation type');
      }
      console.log(`   ✅ Created frontPage type with ID: ${frontPageTypeId}`);
    } else {
      frontPageTypeId = frontPageType.id;
    }
    console.log(`✅ Found frontPage type ID: ${frontPageTypeId}`);

    // Step 2: Check if type column already exists
    const tableDescription = await queryInterface.describeTable('annotations');
    const typeColumnExists = tableDescription.type !== undefined;

    if (!typeColumnExists) {
      // Step 3: Add type column (nullable initially for data migration)
      console.log('📝 Adding type column to annotations table...');
      await queryInterface.addColumn('annotations', 'type', {
        type: Sequelize.UUID,
        allowNull: true, // Temporarily nullable for data migration
        references: {
          model: 'annotation_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevent deletion of types that are in use
      });
      console.log('   ✅ Column added');

      // Step 4: Set all existing annotations to 'frontPage' type
      console.log('📝 Setting all existing annotations to frontPage type...');
      const updateResult = await queryInterface.sequelize.query(`
        UPDATE annotations
        SET type = :frontPageTypeId
        WHERE type IS NULL
      `, {
        replacements: { frontPageTypeId },
        type: Sequelize.QueryTypes.UPDATE
      });
      console.log('   ✅ Existing annotations updated');

      // Step 5: Make type column NOT NULL now that all rows have values
      console.log('📝 Making type column NOT NULL...');
      await queryInterface.changeColumn('annotations', 'type', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'annotation_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });
      console.log('   ✅ Column set to NOT NULL');

      // Step 6: Add index on type field for filtering
      console.log('📝 Adding index on type field...');
      await queryInterface.addIndex('annotations', ['type'], {
        name: 'idx_annotations_type',
      });
      console.log('   ✅ Index added');

      console.log('✅ Migration complete!');
    } else {
      console.log('ℹ️  type column already exists in annotations table, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back annotations type column migration...');

    // Remove index first
    try {
      await queryInterface.removeIndex('annotations', 'idx_annotations_type');
    } catch (e) {
      console.log('   ℹ️  Index already removed or doesn\'t exist');
    }

    // Remove foreign key constraint (PostgreSQL requires explicit removal)
    const constraintsResult = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'annotations'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%type%'
    `, {
      type: Sequelize.QueryTypes.SELECT
    });

    const constraints = Array.isArray(constraintsResult)
      ? constraintsResult
      : (constraintsResult?.[0] || []);

    if (constraints.length > 0) {
      for (const constraint of constraints) {
        await queryInterface.sequelize.query(`
          ALTER TABLE annotations
          DROP CONSTRAINT IF EXISTS ${constraint.constraint_name}
        `);
      }
      console.log('   ✅ Foreign key constraints removed');
    }

    // Remove type column
    const tableDescription = await queryInterface.describeTable('annotations');
    if (tableDescription.type !== undefined) {
      await queryInterface.removeColumn('annotations', 'type');
      console.log('   ✅ Column removed');
    } else {
      console.log('   ℹ️  type column does not exist, skipping');
    }

    console.log('✅ Rollback complete!');
  }
};

