/**
 * Migration: Unify metadata tables into admin_input_metadata
 * Date: 2026-01-18
 * Purpose: Merge field_metadata and entity_layout_config into single admin_input_metadata table
 *          Simplifies schema by removing redundant fields and unifying all entity types
 * 
 * LEARNING: Single table for all admin input metadata
 * WHY: Eliminates special casing, supports inheritance, clearer architecture
 * PATTERN: Unified table with inheritance support for instances
 * 
 * Changes:
 * - Merge field_metadata + entity_layout_config → admin_input_metadata
 * - Remove control_type (redundant with render_as)
 * - Remove help_text, validation_rules, default_value (simplified schema)
 * - Add inherits_from_entity_type and inherits_from_entity_id for instance inheritance
 * - render_as expanded to include all control types + 'statusButton'
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting metadata table unification...');

    // Create ENUM types for new table
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Entity type enum (includes instance types)
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_input_metadata_entity_type') THEN
          CREATE TYPE enum_admin_input_metadata_entity_type AS ENUM (
            'blockShape', 'partShape', 'blockInstance', 'partInstance'
          );
        END IF;
        
        -- Data type enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_input_metadata_data_type') THEN
          CREATE TYPE enum_admin_input_metadata_data_type AS ENUM (
            'string', 'number', 'boolean', 'array', 'reference'
          );
        END IF;
        
        -- Visibility enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_input_metadata_visibility') THEN
          CREATE TYPE enum_admin_input_metadata_visibility AS ENUM (
            'titleRow', 'expandedDirect', 'expandedPanel', 'hidden', 'notConfigured'
          );
        END IF;
        
        -- Layout enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_input_metadata_layout') THEN
          CREATE TYPE enum_admin_input_metadata_layout AS ENUM (
            'inline', 'stacked'
          );
        END IF;
        
        -- Render as enum (includes all control types + statusButton)
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_input_metadata_render_as') THEN
          CREATE TYPE enum_admin_input_metadata_render_as AS ENUM (
            'text', 'number', 'toggle', 'select', 'multiselect', 'reference', 'statusButton'
          );
        END IF;
        
        -- Panel enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_input_metadata_panel') THEN
          CREATE TYPE enum_admin_input_metadata_panel AS ENUM (
            'none', 'parts', 'relationships', 'annotations'
          );
        END IF;
      END $$;
    `);
    console.log('✅ Created ENUM types for admin_input_metadata');

    // Create unified admin_input_metadata table
    await queryInterface.createTable('admin_input_metadata', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.ENUM('blockShape', 'partShape', 'blockInstance', 'partInstance'),
        allowNull: false,
        field: 'entity_type',
        comment: 'Entity type for this metadata entry',
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'entity_id',
        comment: 'Entity ID or sentinel UUID for global configs',
      },
      field_key: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'field_key',
        comment: 'Field name/key (e.g., name, active, composable)',
      },
      // Canonical properties
      data_type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'array', 'reference'),
        allowNull: false,
        field: 'data_type',
        comment: 'Field data type',
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Human-readable label',
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_required',
        comment: 'Whether field is required',
      },
      // Layout/rendering properties (merged)
      visibility: {
        type: Sequelize.ENUM('titleRow', 'expandedDirect', 'expandedPanel', 'hidden', 'notConfigured'),
        allowNull: false,
        defaultValue: 'notConfigured',
        comment: 'Field visibility setting',
      },
      layout: {
        type: Sequelize.ENUM('inline', 'stacked'),
        allowNull: false,
        defaultValue: 'stacked',
        comment: 'Layout within section',
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 999, // High number = "not configured" (appears last)
        field: 'display_order',
        comment: 'Display order (lower = first). 999 = not configured.',
      },
      section: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Optional section/group name',
      },
      render_as: {
        type: Sequelize.ENUM('text', 'number', 'toggle', 'select', 'multiselect', 'reference', 'statusButton'),
        allowNull: false,
        defaultValue: 'text',
        field: 'render_as',
        comment: 'How to render the field (control type + statusButton)',
      },
      status_button_color: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'status_button_color',
        comment: 'Color for statusButton rendering (Vuetify color name)',
      },
      panel: {
        type: Sequelize.ENUM('none', 'parts', 'relationships', 'annotations'),
        allowNull: false,
        defaultValue: 'none',
        comment: 'Panel name for expandedPanel visibility',
      },
      bulk_edit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'bulk_edit',
        comment: 'Whether field can be bulk edited',
      },
      // Inheritance
      inherits_from_entity_type: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'inherits_from_entity_type',
        comment: 'For instances: parent entity type (blockShape or partShape)',
      },
      inherits_from_entity_id: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'inherits_from_entity_id',
        comment: 'For instances: parent entity ID (shape ID)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    });

    // Create indexes (check if they exist first to avoid errors)
    // Note: Unique constraint may be created automatically by Sequelize, so we handle "already exists" errors
    const createIndexIfNotExists = async (tableName, fields, options) => {
      try {
        await queryInterface.addIndex(tableName, fields, options);
      } catch (err) {
        // Check if error is about index already existing
        const errorMessage = err?.message || err?.parent?.message || err?.original?.message || '';
        if (errorMessage.includes('already exists') || errorMessage.includes('relation') && errorMessage.includes('already exists')) {
          console.log(`ℹ️  Index ${options.name} already exists, skipping`);
          return;
        }
        // Re-throw if it's a different error
        throw err;
      }
    };

    await createIndexIfNotExists('admin_input_metadata', ['entity_type', 'entity_id', 'field_key'], {
      unique: true,
      name: 'admin_input_metadata_entity_field_unique',
    });

    await createIndexIfNotExists('admin_input_metadata', ['entity_type', 'entity_id'], {
      name: 'admin_input_metadata_entity_idx',
    });

    await createIndexIfNotExists('admin_input_metadata', ['field_key'], {
      name: 'admin_input_metadata_field_key_idx',
    });

    await createIndexIfNotExists('admin_input_metadata', ['inherits_from_entity_type', 'inherits_from_entity_id'], {
      name: 'admin_input_metadata_inheritance_idx',
    });

    console.log('✅ Created admin_input_metadata table with indexes');

    // Migrate data from field_metadata and entity_layout_config
    console.log('🔄 Migrating data from old tables...');

    // Sentinel UUIDs for global shape configurations
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';

    // Step 1: Migrate canonical metadata from field_metadata for shape entities only
    // Instance entities will inherit from shapes (handled in application code)
    const fieldMetadataExists = await queryInterface.tableExists('field_metadata');
    if (fieldMetadataExists) {
      const canonicalMetadataResult = await queryInterface.sequelize.query(
        `SELECT * FROM field_metadata 
         WHERE entity_type IN ('blockShape', 'partShape')
         ORDER BY entity_type, display_order, field_key`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Sequelize returns [results, metadata] with QueryTypes.SELECT
      // Extract the results array and ensure it's always an array
      let metadataArray = [];
      if (Array.isArray(canonicalMetadataResult) && canonicalMetadataResult.length > 0) {
        // If it's a tuple [results, metadata], get the first element (results)
        metadataArray = Array.isArray(canonicalMetadataResult[0]) 
          ? canonicalMetadataResult[0] 
          : canonicalMetadataResult;
      } else if (Array.isArray(canonicalMetadataResult)) {
        // If it's already just the results array
        metadataArray = canonicalMetadataResult;
      }
      
      for (const meta of metadataArray) {
        // Map entity_type to sentinel UUID
        const entityId = meta.entity_type === 'blockShape' 
          ? BLOCK_SHAPE_GLOBAL_CONFIG_ID 
          : PART_SHAPE_GLOBAL_CONFIG_ID;

        // Map controlType to renderAs (controlType maps directly, except statusButton comes from layout config)
        let renderAs = meta.control_type; // 'text' | 'number' | 'toggle' | 'select' | 'multiselect' | 'reference'

        // Get layout config for this field if it exists
        const layoutConfigsResult = await queryInterface.sequelize.query(
          `SELECT * FROM entity_layout_config 
           WHERE entity_id = :entityId AND entity_type = :entityType AND field_key = :fieldKey
           LIMIT 1`,
          {
            replacements: {
              entityId: entityId,
              entityType: meta.entity_type,
              fieldKey: meta.field_key,
            },
            type: Sequelize.QueryTypes.SELECT,
          }
        );
        
        // Sequelize returns [results, metadata] with QueryTypes.SELECT
        let layoutConfigs = [];
        if (Array.isArray(layoutConfigsResult) && layoutConfigsResult.length > 0) {
          layoutConfigs = Array.isArray(layoutConfigsResult[0]) 
            ? layoutConfigsResult[0] 
            : layoutConfigsResult;
        } else if (Array.isArray(layoutConfigsResult)) {
          layoutConfigs = layoutConfigsResult;
        }
        const layoutConfig = layoutConfigs && layoutConfigs.length > 0 ? layoutConfigs[0] : null;
        
        // Override renderAs if layout config specifies statusButton
        if (layoutConfig && layoutConfig.render_as === 'statusButton') {
          renderAs = 'statusButton';
        }

        // Insert shape entity metadata (use ON CONFLICT to handle duplicates from previous runs)
        const insertId = meta.id || null;
        await queryInterface.sequelize.query(
          `INSERT INTO admin_input_metadata (
            id, entity_type, entity_id, field_key, data_type, label, is_required,
            visibility, layout, display_order, section, render_as, status_button_color,
            panel, bulk_edit, inherits_from_entity_type, inherits_from_entity_id,
            created_at, updated_at
          ) VALUES (
            COALESCE(:id, gen_random_uuid()), :entity_type, :entity_id, :field_key, :data_type, :label, :is_required,
            :visibility, :layout, :display_order, :section, :render_as, :status_button_color,
            :panel, :bulk_edit, :inherits_from_entity_type, :inherits_from_entity_id,
            :created_at, :updated_at
          ) ON CONFLICT (id) DO NOTHING`,
          {
            replacements: {
              id: insertId,
              entity_type: meta.entity_type,
              entity_id: entityId,
              field_key: meta.field_key,
              data_type: meta.data_type,
              label: meta.label,
              is_required: meta.is_required || false,
              visibility: layoutConfig?.visibility || 'notConfigured',
              layout: layoutConfig?.layout || 'stacked',
              display_order: layoutConfig?.order ?? meta.display_order ?? 0,
              section: layoutConfig?.section || null,
              render_as: renderAs,
              status_button_color: layoutConfig?.status_button_color || null,
              panel: layoutConfig?.panel || 'none',
              bulk_edit: layoutConfig?.bulk_edit || false,
              inherits_from_entity_type: null,
              inherits_from_entity_id: null,
              created_at: meta.created_at || new Date(),
              updated_at: meta.updated_at || new Date(),
            },
            type: Sequelize.QueryTypes.INSERT,
          }
        );
      }
      console.log('✅ Migrated canonical metadata from field_metadata for shape entities');
    }

    // Step 2: Migrate layout configs from entity_layout_config
    // For shape entities: update existing entries (already migrated in Step 1)
    // For instance entities: create override entries with inheritance
    const layoutConfigExists = await queryInterface.tableExists('entity_layout_config');
    if (layoutConfigExists) {
      const layoutConfigsResult = await queryInterface.sequelize.query(
        `SELECT elc.*, fm.data_type, fm.label, fm.is_required, fm.display_order
         FROM entity_layout_config elc
         LEFT JOIN field_metadata fm ON elc.entity_type::text = fm.entity_type::text AND elc.field_key = fm.field_key
         ORDER BY elc.entity_type, elc.entity_id, elc.order, elc.field_key`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      // Handle Sequelize query result format
      let layoutConfigs = [];
      if (Array.isArray(layoutConfigsResult) && layoutConfigsResult.length > 0) {
        layoutConfigs = Array.isArray(layoutConfigsResult[0]) 
          ? layoutConfigsResult[0] 
          : layoutConfigsResult;
      } else if (Array.isArray(layoutConfigsResult)) {
        layoutConfigs = layoutConfigsResult;
      }

      for (const layoutConfig of layoutConfigs) {
        // Map entity_type and entity_id
        let entityType = layoutConfig.entity_type;
        let entityId = layoutConfig.entity_id;
        let inheritsFromEntityType = null;
        let inheritsFromEntityId = null;

        if (layoutConfig.entity_type === 'block') {
          entityType = 'blockInstance';
          inheritsFromEntityType = 'blockShape';
          // Find the blockShape ID from the blockInstance's blockShapeRef
          const [instance] = await queryInterface.sequelize.query(
            `SELECT block_shape_ref FROM block_instances WHERE id = :instanceId LIMIT 1`,
            {
              replacements: { instanceId: entityId },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          if (instance && instance.length > 0 && instance[0].block_shape_ref) {
            inheritsFromEntityId = String(instance[0].block_shape_ref);
          }
        } else if (layoutConfig.entity_type === 'part') {
          entityType = 'partInstance';
          inheritsFromEntityType = 'partShape';
          const [instance] = await queryInterface.sequelize.query(
            `SELECT part_shape_ref FROM part_instances WHERE id = :instanceId LIMIT 1`,
            {
              replacements: { instanceId: entityId },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          if (instance && instance.length > 0 && instance[0].part_shape_ref) {
            inheritsFromEntityId = String(instance[0].part_shape_ref);
          }
        } else if (layoutConfig.entity_type === 'blockShape') {
          // Use sentinel UUID for global configs
          entityId = BLOCK_SHAPE_GLOBAL_CONFIG_ID;
        } else if (layoutConfig.entity_type === 'partShape') {
          entityId = PART_SHAPE_GLOBAL_CONFIG_ID;
        }

        // Map renderAs: if layout config has render_as='statusButton', use that
        // Otherwise, get from canonical metadata (controlType)
        let renderAs;
        if (layoutConfig.render_as === 'statusButton') {
          renderAs = 'statusButton';
        } else {
          // Get controlType from canonical metadata
          const [canonicalMeta] = await queryInterface.sequelize.query(
            `SELECT control_type FROM field_metadata 
             WHERE entity_type = :entityType AND field_key = :fieldKey LIMIT 1`,
            {
              replacements: {
                entityType: layoutConfig.entity_type === 'block' ? 'blockShape' : 
                           layoutConfig.entity_type === 'part' ? 'partShape' :
                           layoutConfig.entity_type,
                fieldKey: layoutConfig.field_key,
              },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          renderAs = canonicalMeta && canonicalMeta.length > 0 
            ? canonicalMeta[0].control_type 
            : 'text';
        }

        // Check if entry already exists (from Step 1 for shape entities)
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM admin_input_metadata 
           WHERE entity_type = :entityType AND entity_id = :entityId AND field_key = :fieldKey
           LIMIT 1`,
          {
            replacements: {
              entityType: entityType,
              entityId: entityId,
              fieldKey: layoutConfig.field_key,
            },
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (existing && existing.length > 0) {
          // Update existing entry (shape entities from Step 1)
          await queryInterface.sequelize.query(
            `UPDATE admin_input_metadata SET
              visibility = :visibility,
              layout = :layout,
              display_order = :displayOrder,
              section = :section,
              render_as = :renderAs,
              status_button_color = :statusButtonColor,
              panel = :panel,
              bulk_edit = :bulkEdit,
              updated_at = CURRENT_TIMESTAMP
             WHERE entity_type = :entityType AND entity_id = :entityId AND field_key = :fieldKey`,
            {
              replacements: {
                entityType: entityType,
                entityId: entityId,
                fieldKey: layoutConfig.field_key,
                visibility: layoutConfig.visibility,
                layout: layoutConfig.layout,
                displayOrder: layoutConfig.order ?? layoutConfig.display_order ?? 0,
                section: layoutConfig.section || null,
                renderAs: renderAs,
                statusButtonColor: layoutConfig.status_button_color || null,
                panel: layoutConfig.panel || 'none',
                bulkEdit: layoutConfig.bulk_edit || false,
              },
            }
          );
        } else {
          // Insert new entry (instance overrides)
          // Get canonical metadata for required fields
          const canonicalEntityType = layoutConfig.entity_type === 'block' ? 'blockShape' :
                                     layoutConfig.entity_type === 'part' ? 'partShape' :
                                     layoutConfig.entity_type;
          const [canonicalMeta] = await queryInterface.sequelize.query(
            `SELECT * FROM field_metadata 
             WHERE entity_type = :entityType AND field_key = :fieldKey LIMIT 1`,
            {
              replacements: {
                entityType: canonicalEntityType,
                fieldKey: layoutConfig.field_key,
              },
              type: Sequelize.QueryTypes.SELECT,
            }
          );

          // Handle Sequelize query result format
          let canonicalMetaArray = [];
          if (Array.isArray(canonicalMeta) && canonicalMeta.length > 0) {
            canonicalMetaArray = Array.isArray(canonicalMeta[0]) 
              ? canonicalMeta[0] 
              : canonicalMeta;
          } else if (Array.isArray(canonicalMeta)) {
            canonicalMetaArray = canonicalMeta;
          }

          if (canonicalMetaArray && canonicalMetaArray.length > 0) {
            const meta = canonicalMetaArray[0];
            // Insert instance override (use ON CONFLICT to handle duplicates)
            const insertId = layoutConfig.id || null;
            await queryInterface.sequelize.query(
              `INSERT INTO admin_input_metadata (
                id, entity_type, entity_id, field_key, data_type, label, is_required,
                visibility, layout, display_order, section, render_as, status_button_color,
                panel, bulk_edit, inherits_from_entity_type, inherits_from_entity_id,
                created_at, updated_at
              ) VALUES (
                COALESCE(:id, gen_random_uuid()), :entity_type, :entity_id, :field_key, :data_type, :label, :is_required,
                :visibility, :layout, :display_order, :section, :render_as, :status_button_color,
                :panel, :bulk_edit, :inherits_from_entity_type, :inherits_from_entity_id,
                :created_at, :updated_at
              ) ON CONFLICT (id) DO NOTHING`,
              {
                replacements: {
                  id: insertId,
                  entity_type: entityType,
                  entity_id: entityId,
                  field_key: layoutConfig.field_key,
                  data_type: meta.data_type,
                  label: meta.label,
                  is_required: meta.is_required || false,
                  visibility: layoutConfig.visibility,
                  layout: layoutConfig.layout,
                  display_order: layoutConfig.order ?? meta.display_order ?? 0,
                  section: layoutConfig.section || null,
                  render_as: renderAs,
                  status_button_color: layoutConfig.status_button_color || null,
                  panel: layoutConfig.panel || 'none',
                  bulk_edit: layoutConfig.bulk_edit || false,
                  inherits_from_entity_type: inheritsFromEntityType,
                  inherits_from_entity_id: inheritsFromEntityId,
                  created_at: layoutConfig.created_at || new Date(),
                  updated_at: layoutConfig.updated_at || new Date(),
                },
                type: Sequelize.QueryTypes.INSERT,
              }
            );
          }
        }
      }
      console.log('✅ Migrated layout configs from entity_layout_config');
    }

    // Step 3: Instance inheritance is handled in application code
    // Only explicit instance overrides (from entity_layout_config) are migrated above
    // The application will fetch shape metadata and merge with instance overrides at runtime
    console.log('✅ Instance inheritance will be handled in application code');

    console.log('✅ Completed metadata table unification');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting metadata table unification...');

    // Drop new table
    await queryInterface.dropTable('admin_input_metadata');
    console.log('✅ Dropped admin_input_metadata table');

    // Drop ENUM types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_admin_input_metadata_entity_type;
      DROP TYPE IF EXISTS enum_admin_input_metadata_data_type;
      DROP TYPE IF EXISTS enum_admin_input_metadata_visibility;
      DROP TYPE IF EXISTS enum_admin_input_metadata_layout;
      DROP TYPE IF EXISTS enum_admin_input_metadata_render_as;
      DROP TYPE IF EXISTS enum_admin_input_metadata_panel;
    `);
    console.log('✅ Dropped ENUM types');

    console.log('✅ Completed metadata table unification rollback');
  }
};
