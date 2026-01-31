/**
 * Migration: Extend entityType ENUM to include event and annotation entity types
 * Date: 2026-01-31
 * Purpose: Add eventShape, eventInstance, annotationShape, annotationInstance to entityType enum
 *          This enables metadata to use entityType directly instead of configType
 * 
 * LEARNING: Extends entityType enum to support all entity types
 * WHY: Events and annotations are now core entities, need entityType values for them
 * PATTERN: Use ALTER TYPE ... ADD VALUE for each new enum value
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Extending entityType ENUM to include event and annotation entity types...');

    // Add eventShape to enum
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'eventShape' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_admin_metadata_entity_type')
        ) THEN
          ALTER TYPE enum_admin_metadata_entity_type ADD VALUE 'eventShape';
        END IF;
      END $$;
    `);

    // Add eventInstance to enum
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'eventInstance' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_admin_metadata_entity_type')
        ) THEN
          ALTER TYPE enum_admin_metadata_entity_type ADD VALUE 'eventInstance';
        END IF;
      END $$;
    `);

    // Add annotationShape to enum
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'annotationShape' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_admin_metadata_entity_type')
        ) THEN
          ALTER TYPE enum_admin_metadata_entity_type ADD VALUE 'annotationShape';
        END IF;
      END $$;
    `);

    // Add annotationInstance to enum
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'annotationInstance' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_admin_metadata_entity_type')
        ) THEN
          ALTER TYPE enum_admin_metadata_entity_type ADD VALUE 'annotationInstance';
        END IF;
      END $$;
    `);

    console.log('✅ Extended entityType ENUM with eventShape, eventInstance, annotationShape, annotationInstance');
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Cannot remove enum values in PostgreSQL - manual intervention required');
    console.log('   To rollback, manually remove enum values using:');
    console.log('   ALTER TYPE enum_admin_metadata_entity_type DROP VALUE \'eventShape\';');
    console.log('   ALTER TYPE enum_admin_metadata_entity_type DROP VALUE \'eventInstance\';');
    console.log('   ALTER TYPE enum_admin_metadata_entity_type DROP VALUE \'annotationShape\';');
    console.log('   ALTER TYPE enum_admin_metadata_entity_type DROP VALUE \'annotationInstance\';');
  }
};
