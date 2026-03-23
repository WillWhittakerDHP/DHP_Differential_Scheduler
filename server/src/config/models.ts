import { initializeModels } from '../db/models/index.js'
import { sequelize } from './database.js'

/** Single Sequelize model registry — avoids duplicating the export name list from db/models/index. */
export const models = initializeModels(sequelize)
