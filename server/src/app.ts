import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import { getCorsOrigin } from './config/envConfig.js'
import { notFound, errorHandler } from './middlewares/index.js'
import { ensureCsrfTokenAttached } from './middlewares/csrfIssuance.js'
import { initializeDatabase } from './config/app.js'
import { loadTokensFromFile } from './config/googleOAuth.js'
import { OAuthCallbackRouter } from './routes/external/oauthCallbackRouter.js'
import { createLogger } from './utils/logger.js'
import {
  API_MESSAGES,
  API_VERSION,
  ROUTE_PATHS,
} from './constants/appConstants.js'
import {
  ensureWizardLogoUploadDir,
  getWizardLogoUploadDir,
  WIZARD_LOGO_PUBLIC_PATH,
} from './config/wizardLogoUploadConfig.js'

const logger = createLogger('app')
const app = express()

// Security: HTTPS enforced in production (e.g. reverse proxy). Session cookies when used: secure: true, httpOnly: true. See SECURITY_GUIDELINES.md.

const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase()
    logger.info('Database initialized successfully')

    loadTokensFromFile()
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    process.exit(1)
  }
}

startServer()

app.use(morgan('dev'))
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  })
)
const corsOrigin = getCorsOrigin()
const corsAllowedOrigins = Array.isArray(corsOrigin) ? corsOrigin : [corsOrigin]
app.use(cors({ origin: corsAllowedOrigins }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, _res, next) => {
  if (req.body === undefined) req.body = {}
  next()
})

// WHY: Populates `req.cookies` for session id read helpers (`sessionCookie.ts`).
app.use(cookieParser())
ensureWizardLogoUploadDir()
app.use(WIZARD_LOGO_PUBLIC_PATH, express.static(getWizardLogoUploadDir(), { index: false }))

// WHY: DB session row gets `sess.csrfToken`; readable `csrf_token` cookie for SPA (Phase 8.6.1). Validation: `csrfProtection` (8.6.1.2).
app.use(ensureCsrfTokenAttached)

app.use(ROUTE_PATHS.API, routes)

/**
 * OAuth Callback Route (Root Level)
 */
app.use('/', OAuthCallbackRouter)

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

app.use(notFound)
app.use(errorHandler)

export default app
