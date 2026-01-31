/**
 * Migration: Add isTernary and ternaryDefault fields to eventShape metadata
 * 
 * LEARNING: Adds metadata entries for the new isTernary and ternaryDefault fields
 * WHY: Enables the metadata modal to display and edit these fields
 * PATTERN: Insert metadata entries for new fields
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding isTernary and ternaryDefault to eventShape metadata...');

    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010';

    // Check if fields already exist
    const [existingIsTernary] = await queryInterface.sequelize.query(`
      SELECT id FROM admin_metadata
      WHERE entity_type = 'eventShape'
        AND field_key = 'isTernary'
        AND entity_id = :entityId
    `, {
      replacements: { entityId: EVENT_SHAPE_GLOBAL_CONFIG_ID },
      type: Sequelize.QueryTypes.SELECT,
    });

    const [existingTernaryDefault] = await queryInterface.sequelize.query(`
      SELECT id FROM admin_metadata
      WHERE entity_type = 'eventShape'
        AND field_key = 'ternaryDefault'
        AND entity_id = :entityId
    `, {
      replacements: { entityId: EVENT_SHAPE_GLOBAL_CONFIG_ID },
      type: Sequelize.QueryTypes.SELECT,
    });

    // Insert isTernary field if it doesn't exist
    if (!existingIsTernary || existingIsTernary.length === 0) {
      await queryInterface.sequelize.query(`
        INSERT INTO admin_metadata (
          id,
          metadata_type,
          entity_type,
          entity_id,
          field_key,
          data_type,
          label,
          is_required,
          visibility,
          layout,
          display_order,
          render_as,
          status_button_color,
          panel,
          bulk_edit,
          input_config,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          'primitive',
          'eventShape',
          :entityId,
          'isTernary',
          'boolean',
          'Is Ternary',
          true,
          'notConfigured',
          'stacked',
          3,
          'statusButton',
          NULL,
          'none',
          false,
          NULL,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `, {
        replacements: { entityId: EVENT_SHAPE_GLOBAL_CONFIG_ID },
      });

      console.log('✅ Added isTernary field to eventShape metadata');
    } else {
      console.log('ℹ️  isTernary field already exists in eventShape metadata');
    }

    // Insert ternaryDefault field if it doesn't exist
    if (!existingTernaryDefault || existingTernaryDefault.length === 0) {
      // Define options for ternaryDefault select
      // LEARNING: Use '__NULL__' as sentinel value for null (SelectOption requires string)
      // WHY: SelectOption.value must be string, but ternaryDefault can be null
      // PATTERN: Convert '__NULL__' back to null when reading/saving the value
      const ternaryDefaultOptions = {
        options: [
          { value: '__NULL__', label: 'None (Fail Gracefully)' },
          { value: 'true', label: 'True' },
          { value: 'false', label: 'False' },
          { value: 'override', label: 'Override' },
        ]
      };

      await queryInterface.sequelize.query(`
        INSERT INTO admin_metadata (
          id,
          metadata_type,
          entity_type,
          entity_id,
          field_key,
          data_type,
          label,
          is_required,
          visibility,
          layout,
          display_order,
          render_as,
          status_button_color,
          panel,
          bulk_edit,
          input_config,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          'primitive',
          'eventShape',
          :entityId,
          'ternaryDefault',
          'string',
          'Ternary Default',
          false,
          'notConfigured',
          'stacked',
          4,
          'select',
          NULL,
          'none',
          false,
          :inputConfig::jsonb,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `, {
        replacements: { 
          entityId: EVENT_SHAPE_GLOBAL_CONFIG_ID,
          inputConfig: JSON.stringify(ternaryDefaultOptions)
        },
      });

      console.log('✅ Added ternaryDefault field to eventShape metadata with options');
    } else {
      console.log('ℹ️  ternaryDefault field already exists in eventShape metadata');
    }

    console.log('✅ Finished adding isTernary and ternaryDefault to eventShape metadata');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing isTernary and ternaryDefault from eventShape metadata...');

    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010';

    await queryInterface.sequelize.query(`
      DELETE FROM admin_metadata
      WHERE entity_type = 'eventShape'
        AND field_key IN ('isTernary', 'ternaryDefault')
        AND entity_id = :entityId
    `, {
      replacements: { entityId: EVENT_SHAPE_GLOBAL_CONFIG_ID },
    });

    console.log('✅ Removed isTernary and ternaryDefault from eventShape metadata');
  },
};
