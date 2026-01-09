/**
 * Script to manually run the descriptions migration
 * This is needed because Sequelize CLI might not recognize .mjs files
 */

import 'dotenv/config'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sequelize = new Sequelize(
  process.env.DB_NAME || 'scheduler_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'jklJKL',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
)

async function runMigration() {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection established')

    const queryInterface = sequelize.getQueryInterface()
    
    // Import the migration
    const migrationPath = join(__dirname, '../db/migrations/20250201_create_descriptions_system.mjs')
    const migrationModule = await import(`file://${migrationPath}`)
    const migration = migrationModule.default

    console.log('🔄 Running descriptions migration...')
    await migration.up(queryInterface, Sequelize)
    
    // Mark migration as run in SequelizeMeta
    const migrationName = '20250201_create_descriptions_system.mjs'
    const results = await sequelize.query(
      `SELECT * FROM "SequelizeMeta" WHERE "name" = :name`,
      {
        replacements: { name: migrationName },
        type: Sequelize.QueryTypes.SELECT
      }
    )
    
    if (!results || results.length === 0) {
      await sequelize.query(
        `INSERT INTO "SequelizeMeta" ("name") VALUES (:name)`,
        {
          replacements: { name: migrationName }
        }
      )
      console.log('✅ Migration marked as executed in SequelizeMeta')
    } else {
      console.log('ℹ️  Migration already marked in SequelizeMeta')
    }

    console.log('✅ Migration completed successfully')
    await sequelize.close()
  } catch (error) {
    console.error('❌ Migration failed:', error)
    await sequelize.close()
    process.exit(1)
  }
}

runMigration()

