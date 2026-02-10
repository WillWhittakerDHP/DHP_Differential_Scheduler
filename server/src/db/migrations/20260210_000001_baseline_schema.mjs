/**
 * Migration: Baseline schema (squashed from 224 migrations)
 * Date: 2026-02-10
 * Purpose: Single migration containing full database schema from pg_dump.
 * Historical migrations were squashed - see git history for original migration files.
 *
 * Creates: all types, tables, indexes, constraints, triggers.
 * Excludes: SequelizeMeta (managed by Sequelize migration runner).
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TABLES_TO_DROP = [
  'property_version_types',
  'property_details',
  'property_versions',
  'addresses',
  'appointment_attendees',
  'appointments',
  'annotation_assignments',
  'annotation_instances',
  'annotation_shapes',
  'block_instance_versions',
  'block_instances',
  'block_shapes',
  'booking_cascades',
  'business_rules',
  'business_settings',
  'dependent_instances',
  'entity_layout_config',
  'event_assignments',
  'event_instances',
  'event_shape_attendees',
  'event_shapes',
  'instance_components',
  'part_assignments',
  'part_instance_versions',
  'part_instances',
  'part_shapes',
  'valid_annotations',
  'valid_cascades',
  'valid_events',
  'valid_parts',
  'users',
];

export default {
  async up(queryInterface, _Sequelize) {
    const schemaPath = join(__dirname, '20260210_000001_baseline_schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    await queryInterface.sequelize.query(schemaSql);
    console.log('[baseline_schema] Applied full schema');
  },

  async down(queryInterface, _Sequelize) {
    for (const table of TABLES_TO_DROP) {
      await queryInterface.sequelize.query(
        `DROP TABLE IF EXISTS "${table}" CASCADE`
      );
    }
    await queryInterface.sequelize.query(
      'DROP FUNCTION IF EXISTS public.validate_property_version_type() CASCADE'
    );
    const enumTypes = [
      'appointment_status_enum',
      'basement_type_enum',
      'block_shape_type',
      'booking_mode_enum',
      'change_type_enum',
      'data_type_enum',
      'entity_key_enum',
      'enum_active_events_ternary_value',
      'enum_admin_metadata_config_type',
      'enum_admin_metadata_data_type',
      'enum_admin_metadata_entity_type',
      'enum_admin_metadata_layout',
      'enum_admin_metadata_metadata_type',
      'enum_admin_metadata_panel',
      'enum_admin_metadata_render_as',
      'enum_admin_metadata_visibility',
      'enum_appointment_attendees_invitation_status',
      'enum_appointments_status',
      'enum_event_assignments_parent_kind',
      'enum_properties_basement_type',
      'enum_property_details_foundation_access',
      'enum_property_details_source',
      'enum_shape_field_metadata_control_type',
      'enum_shape_field_metadata_data_type',
      'enum_shape_layout_config_layout',
      'enum_shape_layout_config_panel',
      'enum_shape_layout_config_render_as',
      'enum_shape_layout_config_shape_type',
      'enum_shape_layout_config_visibility',
      'enum_users_user_role',
      'foundation_access_enum',
      'property_details_source_enum',
      'ternary_boolean',
      'user_role_enum',
    ];
    for (const enumType of enumTypes) {
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS public."${enumType}" CASCADE`
      );
    }
    console.log('[baseline_schema] Dropped all tables, functions, and types');
  },
};
