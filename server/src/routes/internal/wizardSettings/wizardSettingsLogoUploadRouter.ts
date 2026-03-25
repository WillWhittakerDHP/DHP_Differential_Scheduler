/**
 * POST multipart upload for wizard logo; persists `logoUrl` on wizard_settings.
 */
import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import type { WizardSettingsData } from '../../../../../shared/types/wizardSettingsTypes.js'
import {
  ensureWizardLogoUploadDir,
  buildPublicWizardLogoUrl,
  extensionForWizardLogoMime,
  getWizardLogoUploadDir,
  newWizardLogoStoredFilename,
  WIZARD_LOGO_MAX_BYTES,
  WIZARD_LOGO_UPLOAD_FIELD,
} from '../../../config/wizardLogoUploadConfig.js'
import {
  getWizardSettingsData,
  saveWizardSettingsData,
} from '../../../repositories/wizardSettingsRepository.js'
import { handleRouteError } from '../../helpers/routerErrorHandler.js'
import { sendError, sendSuccess } from '../../helpers/routerResponseHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { csrfProtection, checkOwnership, requireAuth } from '../../../middlewares/security.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('wizardSettingsLogoUpload')

const ERROR_UPLOAD = 'Wizard logo upload failed'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureWizardLogoUploadDir()
    cb(null, getWizardLogoUploadDir())
  },
  filename: (_req, file, cb) => {
    const name = newWizardLogoStoredFilename(file.mimetype)
    if (!name) {
      cb(new Error('Unsupported image type'), '')
      return
    }
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: WIZARD_LOGO_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (extensionForWizardLogoMime(file.mimetype)) {
      cb(null, true)
      return
    }
    cb(new Error('Only PNG, JPEG, WebP, or SVG images are allowed'))
  },
})

const router = Router()

async function persistLogoAndRespond(req: Request, res: Response): Promise<void> {
  const file = req.file
  if (!file) {
    sendError(res, `Missing multipart field "${WIZARD_LOGO_UPLOAD_FIELD}"`, HTTP_STATUS_CODES.BAD_REQUEST)
    return
  }
  const logoUrl = buildPublicWizardLogoUrl(file.filename)
  const current: WizardSettingsData = await getWizardSettingsData()
  const saved = await saveWizardSettingsData({ ...current, logoUrl })
  sendSuccess(res, { setting_value: saved })
}

router.post(
  '/logo',
  csrfProtection,
  requireAuth,
  checkOwnership('wizardSetting', 'id'),
  (req: Request, res: Response, _next) => {
    upload.single(WIZARD_LOGO_UPLOAD_FIELD)(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : ERROR_UPLOAD
        logger.warn('Wizard logo upload rejected', { err })
        sendError(res, message, HTTP_STATUS_CODES.BAD_REQUEST)
        return
      }
      void persistLogoAndRespond(req, res).catch((error: unknown) => {
        handleRouteError(error, res, ERROR_UPLOAD, 'uploading wizard logo')
      })
    })
  }
)

export { router as WizardSettingsLogoUploadRouter }
