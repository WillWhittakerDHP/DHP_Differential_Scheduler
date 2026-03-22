/**
 * Manual Migration Runner
 * 
 * Runs migrations that Sequelize CLI might not detect.
 * Supports both .js and .mjs migration files.
 * Automatically detects all pending migrations in alphabetical order.
 */

import 'dotenv/config'
import { Sequelize } from 'sequelize'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])
const dbHost = process.env.DB_HOST || '127.0.0.1'

if (!LOCAL_HOSTS.has(dbHost)) {
  console.error(
    `❌ Migration blocked: DB_HOST is "${dbHost}" (remote).\n` +
    `   Only the database host machine may run migrations.\n` +
    `   If you need schema changes applied, commit the migration file and\n` +
    `   run "npm run migrate" on the machine that hosts PostgreSQL.`
  )
  process.exit(1)
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'scheduler_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'jklJKL',
  {
    host: dbHost,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
)

async function runMigrations() {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection established')

    // Ensure SequelizeMeta exists (first run on a fresh database)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public."SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      )
    `)
    // Restore search_path in case a migration reset it
    await sequelize.query('SET search_path = public')

    const migrationsPath = join(__dirname, '../db/migrations')
    const files = await readdir(migrationsPath)
    
    const targetMigrations = files
      .filter(f => (f.endsWith('.mjs') || f.endsWith('.js')) && f !== 'README.md' && !f.endsWith('.sql'))
      .sort()

    console.log(`\n📋 Found ${targetMigrations.length} migration files:`)
    targetMigrations.forEach(f => console.log(`   - ${f}`))

    const executedMigrationsResult = await sequelize.query(
      'SELECT name FROM public."SequelizeMeta" ORDER BY name',
      {
        type: Sequelize.QueryTypes.SELECT
      }
    )

    const executedMigrations = Array.isArray(executedMigrationsResult) 
      ? executedMigrationsResult 
      : executedMigrationsResult[0] || []
    const executedNames = executedMigrations.map(m => m.name)
    const pendingMigrations = targetMigrations.filter(f => !executedNames.includes(f))

    if (pendingMigrations.length === 0) {
      console.log('\n✅ All migrations have already been executed')
      return
    }

    console.log(`\n🔄 Running ${pendingMigrations.length} pending migrations...`)

    for (const migrationFile of pendingMigrations) {
      console.log(`\n📝 Running: ${migrationFile}`)
      
      try {
        const migrationPath = join(migrationsPath, migrationFile)
        
        // Handle both .js and .mjs files
        // Convert path to file URL for proper ES module import
        // This works for both .js and .mjs files in ES module context
        const migrationUrl = pathToFileURL(migrationPath).href
        const migration = await import(migrationUrl)
        
        if (!migration.default) {
          throw new Error(`Migration ${migrationFile} does not have a default export`)
        }

        const queryInterface = sequelize.getQueryInterface()
        await migration.default.up(queryInterface, Sequelize)

        // Restore search_path in case the migration reset it
        await sequelize.query('SET search_path = public')

        await sequelize.query(
          'INSERT INTO public."SequelizeMeta" (name) VALUES (:name)',
          {
            replacements: { name: migrationFile },
            type: Sequelize.QueryTypes.INSERT
          }
        )

        console.log(`   ✅ ${migrationFile} completed successfully`)
      } catch (error) {
        console.error(`   ❌ Error running ${migrationFile}:`, error)
        throw error
      }
    }

    console.log('\n✅ All migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

runMigrations()

