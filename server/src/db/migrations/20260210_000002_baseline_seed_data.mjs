/**
 * Migration: Baseline seed data (squashed from migration seeds)
 * Date: 2026-02-10
 * Purpose: Seed configuration data for block_shapes, part_shapes, admin_metadata,
 * valid_* tables, business_settings, etc. Required for app to function.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEEDED_TABLES = [
  'appointment_attendees',
  'appointments',
  'annotation_assignments',
  'annotation_instances',
  'admin_metadata',
  'event_shape_attendees',
  'event_assignments',
  'event_instances',
  'instance_components',
  'part_assignments',
  'part_instances',
  'part_instance_versions',
  'block_instance_versions',
  'block_instances',
  'booking_cascades',
  'dependent_instances',
  'valid_annotations',
  'valid_cascades',
  'valid_events',
  'valid_parts',
  'annotation_shapes',
  'event_shapes',
  'part_shapes',
  'block_shapes',
  'business_settings',
  'users',
];

export default {
  async up(queryInterface, _Sequelize) {
    const seedPath = join(__dirname, '20260210_000002_baseline_seed_data.sql');
    const seedSql = readFileSync(seedPath, 'utf8');
    await queryInterface.sequelize.query(seedSql);
    console.log('[baseline_seed_data] Applied seed data');
  },

  async down(queryInterface, _Sequelize) {
    const tablesList = SEEDED_TABLES.map((t) => `"${t}"`).join(', ');
    await queryInterface.sequelize.query(
      `TRUNCATE TABLE ${tablesList} RESTART IDENTITY CASCADE`
    );
    console.log('[baseline_seed_data] Truncated seeded tables');
  },
};
