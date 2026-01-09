/**
 * Script to run the description migration directly
 * This bypasses Sequelize CLI and runs the migration manually
 */

import 'dotenv/config'
import { Sequelize } from 'sequelize'
import migration from '../db/migrations/20251201_migrate_description_to_descriptions.mjs'

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
    
    // Check if migration has already been run
    const [results] = await sequelize.query(`
      SELECT "name" FROM "SequelizeMeta" 
      WHERE "name" = '20251201_migrate_description_to_descriptions.mjs'
    `)
    
    if (results.length > 0) {
      console.log('⚠️  Migration has already been run')
      return
    }
    
    console.log('🚀 Running migration...')
    await migration.up(queryInterface, Sequelize)
    
    // Record migration in SequelizeMeta
    await sequelize.query(`
      INSERT INTO "SequelizeMeta" ("name") 
      VALUES ('20251201_migrate_description_to_descriptions.mjs')
    `)
    
    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await sequelize.close()
  }
}

runMigration()

