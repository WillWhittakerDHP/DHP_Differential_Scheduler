/**
 * TEST DATABASE SETUP
 * 
 * Utilities for setting up and tearing down test database connections.
 * Provides isolated test database environment.
 */

import { Sequelize } from 'sequelize'
import { initializeModels } from '../../db/models/index.js'

let testSequelize: Sequelize | null = null

/**
 * Create a test database connection
 */
export async function setupTestDb(): Promise<Sequelize> {
  const dbName = process.env.TEST_DB_NAME || 'scheduler_test'
  const dbUser = process.env.DB_USER || 'postgres'
  const dbPassword = process.env.DB_PASSWORD || 'postgres'
  const dbHost = process.env.DB_HOST || 'localhost'
  const dbPort = parseInt(process.env.DB_PORT || '5432')
  
  testSequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false, // Disable SQL logging in tests
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  })
  
  // Initialize models
  initializeModels(testSequelize)
  
  // Test connection
  await testSequelize.authenticate()
  
  // Sync database (create tables)
  await testSequelize.sync({ force: true })
  
  return testSequelize
}

/**
 * Close test database connection
 */
export async function teardownTestDb(): Promise<void> {
  if (testSequelize) {
    await testSequelize.close()
    testSequelize = null
  }
}

/**
 * Clear all data from test database tables
 */
export async function clearTestData(): Promise<void> {
  if (!testSequelize) {
    throw new Error('Test database not initialized')
  }
  
  // Truncate all tables
  await testSequelize.truncate({ cascade: true, restartIdentity: true })
}

/**
 * Get the test database instance
 */
export function getTestDb(): Sequelize {
  if (!testSequelize) {
    throw new Error('Test database not initialized. Call setupTestDb() first.')
  }
  
  return testSequelize
}

/**
 * Execute a transaction for testing
 */
export async function withTransaction<T>(
  callback: (transaction: any) => Promise<T>
): Promise<T> {
  const db = getTestDb()
  const transaction = await db.transaction()
  
  try {
    const result = await callback(transaction)
    await transaction.commit()
    return result
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

