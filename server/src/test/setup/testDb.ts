import { Sequelize } from 'sequelize'
import { initializeModels } from '../../db/models/index.js'
import { createLogger } from '../../utils/logger.js'

const logger = createLogger('TestDb')
let testSequelize: Sequelize | null = null

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
  
  initializeModels(testSequelize)
  
  await testSequelize.authenticate()
  
  await testSequelize.sync({ force: true })
  
  return testSequelize
}

export async function teardownTestDb(): Promise<void> {
  if (testSequelize) {
    await testSequelize.close()
    testSequelize = null
  }
}

export async function clearTestData(): Promise<void> {
  if (!testSequelize) {
    throw new Error('Test database not initialized')
  }
  
  await testSequelize.truncate({ cascade: true, restartIdentity: true })
}

export function getTestDb(): Sequelize {
  if (!testSequelize) {
    throw new Error('Test database not initialized. Call setupTestDb() first.')
  }
  
  return testSequelize
}

