/**
 * Disk location and public URL prefix for wizard logo uploads (session 6.15.1.2).
 */
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
}

/** Browser path (must match `express.static` mount in `app.ts`). */
export const WIZARD_LOGO_PUBLIC_PATH = '/api/v1/internal/static/wizard-logos' as const

export const WIZARD_LOGO_UPLOAD_FIELD = 'file' as const

export const WIZARD_LOGO_MAX_BYTES = 2 * 1024 * 1024

export function getWizardLogoUploadDir(): string {
  const raw = process.env.WIZARD_LOGO_UPLOAD_DIR?.trim()
  if (raw) {
    return path.resolve(raw)
  }
  return path.resolve(process.cwd(), 'uploads', 'wizard-logos')
}

export function ensureWizardLogoUploadDir(): void {
  const dir = getWizardLogoUploadDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

export function extensionForWizardLogoMime(mimetype: string): string | null {
  return MIME_TO_EXT[mimetype] ?? null
}

export function buildPublicWizardLogoUrl(filename: string): string {
  return `${WIZARD_LOGO_PUBLIC_PATH}/${encodeURIComponent(filename)}`
}

export function newWizardLogoStoredFilename(mimetype: string): string | null {
  const ext = extensionForWizardLogoMime(mimetype)
  if (!ext) {
    return null
  }
  return `${randomUUID()}${ext}`
}
