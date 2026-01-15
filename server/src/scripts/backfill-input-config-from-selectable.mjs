/**
 * Backfill script: Populate admin_input_metadata.input_config from selectableFieldConfig.ts
 * 
 * LEARNING: One-time migration to move select configs from frontend to database
 * WHY: Makes metadata the single source of truth - frontend can delete selectableFieldConfig.ts
 * PATTERN: Read select configs, find matching metadata entries, update input_config
 * 
 * Run with: node server/src/scripts/backfill-input-config-from-selectable.mjs
 */

import { initSequelize } from '../db/index.js';
import { AdminPrimitiveMetadata } from '../db/models/admin/adminPrimitiveMetadata.js';

// Sentinel UUIDs for global configs (matches client constants)
const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';
const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';

// Select configs from selectableFieldConfig.ts (manually extracted for migration)
// LEARNING: These match the structure in client/src/configs/field/form/selectableFieldConfig.ts
const SELECT_CONFIGS = {
  blockInstance: {
    blockShapeRef: {
      targetMode: "property",
      targetKey: "blockShape",
      globalField: "blockShapeRef",
      selectedParentKey: "blockInstance",
      selectedChildKey: "blockShape",
      selectedChildPath: ["blockShapeRef"],
      candidateParentKey: "blockShape",
      candidateParentPath: [],
      candidateChildKey: "blockShape",
      candidateChildPath: [],
      selectType: "BlockShape",
      selectMode: "Required",
      placeholder: "Select a block shape",
    },
    bookingCascades: {
      targetMode: "relationship",
      targetKey: "bookingCascades",
      globalField: "bookingCascades",
      selectedParentKey: "blockInstance",
      selectedChildKey: "blockInstance",
      selectedChildPath: ["bookingCascades"],
      candidateParentKey: "blockShape",
      candidateParentPath: ["blockShapeRef"],
      candidateChildKey: "blockInstance",
      candidateChildPath: [],
      selectType: "BookingCascadeSelect",
      selectMode: "Multiple",
      groupByKey: "blockShapeRef",
      placeholder: "Which block instances are children of this block instance?",
    },
    activeParts: {
      targetMode: "relationship",
      targetKey: "activeParts",
      globalField: "activeParts",
      selectedParentKey: "blockInstance",
      selectedChildKey: "partInstance",
      selectedChildPath: ["activeParts"],
      candidateParentKey: "blockShape",
      candidateParentPath: ["blockShapeRef"],
      candidateChildKey: "partInstance",
      candidateChildPath: [],
      selectType: "ActivePartSelect",
      selectMode: "Nested",
      placeholder: "Which part instances are used by this block instance?",
      optionsFieldKey: "validParts",
    },
    dependentInstanceOptions: {
      targetMode: "relationship",
      targetKey: "dependentInstanceOptions",
      globalField: "dependentInstanceOptions",
      selectedParentKey: "blockInstance",
      selectedChildKey: "blockInstance",
      selectedChildPath: ["dependentInstanceOptions"],
      candidateParentKey: "blockInstance",
      candidateParentPath: ["blockShapeRef"],
      candidateChildKey: "blockInstance",
      candidateChildPath: ["blockShapeRef"],
      selectType: "DependentInstanceOptionSelect",
      selectMode: "Multiple",
      placeholder: "Which block instances are valid as dependent options?",
    },
    instanceComponents: {
      targetMode: "relationship",
      targetKey: "instanceComponents",
      globalField: "instanceComponents",
      selectedParentKey: "blockInstance",
      selectedChildKey: "blockInstance",
      selectedChildPath: ["instanceComponents"],
      candidateParentKey: "blockInstance",
      candidateParentPath: ["blockShapeRef"],
      candidateChildKey: "blockInstance",
      candidateChildPath: ["blockShapeRef"],
      selectType: "InstanceComponentSelect",
      selectMode: "Multiple",
      placeholder: "Select service components...",
    },
    annotations: {
      targetMode: "relationship",
      targetKey: "annotations",
      globalField: "annotations",
      selectedParentKey: "blockInstance",
      selectedChildKey: "annotations",
      selectedChildPath: ["annotations"],
      candidateParentKey: "blockInstance",
      candidateParentPath: [],
      candidateChildKey: "annotations",
      candidateChildPath: [],
      selectType: "DescriptionSelect",
      selectMode: "Multiple",
      placeholder: "Select annotations for this block instance...",
    },
  },
  blockShape: {
    validCascades: {
      targetMode: "relationship",
      targetKey: "validCascades",
      globalField: "validCascades",
      selectedParentKey: "blockShape",
      selectedChildKey: "blockShape",
      selectedChildPath: ["validCascades"],
      candidateParentKey: "blockShape",
      candidateParentPath: [],
      candidateChildKey: "blockShape",
      candidateChildPath: [],
      selectType: "ValidCascadeSelect",
      selectMode: "Multiple",
      placeholder: "Which block shapes are valid as children?",
      dependencyImpact: {
        affectedEntityKey: "blockInstance",
        affectedField: "bookingCascades",
        linkingField: "blockShapeRef",
        displayNames: {
          removedItems: "Block Shapes",
          affectedEntities: "Block Instances",
          affectedField: "booking cascades",
        },
      },
    },
    validParts: {
      targetMode: "relationship",
      targetKey: "validParts",
      globalField: "validParts",
      selectedParentKey: "blockShape",
      selectedChildKey: "partShape",
      selectedChildPath: ["validParts"],
      candidateParentKey: "blockShape",
      candidateParentPath: [],
      candidateChildKey: "partShape",
      candidateChildPath: [],
      selectType: "ValidPartSelect",
      selectMode: "Multiple",
      placeholder: "Which part shapes are valid as children?",
      dependencyImpact: {
        affectedEntityKey: "partInstance",
        affectedField: "activeParts",
        linkingField: "partShapeRef",
        displayNames: {
          removedItems: "Part Shapes",
          affectedEntities: "Part Instances",
          affectedField: "active parts",
        },
      },
    },
  },
  partInstance: {
    partShapeRef: {
      targetMode: "property",
      targetKey: "partShape",
      globalField: "partShapeRef",
      selectedParentKey: "partInstance",
      selectedChildKey: "partShape",
      selectedChildPath: ["partShapeRef"],
      candidateParentKey: "partShape",
      candidateParentPath: [],
      candidateChildKey: "partShape",
      candidateChildPath: [],
      selectType: "PartShape",
      selectMode: "Required",
      placeholder: "Select a part type",
    },
  },
  partShape: {},
};

async function backfillInputConfig() {
  console.log('🔄 Starting input_config backfill from selectableFieldConfig...\n');

  const { sequelize } = await initSequelize();
  console.log('   ✅ Connected to database\n');

  const stats = {
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Process each entity type
    for (const [entityType, fieldConfigs] of Object.entries(SELECT_CONFIGS)) {
      console.log(`📋 Processing ${entityType}...`);
      
      // Determine entityId (sentinel UUID for global configs)
      let entityId;
      if (entityType === 'blockShape') {
        entityId = BLOCK_SHAPE_GLOBAL_CONFIG_ID;
      } else if (entityType === 'partShape') {
        entityId = PART_SHAPE_GLOBAL_CONFIG_ID;
      } else if (entityType === 'partInstance') {
        entityId = PART_INSTANCE_GLOBAL_CONFIG_ID;
      } else if (entityType === 'blockInstance') {
        // LEARNING: blockInstance doesn't have a global config - fields inherit from blockShape
        // WHY: Skip blockInstance - its fields are configured at blockShape level
        // PATTERN: blockInstance select fields (like blockShapeRef) should be configured in blockShape metadata
        console.log('   ⚠️  Skipping blockInstance (fields inherit from blockShape)\n');
        continue;
      } else {
        console.log(`   ⚠️  Unknown entity type: ${entityType}\n`);
        continue;
      }

      // Process each field config
      for (const [fieldKey, selectConfig] of Object.entries(fieldConfigs)) {
        try {
          // Find existing metadata entry
          const metadataEntry = await AdminPrimitiveMetadata.findOne({
            where: {
              entityType: entityType,
              entityId: entityId,
              fieldKey: fieldKey,
            },
          });

          if (!metadataEntry) {
            console.log(`   ⚠️  No metadata entry found for ${entityType}.${fieldKey} - skipping`);
            stats.skipped++;
            continue;
          }

          // Check if inputConfig already exists
          if (metadataEntry.inputConfig) {
            console.log(`   ⚠️  ${entityType}.${fieldKey} already has inputConfig - skipping`);
            stats.skipped++;
            continue;
          }

          // Update metadata entry with inputConfig
          await metadataEntry.update({
            inputConfig: selectConfig,
          });

          console.log(`   ✅ Updated ${entityType}.${fieldKey}`);
          stats.updated++;
        } catch (error) {
          const errorMsg = `Error updating ${entityType}.${fieldKey}: ${error.message}`;
          console.error(`   ❌ ${errorMsg}`);
          stats.errors.push(errorMsg);
        }
      }

      console.log('');
    }

    // Summary
    console.log('📊 Summary:');
    console.log(`   ✅ Updated: ${stats.updated}`);
    console.log(`   ⚠️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log('\n✅ Backfill complete!');
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backfillInputConfig()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export default backfillInputConfig;
