/**
 * Migration: Rename Relationship Tables to Cascade/Constituent/Composition Terminology
 * Purpose: Rename relationship tables to clarify three-dimensional relationship model:
 *   - valid_blocks → valid_cascades (vertical hierarchy, different shapes)
 *   - active_blocks → active_cascades (vertical hierarchy, different shapes)
 *   - valid_parts → valid_constituents (Block → Part relationships)
 *   - active_parts → active_constituents (Block → Part relationships)
 *   - entity_aggregates → active_compositions (lateral aggregation, same shape)
 *   - Create valid_compositions table (shape-level composition)
 * Date: 2025-11-28
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Rename valid_blocks → valid_cascades
    const validBlocksExists = await queryInterface.tableExists('valid_blocks');
    if (validBlocksExists) {
      // Drop foreign key constraints first
      try {
        await queryInterface.removeConstraint('valid_blocks', 'valid_blocks_parent_id_fkey');
        await queryInterface.removeConstraint('valid_blocks', 'valid_blocks_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing valid_blocks constraints (may not exist):', error.message);
      }
      
      // Rename table
      await queryInterface.renameTable('valid_blocks', 'valid_cascades');
      console.log('✅ Renamed valid_blocks table to valid_cascades');
      
      // Re-add foreign key constraints with new names
      await queryInterface.addConstraint('valid_cascades', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_cascades_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('valid_cascades', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_cascades_child_id_fkey',
      });
      console.log('✅ Updated foreign key constraints in valid_cascades table');
    } else {
      console.log('ℹ️  Table valid_blocks does not exist, skipping rename');
    }

    // 2. Rename active_blocks → active_cascades
    const activeBlocksExists = await queryInterface.tableExists('active_blocks');
    if (activeBlocksExists) {
      // Drop foreign key constraints first
      try {
        await queryInterface.removeConstraint('active_blocks', 'active_blocks_parent_id_fkey');
        await queryInterface.removeConstraint('active_blocks', 'active_blocks_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing active_blocks constraints (may not exist):', error.message);
      }
      
      // Rename table
      await queryInterface.renameTable('active_blocks', 'active_cascades');
      console.log('✅ Renamed active_blocks table to active_cascades');
      
      // Re-add foreign key constraints with new names
      await queryInterface.addConstraint('active_cascades', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_cascades_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('active_cascades', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_cascades_child_id_fkey',
      });
      console.log('✅ Updated foreign key constraints in active_cascades table');
    } else {
      console.log('ℹ️  Table active_blocks does not exist, skipping rename');
    }

    // 3. Rename valid_parts → valid_constituents
    const validPartsExists = await queryInterface.tableExists('valid_parts');
    if (validPartsExists) {
      // Drop foreign key constraints first
      try {
        await queryInterface.removeConstraint('valid_parts', 'valid_parts_parent_id_fkey');
        await queryInterface.removeConstraint('valid_parts', 'valid_parts_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing valid_parts constraints (may not exist):', error.message);
      }
      
      // Rename table
      await queryInterface.renameTable('valid_parts', 'valid_constituents');
      console.log('✅ Renamed valid_parts table to valid_constituents');
      
      // Re-add foreign key constraints with new names
      await queryInterface.addConstraint('valid_constituents', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_constituents_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('valid_constituents', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'part_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_constituents_child_id_fkey',
      });
      console.log('✅ Updated foreign key constraints in valid_constituents table');
    } else {
      console.log('ℹ️  Table valid_parts does not exist, skipping rename');
    }

    // 4. Rename active_parts → active_constituents
    const activePartsExists = await queryInterface.tableExists('active_parts');
    if (activePartsExists) {
      // Drop foreign key constraints first
      try {
        await queryInterface.removeConstraint('active_parts', 'active_parts_parent_id_fkey');
        await queryInterface.removeConstraint('active_parts', 'active_parts_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing active_parts constraints (may not exist):', error.message);
      }
      
      // Rename table
      await queryInterface.renameTable('active_parts', 'active_constituents');
      console.log('✅ Renamed active_parts table to active_constituents');
      
      // Re-add foreign key constraints with new names
      await queryInterface.addConstraint('active_constituents', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_constituents_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('active_constituents', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'part_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_constituents_child_id_fkey',
      });
      console.log('✅ Updated foreign key constraints in active_constituents table');
    } else {
      console.log('ℹ️  Table active_parts does not exist, skipping rename');
    }

    // 5. Rename entity_aggregates → active_compositions
    const entityAggregatesExists = await queryInterface.tableExists('entity_aggregates');
    if (entityAggregatesExists) {
      await queryInterface.renameTable('entity_aggregates', 'active_compositions');
      console.log('✅ Renamed entity_aggregates table to active_compositions');
    } else {
      console.log('ℹ️  Table entity_aggregates does not exist, skipping rename');
    }

    // 6. Create valid_compositions table
    const validCompositionsExists = await queryInterface.tableExists('valid_compositions');
    if (!validCompositionsExists) {
      await queryInterface.createTable('valid_compositions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        parent_shape_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        child_shape_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        shape_kind: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: 'Shape type: blockShape or partShape',
        },
        order_index: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        disabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
      console.log('✅ Created valid_compositions table');
      
      // Add indexes
      await queryInterface.addIndex('valid_compositions', ['parent_shape_id'], {
        name: 'valid_compositions_parent_shape_id_idx',
      });
      await queryInterface.addIndex('valid_compositions', ['child_shape_id'], {
        name: 'valid_compositions_child_shape_id_idx',
      });
      await queryInterface.addIndex('valid_compositions', ['shape_kind'], {
        name: 'valid_compositions_shape_kind_idx',
      });
      console.log('✅ Added indexes to valid_compositions table');
    } else {
      console.log('ℹ️  Table valid_compositions already exists, skipping creation');
    }
  },

  async down(queryInterface, Sequelize) {
    // Reverse order of up migration
    
    // 6. Drop valid_compositions table
    const validCompositionsExists = await queryInterface.tableExists('valid_compositions');
    if (validCompositionsExists) {
      await queryInterface.dropTable('valid_compositions');
      console.log('✅ Dropped valid_compositions table');
    }

    // 5. Rename active_compositions → entity_aggregates
    const activeCompositionsExists = await queryInterface.tableExists('active_compositions');
    if (activeCompositionsExists) {
      await queryInterface.renameTable('active_compositions', 'entity_aggregates');
      console.log('✅ Renamed active_compositions table back to entity_aggregates');
    }

    // 4. Rename active_constituents → active_parts
    const activeConstituentsExists = await queryInterface.tableExists('active_constituents');
    if (activeConstituentsExists) {
      // Drop constraints
      try {
        await queryInterface.removeConstraint('active_constituents', 'active_constituents_parent_id_fkey');
        await queryInterface.removeConstraint('active_constituents', 'active_constituents_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing active_constituents constraints:', error.message);
      }
      
      await queryInterface.renameTable('active_constituents', 'active_parts');
      console.log('✅ Renamed active_constituents table back to active_parts');
      
      // Re-add old constraints
      await queryInterface.addConstraint('active_parts', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_parts_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('active_parts', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'part_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_parts_child_id_fkey',
      });
    }

    // 3. Rename valid_constituents → valid_parts
    const validConstituentsExists = await queryInterface.tableExists('valid_constituents');
    if (validConstituentsExists) {
      // Drop constraints
      try {
        await queryInterface.removeConstraint('valid_constituents', 'valid_constituents_parent_id_fkey');
        await queryInterface.removeConstraint('valid_constituents', 'valid_constituents_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing valid_constituents constraints:', error.message);
      }
      
      await queryInterface.renameTable('valid_constituents', 'valid_parts');
      console.log('✅ Renamed valid_constituents table back to valid_parts');
      
      // Re-add old constraints
      await queryInterface.addConstraint('valid_parts', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_parts_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('valid_parts', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'part_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_parts_child_id_fkey',
      });
    }

    // 2. Rename active_cascades → active_blocks
    const activeCascadesExists = await queryInterface.tableExists('active_cascades');
    if (activeCascadesExists) {
      // Drop constraints
      try {
        await queryInterface.removeConstraint('active_cascades', 'active_cascades_parent_id_fkey');
        await queryInterface.removeConstraint('active_cascades', 'active_cascades_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing active_cascades constraints:', error.message);
      }
      
      await queryInterface.renameTable('active_cascades', 'active_blocks');
      console.log('✅ Renamed active_cascades table back to active_blocks');
      
      // Re-add old constraints
      await queryInterface.addConstraint('active_blocks', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_blocks_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('active_blocks', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_blocks_child_id_fkey',
      });
    }

    // 1. Rename valid_cascades → valid_blocks
    const validCascadesExists = await queryInterface.tableExists('valid_cascades');
    if (validCascadesExists) {
      // Drop constraints
      try {
        await queryInterface.removeConstraint('valid_cascades', 'valid_cascades_parent_id_fkey');
        await queryInterface.removeConstraint('valid_cascades', 'valid_cascades_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing valid_cascades constraints:', error.message);
      }
      
      await queryInterface.renameTable('valid_cascades', 'valid_blocks');
      console.log('✅ Renamed valid_cascades table back to valid_blocks');
      
      // Re-add old constraints
      await queryInterface.addConstraint('valid_blocks', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_blocks_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('valid_blocks', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_blocks_child_id_fkey',
      });
    }
  },
};

