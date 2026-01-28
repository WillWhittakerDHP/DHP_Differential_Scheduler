/**
 * Migration: Update constituents to parts in admin_relationship_metadata
 * Date: 2026-02-01
 * Purpose: Update any remaining relationship_key and label values from old naming
 *          (validConstituents → validParts, activeConstituents → activeParts)
 * 
 * LEARNING: This migration fixes any database records that may have been created
 *           before the renaming migrations ran, or were created manually with old names
 * WHY: Ensures consistency - all relationship metadata should use new naming
 * PATTERN: Update both relationship_key and label fields, plus JSONB input_config fields
 * 
 * NOTE: This migration is idempotent - safe to run multiple times
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Updating relationship_key and label values from constituents to parts...');

    // Check for records with old relationship_key values
    const [oldKeys] = await queryInterface.sequelize.query(`
      SELECT id, entity_type, entity_id, relationship_key, label
      FROM admin_relationship_metadata
      WHERE relationship_key IN ('validConstituents', 'activeConstituents')
      ORDER BY entity_type, entity_id, relationship_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(oldKeys) && oldKeys.length > 0) {
      console.log(`📋 Found ${oldKeys.length} records with old relationship_key values:`);
      oldKeys.forEach(entry => {
        console.log(`   - ${entry.entity_type}/${entry.entity_id}: ${entry.relationship_key} (label: "${entry.label}")`);
      });

      // Update relationship_key: validConstituents → validParts
      const [updatedValid] = await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata
        SET relationship_key = 'validParts',
            updated_at = CURRENT_TIMESTAMP
        WHERE relationship_key = 'validConstituents'
        RETURNING id, entity_type, entity_id, relationship_key
      `, {
        type: Sequelize.QueryTypes.UPDATE,
      });

      const validCount = Array.isArray(updatedValid) ? updatedValid.length : 0;
      if (validCount > 0) {
        console.log(`✅ Updated ${validCount} records: validConstituents → validParts`);
      }

      // Update relationship_key: activeConstituents → activeParts
      const [updatedActive] = await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata
        SET relationship_key = 'activeParts',
            updated_at = CURRENT_TIMESTAMP
        WHERE relationship_key = 'activeConstituents'
        RETURNING id, entity_type, entity_id, relationship_key
      `, {
        type: Sequelize.QueryTypes.UPDATE,
      });

      const activeCount = Array.isArray(updatedActive) ? updatedActive.length : 0;
      if (activeCount > 0) {
        console.log(`✅ Updated ${activeCount} records: activeConstituents → activeParts`);
      }
    } else {
      console.log('✅ No records found with old relationship_key values');
    }

    // Check for records with old label values (case-insensitive and trim whitespace)
    const [oldLabels] = await queryInterface.sequelize.query(`
      SELECT id, entity_type, entity_id, relationship_key, label
      FROM admin_relationship_metadata
      WHERE LOWER(TRIM(label)) IN ('valid constituents', 'active constituents')
         OR label ILIKE '%constituents%'
      ORDER BY entity_type, entity_id, relationship_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(oldLabels) && oldLabels.length > 0) {
      console.log(`📋 Found ${oldLabels.length} records with old label values:`);
      oldLabels.forEach(entry => {
        console.log(`   - ${entry.entity_type}/${entry.entity_id}: ${entry.relationship_key} (label: "${entry.label}")`);
      });

      // Update label: 'Valid Constituents' (case-insensitive) → 'Valid Parts'
      const [updatedValidLabel] = await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata
        SET label = 'Valid Parts',
            updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(TRIM(label)) = 'valid constituents'
           OR (relationship_key = 'validParts' AND label ILIKE '%constituents%')
        RETURNING id, entity_type, entity_id, relationship_key, label
      `, {
        type: Sequelize.QueryTypes.UPDATE,
      });

      const validLabelCount = Array.isArray(updatedValidLabel) ? updatedValidLabel.length : 0;
      if (validLabelCount > 0) {
        console.log(`✅ Updated ${validLabelCount} labels: 'Valid Constituents' → 'Valid Parts'`);
      }

      // Update label: 'Active Constituents' (case-insensitive) → 'Active Parts'
      const [updatedActiveLabel] = await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata
        SET label = 'Active Parts',
            updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(TRIM(label)) = 'active constituents'
           OR (relationship_key = 'activeParts' AND label ILIKE '%constituents%')
        RETURNING id, entity_type, entity_id, relationship_key, label
      `, {
        type: Sequelize.QueryTypes.UPDATE,
      });

      const activeLabelCount = Array.isArray(updatedActiveLabel) ? updatedActiveLabel.length : 0;
      if (activeLabelCount > 0) {
        console.log(`✅ Updated ${activeLabelCount} labels: 'Active Constituents' → 'Active Parts'`);
      }
    } else {
      console.log('✅ No records found with old label values');
    }

    // Update input_config JSONB fields that reference old relationship keys
    // LEARNING: PostgreSQL JSONB update syntax for nested properties
    // WHY: input_config.targetKey and input_config.globalField may contain old values
    // PATTERN: Use jsonb_set to update nested JSONB properties
    const [updatedInputConfig] = await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{targetKey}',
            '"validParts"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'targetKey' = 'validConstituents'
      RETURNING id, entity_type, entity_id, relationship_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const inputConfigValidCount = Array.isArray(updatedInputConfig) ? updatedInputConfig.length : 0;
    if (inputConfigValidCount > 0) {
      console.log(`✅ Updated ${inputConfigValidCount} input_config.targetKey: validConstituents → validParts`);
    }

    // Update input_config.globalField for validConstituents
    const [updatedGlobalFieldValid] = await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{globalField}',
            '"validParts"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'globalField' = 'validConstituents'
      RETURNING id, entity_type, entity_id, relationship_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const globalFieldValidCount = Array.isArray(updatedGlobalFieldValid) ? updatedGlobalFieldValid.length : 0;
    if (globalFieldValidCount > 0) {
      console.log(`✅ Updated ${globalFieldValidCount} input_config.globalField: validConstituents → validParts`);
    }

    // Update input_config.targetKey for activeConstituents
    const [updatedInputConfigActive] = await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{targetKey}',
            '"activeParts"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'targetKey' = 'activeConstituents'
      RETURNING id, entity_type, entity_id, relationship_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const inputConfigActiveCount = Array.isArray(updatedInputConfigActive) ? updatedInputConfigActive.length : 0;
    if (inputConfigActiveCount > 0) {
      console.log(`✅ Updated ${inputConfigActiveCount} input_config.targetKey: activeConstituents → activeParts`);
    }

    // Update input_config.globalField for activeConstituents
    const [updatedGlobalFieldActive] = await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{globalField}',
            '"activeParts"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'globalField' = 'activeConstituents'
      RETURNING id, entity_type, entity_id, relationship_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const globalFieldActiveCount = Array.isArray(updatedGlobalFieldActive) ? updatedGlobalFieldActive.length : 0;
    if (globalFieldActiveCount > 0) {
      console.log(`✅ Updated ${globalFieldActiveCount} input_config.globalField: activeConstituents → activeParts`);
    }

    // Final verification (case-insensitive check for labels)
    const [remainingDetails] = await queryInterface.sequelize.query(`
      SELECT id, entity_type, entity_id, relationship_key, label, 
             input_config->>'targetKey' as target_key,
             input_config->>'globalField' as global_field
      FROM admin_relationship_metadata
      WHERE relationship_key IN ('validConstituents', 'activeConstituents')
         OR LOWER(TRIM(label)) IN ('valid constituents', 'active constituents')
         OR label ILIKE '%constituents%'
         OR (input_config->>'targetKey' IN ('validConstituents', 'activeConstituents'))
         OR (input_config->>'globalField' IN ('validConstituents', 'activeConstituents'))
      ORDER BY entity_type, entity_id, relationship_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const remainingCount = Array.isArray(remainingDetails) ? remainingDetails.length : 0;
    if (remainingCount > 0) {
      console.log(`⚠️  Warning: ${remainingCount} records still contain old values:`);
      remainingDetails.forEach(entry => {
        console.log(`   - ${entry.entity_type}/${entry.entity_id}: relationship_key="${entry.relationship_key}", label="${entry.label}", targetKey="${entry.target_key}", globalField="${entry.global_field}"`);
      });
      console.log('   These records may need manual review or the migration queries need adjustment');
    } else {
      console.log('✅ Migration complete - all old values have been updated');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Reversing constituents to parts update...');
    console.log('   Note: This will restore old naming, but new naming is preferred');

    // Reverse relationship_key updates
    await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET relationship_key = 'validConstituents',
          updated_at = CURRENT_TIMESTAMP
      WHERE relationship_key = 'validParts'
        AND (entity_type = 'blockShape' OR entity_type = 'partShape')
    `);

    await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET relationship_key = 'activeConstituents',
          updated_at = CURRENT_TIMESTAMP
      WHERE relationship_key = 'activeParts'
        AND (entity_type = 'blockInstance' OR entity_type = 'partInstance')
    `);

    // Reverse label updates
    await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET label = 'Valid Constituents',
          updated_at = CURRENT_TIMESTAMP
      WHERE label = 'Valid Parts'
        AND relationship_key = 'validConstituents'
    `);

    await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET label = 'Active Constituents',
          updated_at = CURRENT_TIMESTAMP
      WHERE label = 'Active Parts'
        AND relationship_key = 'activeConstituents'
    `);

    // Reverse input_config updates
    await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{targetKey}',
            '"validConstituents"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'targetKey' = 'validParts'
        AND relationship_key = 'validConstituents'
    `);

    await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{globalField}',
            '"validConstituents"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'globalField' = 'validParts'
        AND relationship_key = 'validConstituents'
    `);

    await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{targetKey}',
            '"activeConstituents"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'targetKey' = 'activeParts'
        AND relationship_key = 'activeConstituents'
    `);

    await queryInterface.sequelize.query(`
      UPDATE admin_relationship_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{globalField}',
            '"activeConstituents"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'globalField' = 'activeParts'
        AND relationship_key = 'activeConstituents'
    `);

    console.log('✅ Down migration complete');
  },
};
