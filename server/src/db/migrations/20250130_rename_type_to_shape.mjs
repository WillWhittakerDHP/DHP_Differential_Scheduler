/**
 * Migration: Rename Type to Shape Terminology
 * Purpose: Rename block_types/part_types tables and block_type_ref/part_type_ref columns to use "shape" terminology
 * Date: 2025-01-30
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
  // Check if tables exist before renaming
  const blockTypesExists = await queryInterface.tableExists('block_types');
  const partTypesExists = await queryInterface.tableExists('part_types');
  
  if (blockTypesExists) {
    // 1. Rename tables
    await queryInterface.renameTable('block_types', 'block_shapes');
    console.log('✅ Renamed block_types table to block_shapes');
  } else {
    console.log('ℹ️  Table block_types does not exist, skipping rename');
  }
  
  if (partTypesExists) {
    await queryInterface.renameTable('part_types', 'part_shapes');
    console.log('✅ Renamed part_types table to part_shapes');
  } else {
    console.log('ℹ️  Table part_types does not exist, skipping rename');
  }

  // 2. Rename columns in block_profiles/block_instances table
  const blockProfilesTableExists = await queryInterface.tableExists('block_profiles');
  const blockInstancesTableExists = await queryInterface.tableExists('block_instances');
  const blockTableNameForRename = blockProfilesTableExists ? 'block_profiles' : (blockInstancesTableExists ? 'block_instances' : null);
  
  if (blockTableNameForRename) {
    const blockTableDescription = await queryInterface.describeTable(blockTableNameForRename);
    if (blockTableDescription.block_type_ref) {
      await queryInterface.renameColumn(blockTableNameForRename, 'block_type_ref', 'block_shape_ref');
      console.log(`✅ Renamed block_type_ref column to block_shape_ref in ${blockTableNameForRename}`);
    } else {
      console.log(`ℹ️  Column block_type_ref does not exist in ${blockTableNameForRename}, skipping rename`);
    }
  }

  // 3. Rename columns in part_profiles/part_instances table
  const partProfilesTableExists = await queryInterface.tableExists('part_profiles');
  const partInstancesTableExists = await queryInterface.tableExists('part_instances');
  const partTableNameForRename = partProfilesTableExists ? 'part_profiles' : (partInstancesTableExists ? 'part_instances' : null);
  
  if (partTableNameForRename) {
    const partTableDescription = await queryInterface.describeTable(partTableNameForRename);
    if (partTableDescription.part_type_ref) {
      await queryInterface.renameColumn(partTableNameForRename, 'part_type_ref', 'part_shape_ref');
      console.log(`✅ Renamed part_type_ref column to part_shape_ref in ${partTableNameForRename}`);
    } else {
      console.log(`ℹ️  Column part_type_ref does not exist in ${partTableNameForRename}, skipping rename`);
    }
  }

  // 4. Update foreign key constraints in valid_parts/valid_constituents table
  const validPartsExists = await queryInterface.tableExists('valid_parts');
  const validConstituentsExists = await queryInterface.tableExists('valid_constituents');
  const validPartsTableName = validPartsExists ? 'valid_parts' : (validConstituentsExists ? 'valid_constituents' : null);
  
  if (validPartsTableName) {
    try {
      await queryInterface.removeConstraint(validPartsTableName, 'valid_parts_parent_id_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint valid_parts_parent_id_fkey not found, skipping`);
    }
    try {
      await queryInterface.removeConstraint(validPartsTableName, 'valid_constituents_parent_id_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint valid_constituents_parent_id_fkey not found, skipping`);
    }
    
    try {
      await queryInterface.removeConstraint(validPartsTableName, 'valid_parts_child_id_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint valid_parts_child_id_fkey not found, skipping`);
    }
    try {
      await queryInterface.removeConstraint(validPartsTableName, 'valid_constituents_child_id_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint valid_constituents_child_id_fkey not found, skipping`);
    }
    
    const constraintName = validPartsExists ? 'valid_parts' : 'valid_constituents';
    
    await queryInterface.addConstraint(validPartsTableName, {
      fields: ['parent_id'],
      type: 'foreign key',
      name: `${constraintName}_parent_id_fkey`,
      references: {
        table: 'block_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint(validPartsTableName, {
      fields: ['child_id'],
      type: 'foreign key',
      name: `${constraintName}_child_id_fkey`,
      references: {
        table: 'part_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  } else {
    console.log('ℹ️  Table valid_parts/valid_constituents does not exist, skipping foreign key updates');
  }

  // 5. Update foreign key constraints in valid_blocks/valid_cascades table
  const validBlocksExists = await queryInterface.tableExists('valid_blocks');
  const validCascadesExists = await queryInterface.tableExists('valid_cascades');
  const validBlocksTableName = validBlocksExists ? 'valid_blocks' : (validCascadesExists ? 'valid_cascades' : null);
  
  if (validBlocksTableName) {
    try {
      await queryInterface.removeConstraint(validBlocksTableName, 'valid_blocks_parent_id_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint valid_blocks_parent_id_fkey not found, skipping`);
    }
    try {
      await queryInterface.removeConstraint(validBlocksTableName, 'valid_cascades_parent_id_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint valid_cascades_parent_id_fkey not found, skipping`);
    }
    
    try {
      await queryInterface.removeConstraint(validBlocksTableName, 'valid_blocks_child_id_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint valid_blocks_child_id_fkey not found, skipping`);
    }
    try {
      await queryInterface.removeConstraint(validBlocksTableName, 'valid_cascades_child_id_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint valid_cascades_child_id_fkey not found, skipping`);
    }
    
    const constraintName = validBlocksExists ? 'valid_blocks' : 'valid_cascades';
    
    await queryInterface.addConstraint(validBlocksTableName, {
      fields: ['parent_id'],
      type: 'foreign key',
      name: `${constraintName}_parent_id_fkey`,
      references: {
        table: 'block_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint(validBlocksTableName, {
      fields: ['child_id'],
      type: 'foreign key',
      name: `${constraintName}_child_id_fkey`,
      references: {
        table: 'block_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  } else {
    console.log('ℹ️  Table valid_blocks/valid_cascades does not exist, skipping foreign key updates');
  }

  // 6. Update foreign key constraints in block_profiles/block_instances table
  if (blockTableNameForRename) {
    try {
      await queryInterface.removeConstraint(blockTableNameForRename, 'block_profiles_block_type_ref_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint block_profiles_block_type_ref_fkey not found, skipping`);
    }
    try {
      await queryInterface.removeConstraint(blockTableNameForRename, 'block_instances_block_shape_ref_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint block_instances_block_shape_ref_fkey not found, skipping`);
    }
    
    const constraintName = blockProfilesTableExists ? 'block_profiles' : 'block_instances';
    
    await queryInterface.addConstraint(blockTableNameForRename, {
      fields: ['block_shape_ref'],
      type: 'foreign key',
      name: `${constraintName}_block_shape_ref_fkey`,
      references: {
        table: 'block_shapes',
        field: 'id',
      },
      onDelete: 'RESTRICT',
    });
  } else {
    console.log('ℹ️  Table block_profiles/block_instances does not exist, skipping foreign key updates');
  }

  // 7. Update foreign key constraints in part_profiles/part_instances table
  if (partTableNameForRename) {
    try {
      await queryInterface.removeConstraint(partTableNameForRename, 'part_profiles_part_type_ref_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint part_profiles_part_type_ref_fkey not found, skipping`);
    }
    try {
      await queryInterface.removeConstraint(partTableNameForRename, 'part_instances_part_shape_ref_fkey');
    } catch (error) {
      console.log(`ℹ️  Constraint part_instances_part_shape_ref_fkey not found, skipping`);
    }
    
    const constraintName = partProfilesTableExists ? 'part_profiles' : 'part_instances';
    
    await queryInterface.addConstraint(partTableNameForRename, {
      fields: ['part_shape_ref'],
      type: 'foreign key',
      name: `${constraintName}_part_shape_ref_fkey`,
      references: {
        table: 'part_shapes',
        field: 'id',
      },
      onDelete: 'RESTRICT',
    });
  } else {
    console.log('ℹ️  Table part_profiles/part_instances does not exist, skipping foreign key updates');
  }
  },

  async down(queryInterface, Sequelize) {
  // Reverse the operations in opposite order
  
  // 7. Revert part_profiles foreign key
  await queryInterface.removeConstraint('part_profiles', 'part_profiles_part_shape_ref_fkey');
  await queryInterface.addConstraint('part_profiles', {
    fields: ['part_shape_ref'],
    type: 'foreign key',
    name: 'part_profiles_part_type_ref_fkey',
    references: {
      table: 'part_types',
      field: 'id',
    },
    onDelete: 'RESTRICT',
  });
  await queryInterface.renameColumn('part_profiles', 'part_shape_ref', 'part_type_ref');

  // 6. Revert block_profiles foreign key
  await queryInterface.removeConstraint('block_profiles', 'block_profiles_block_shape_ref_fkey');
  await queryInterface.addConstraint('block_profiles', {
    fields: ['block_shape_ref'],
    type: 'foreign key',
    name: 'block_profiles_block_type_ref_fkey',
    references: {
      table: 'block_types',
      field: 'id',
    },
    onDelete: 'RESTRICT',
  });
  await queryInterface.renameColumn('block_profiles', 'block_shape_ref', 'block_type_ref');

  // 5. Revert valid_blocks foreign keys
  await queryInterface.removeConstraint('valid_blocks', 'valid_blocks_child_id_fkey');
  await queryInterface.removeConstraint('valid_blocks', 'valid_blocks_parent_id_fkey');
  await queryInterface.addConstraint('valid_blocks', {
    fields: ['child_id'],
    type: 'foreign key',
    name: 'valid_blocks_child_id_fkey',
    references: {
      table: 'block_types',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });
  await queryInterface.addConstraint('valid_blocks', {
    fields: ['parent_id'],
    type: 'foreign key',
    name: 'valid_blocks_parent_id_fkey',
    references: {
      table: 'block_types',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });

  // 4. Revert valid_parts foreign keys
  await queryInterface.removeConstraint('valid_parts', 'valid_parts_child_id_fkey');
  await queryInterface.removeConstraint('valid_parts', 'valid_parts_parent_id_fkey');
  await queryInterface.addConstraint('valid_parts', {
    fields: ['child_id'],
    type: 'foreign key',
    name: 'valid_parts_child_id_fkey',
    references: {
      table: 'part_types',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });
  await queryInterface.addConstraint('valid_parts', {
    fields: ['parent_id'],
    type: 'foreign key',
    name: 'valid_parts_parent_id_fkey',
    references: {
      table: 'block_types',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });

  // 3. Revert table renames
  await queryInterface.renameTable('part_shapes', 'part_types');
  await queryInterface.renameTable('block_shapes', 'block_types');
  }
};

