/**
 * Migration: Rename Type to Shape Terminology
 * Purpose: Rename block_types/part_types tables and block_type_ref/part_type_ref columns to use "shape" terminology
 * Date: 2025-01-30
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
  const blockTypesExists = await queryInterface.tableExists('block_types');
  const partTypesExists = await queryInterface.tableExists('part_types');
  
  if (blockTypesExists) {
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

  const blockProfilesExists = await queryInterface.tableExists('block_profiles');
  if (blockProfilesExists) {
    const blockProfilesDescription = await queryInterface.describeTable('block_profiles');
    if (blockProfilesDescription.block_type_ref) {
      await queryInterface.renameColumn('block_profiles', 'block_type_ref', 'block_shape_ref');
      console.log('✅ Renamed block_type_ref column to block_shape_ref in block_profiles');
    } else {
      console.log('ℹ️  Column block_type_ref does not exist in block_profiles, skipping rename');
    }
  }

  const partProfilesExists = await queryInterface.tableExists('part_profiles');
  if (partProfilesExists) {
    const partProfilesDescription = await queryInterface.describeTable('part_profiles');
    if (partProfilesDescription.part_type_ref) {
      await queryInterface.renameColumn('part_profiles', 'part_type_ref', 'part_shape_ref');
      console.log('✅ Renamed part_type_ref column to part_shape_ref in part_profiles');
    } else {
      console.log('ℹ️  Column part_type_ref does not exist in part_profiles, skipping rename');
    }
  }

  // 4. Update foreign key constraints in valid_parts table
  await queryInterface.removeConstraint('valid_parts', 'valid_parts_parent_id_fkey');
  await queryInterface.removeConstraint('valid_parts', 'valid_parts_child_id_fkey');
  
  await queryInterface.addConstraint('valid_parts', {
    fields: ['parent_id'],
    type: 'foreign key',
    name: 'valid_parts_parent_id_fkey',
    references: {
      table: 'block_shapes',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });

  await queryInterface.addConstraint('valid_parts', {
    fields: ['child_id'],
    type: 'foreign key',
    name: 'valid_parts_child_id_fkey',
    references: {
      table: 'part_shapes',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });

  // 5. Update foreign key constraints in valid_blocks table
  await queryInterface.removeConstraint('valid_blocks', 'valid_blocks_parent_id_fkey');
  await queryInterface.removeConstraint('valid_blocks', 'valid_blocks_child_id_fkey');
  
  await queryInterface.addConstraint('valid_blocks', {
    fields: ['parent_id'],
    type: 'foreign key',
    name: 'valid_blocks_parent_id_fkey',
    references: {
      table: 'block_shapes',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });

  await queryInterface.addConstraint('valid_blocks', {
    fields: ['child_id'],
    type: 'foreign key',
    name: 'valid_blocks_child_id_fkey',
    references: {
      table: 'block_shapes',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });

  // 6. Update foreign key constraints in block_profiles table
  await queryInterface.removeConstraint('block_profiles', 'block_profiles_block_type_ref_fkey');
  await queryInterface.addConstraint('block_profiles', {
    fields: ['block_shape_ref'],
    type: 'foreign key',
    name: 'block_profiles_block_shape_ref_fkey',
    references: {
      table: 'block_shapes',
      field: 'id',
    },
    onDelete: 'RESTRICT',
  });

  // 7. Update foreign key constraints in part_profiles table
  await queryInterface.removeConstraint('part_profiles', 'part_profiles_part_type_ref_fkey');
  await queryInterface.addConstraint('part_profiles', {
    fields: ['part_shape_ref'],
    type: 'foreign key',
    name: 'part_profiles_part_shape_ref_fkey',
    references: {
      table: 'part_shapes',
      field: 'id',
    },
    onDelete: 'RESTRICT',
  });
  },

  async down(queryInterface, Sequelize) {
  
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

  await queryInterface.renameTable('part_shapes', 'part_types');
  await queryInterface.renameTable('block_shapes', 'block_types');
  }
};

