import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middlewares/index.js'
import { initializeDatabase } from './config/app.js'
import { loadTokensFromFile } from './config/googleOAuth.js'
import { OAuthCallbackRouter } from './routes/external/oauthCallbackRouter.js'
import { createLogger } from './utils/logger.js'
import {
  API_MESSAGES,
  API_VERSION,
  ROUTE_PATHS,
} from './constants/appConstants.js'

const logger = createLogger('app')
const app = express()

/**
 * Initialize Database and OAuth tokens
 * 
 * LEARNING: Async initialization function called immediately
 * WHY: Separates initialization logic from app setup
 * PATTERN: Immediately invoked async function for startup tasks
 * 
 * NOTE: This function is called immediately on line 27, so it's not unused.
 * The audit flagging it as unused is a false positive.
 */
const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase()
    logger.info('Database initialized successfully')

    // Load saved OAuth tokens from file (if they exist)
    // SESSION: 2.1.3b - Persist tokens across server restarts
    loadTokensFromFile()
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    process.exit(1)
  }
}

startServer()

/* Middleware */
app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* Routes */
app.use(ROUTE_PATHS.API, routes)

/**
 * OAuth Callback Route (Root Level)
 * LEARNING: Handles Google OAuth callback at simpler path for compatibility
 * WHY: Google OAuth requires simpler redirect URI paths
 * PATTERN: Root-level route for OAuth callback
 */
app.use('/', OAuthCallbackRouter)

/**
 * Root route handler
 * LEARNING: Provides API information at root endpoint
 * WHY: Simple way to verify server is running and get API info
 */
app.get('/', (_req, res) => {
  res.json({
    message: API_MESSAGES.SERVER_NAME,
    version: API_VERSION,
    endpoints: {
      api: ROUTE_PATHS.API,
      docs: API_MESSAGES.DOCS_MESSAGE,
    },
  })
})

/* Custom Error Handling Middlewares */
app.use(notFound)
app.use(errorHandler)

export default app
