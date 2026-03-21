/**
 * Migration: Single baseline (squashed from all prior migrations)
 * Date: 2026-03-20
 * Source: pg_dump --schema-only / --data-only against scheduler_db (PostgreSQL 17.2)
 *
 * Creates the full schema (types, tables, indexes, constraints, triggers, functions)
 * then loads all reference/seed data.
 *
 * SequelizeMeta is NOT included — the migration runner manages that table.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  async up(queryInterface, _Sequelize) {
    const schemaPath = join(__dirname, '20260320_000001_baseline_schema.sql');
    const dataPath = join(__dirname, '20260320_000001_baseline_data.sql');

    const schemaSql = readFileSync(schemaPath, 'utf8');
    const dataSql = readFileSync(dataPath, 'utf8');

    console.log('[baseline] Applying schema…');
    await queryInterface.sequelize.query(schemaSql);
    console.log('[baseline] Schema applied');

    console.log('[baseline] Applying seed/reference data…');
    await queryInterface.sequelize.query(dataSql);
    console.log('[baseline] Data applied');
  },

  async down(_queryInterface, _Sequelize) {
    throw new Error(
      'Irreversible baseline migration. To reset, drop and recreate the database: ' +
      'dropdb scheduler_db && createdb scheduler_db && npm run migrate'
    );
  },
};
