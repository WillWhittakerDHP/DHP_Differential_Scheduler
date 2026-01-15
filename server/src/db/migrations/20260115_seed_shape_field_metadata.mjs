/**
 * Migration: Seed canonical field metadata for block and part shapes
 * Date: 2026-01-15
 * Purpose: Populate shape_field_metadata table with known field definitions
 *          This seeds the canonical metadata that was previously hardcoded
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting shape_field_metadata seed migration...');

    const { v4: uuidv4 } = await import('uuid');

    // Block instance field definitions
    const blockFields = [
      { fieldKey: 'active', dataType: 'boolean', controlType: 'toggle', label: 'Active', isRequired: false, displayOrder: 1 },
      { fieldKey: 'composable', dataType: 'boolean', controlType: 'toggle', label: 'Composable', isRequired: false, displayOrder: 2 },
      { fieldKey: 'constituable', dataType: 'boolean', controlType: 'toggle', label: 'Constituable', isRequired: false, displayOrder: 3 },
      { fieldKey: 'allowMultiple', dataType: 'boolean', controlType: 'toggle', label: 'Allow Multiple', isRequired: false, displayOrder: 4 },
      { fieldKey: 'differential', dataType: 'boolean', controlType: 'toggle', label: 'Differential', isRequired: false, displayOrder: 5 },
      { fieldKey: 'requiresUnitNumber', dataType: 'boolean', controlType: 'toggle', label: 'Requires Unit Number', isRequired: false, displayOrder: 6 },
      { fieldKey: 'baseSqFt', dataType: 'number', controlType: 'number', label: 'Base Sq Ft', isRequired: false, displayOrder: 7 },
      { fieldKey: 'icon', dataType: 'string', controlType: 'text', label: 'Icon', isRequired: false, displayOrder: 8 },
      { fieldKey: 'activeConstituents', dataType: 'array', controlType: 'reference', label: 'Active Constituents', isRequired: false, displayOrder: 9 },
      { fieldKey: 'instanceComponents', dataType: 'array', controlType: 'reference', label: 'Instance Components', isRequired: false, displayOrder: 10 },
      { fieldKey: 'bookingCascades', dataType: 'array', controlType: 'reference', label: 'Booking Cascades', isRequired: false, displayOrder: 11 },
      { fieldKey: 'dependentInstanceOptions', dataType: 'array', controlType: 'reference', label: 'Dependent Instance Options', isRequired: false, displayOrder: 12 },
    ];

    // Part instance field definitions
    const partFields = [
      { fieldKey: 'active', dataType: 'boolean', controlType: 'toggle', label: 'Active', isRequired: false, displayOrder: 1 },
      { fieldKey: 'onSite', dataType: 'boolean', controlType: 'toggle', label: 'On Site', isRequired: false, displayOrder: 2 },
      { fieldKey: 'clientPresent', dataType: 'boolean', controlType: 'toggle', label: 'Client Present', isRequired: false, displayOrder: 3 },
      { fieldKey: 'moveable', dataType: 'boolean', controlType: 'toggle', label: 'Moveable', isRequired: false, displayOrder: 4 },
      { fieldKey: 'zeroOutPart', dataType: 'boolean', controlType: 'toggle', label: 'Zero Out Part', isRequired: false, displayOrder: 5 },
      { fieldKey: 'baseFee', dataType: 'number', controlType: 'number', label: 'Base Fee', isRequired: false, displayOrder: 6 },
      { fieldKey: 'rateOverBaseFee', dataType: 'number', controlType: 'number', label: 'Rate Over Base Fee', isRequired: false, displayOrder: 7 },
      { fieldKey: 'baseTime', dataType: 'number', controlType: 'number', label: 'Base Time', isRequired: false, displayOrder: 8 },
      { fieldKey: 'rateOverBaseTime', dataType: 'number', controlType: 'number', label: 'Rate Over Base Time', isRequired: false, displayOrder: 9 },
    ];

    // Insert block fields
    for (const field of blockFields) {
      await queryInterface.bulkInsert('shape_field_metadata', [{
        id: uuidv4(),
        entity_type: 'block',
        field_key: field.fieldKey,
        data_type: field.dataType,
        control_type: field.controlType,
        label: field.label,
        help_text: null,
        is_required: field.isRequired,
        validation_rules: null,
        default_value: null,
        display_order: field.displayOrder,
        created_at: new Date(),
        updated_at: new Date(),
      }], {
        ignoreDuplicates: true, // Skip if already exists
      });
    }

    // Insert part fields
    for (const field of partFields) {
      await queryInterface.bulkInsert('shape_field_metadata', [{
        id: uuidv4(),
        entity_type: 'part',
        field_key: field.fieldKey,
        data_type: field.dataType,
        control_type: field.controlType,
        label: field.label,
        help_text: null,
        is_required: field.isRequired,
        validation_rules: null,
        default_value: null,
        display_order: field.displayOrder,
        created_at: new Date(),
        updated_at: new Date(),
      }], {
        ignoreDuplicates: true, // Skip if already exists
      });
    }

    console.log('✅ Seeded shape_field_metadata table');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting shape_field_metadata seed migration...');
    
    // Delete seeded entries (by entity_type to avoid deleting user-created entries)
    await queryInterface.bulkDelete('shape_field_metadata', {
      entity_type: ['block', 'part'],
    });

    console.log('✅ Reverted shape_field_metadata seed');
  }
};
