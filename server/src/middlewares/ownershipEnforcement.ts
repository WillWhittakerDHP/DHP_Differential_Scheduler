/**
 * WHY: Phase 8.7.1.2 — registry-driven ownership checks; keeps `security.ts` below branch/complexity thresholds.
 */
import type { Request, Response } from 'express'
import type { Model, ModelStatic } from 'sequelize'
import { AUTH_FAILURE_CODES } from '../auth/strategies/strategyTypes.js'
import { AVAILABILITY_SETTINGS_KEY } from '../constants/appConstants.js'
import {
  USER_ROLE_ADMIN,
  USER_ROLE_AGENT,
  USER_ROLE_OWNER,
  USER_ROLE_TRANSACTION_MANAGER,
} from '../constants/userRoles.js'
import {
  Appointment,
  AppointmentFeeSummary,
  BetaFeedback,
  BusinessRule,
  PropertyFieldMapping,
  PropertyFeatureMapping,
  PropertyVersion,
  PropertyVersionType,
} from '../config/app.js'
import type { AppLogger } from '../utils/logger.js'
import { getOwnershipRegistryEntry } from './ownershipRegistry.js'
import type { OwnershipRegistryEntry } from './ownershipRegistry.js'

const OWNERSHIP_DENY_MESSAGE = 'Access denied'
const RESOURCE_NOT_FOUND = 'Resource not found'

type StaffScopedResourceName =
  | 'beta feedback'
  | 'business rule'
  | 'property field mapping'
  | 'property feature mapping'

const STAFF_SCOPED_MODELS: Record<StaffScopedResourceName, ModelStatic<Model>> = {
  'beta feedback': BetaFeedback,
  'business rule': BusinessRule,
  'property field mapping': PropertyFieldMapping,
  'property feature mapping': PropertyFeatureMapping,
}

function isStaffScopedResourceName(name: string): name is StaffScopedResourceName {
  return Object.prototype.hasOwnProperty.call(STAFF_SCOPED_MODELS, name)
}

function idsEqual(a: unknown, b: unknown): boolean {
  if (a === null || a === undefined || b === null || b === undefined) {
    return false
  }
  return String(a) === String(b)
}

/** Agent, admin, transaction_manager, and owner (legacy seller) may mutate internal admin resources without a per-row user owner. */
function isInternalStaffRole(role: string | undefined): boolean {
  if (role === undefined || role === '') {
    return false
  }
  if (role === USER_ROLE_AGENT) {
    return true
  }
  if (role === USER_ROLE_ADMIN) {
    return true
  }
  if (role === USER_ROLE_TRANSACTION_MANAGER || role === USER_ROLE_OWNER) {
    return true
  }
  return false
}

function sendForbidden(res: Response, message: string): void {
  res.status(403).json({
    code: AUTH_FAILURE_CODES.FORBIDDEN,
    message,
  })
}

function sendNotFound(res: Response, message: string): void {
  res.status(404).json({ error: message })
}

function readParam(req: Request, paramKey: string): string | undefined {
  const raw = req.params[paramKey]
  if (typeof raw !== 'string') {
    return undefined
  }
  const trimmed = raw.trim()
  return trimmed === '' ? undefined : trimmed
}

async function handleSequelizeOwned(
  entry: Extract<OwnershipRegistryEntry, { kind: 'sequelize' }>,
  paramKey: string,
  req: Request,
  res: Response,
  logger: AppLogger
): Promise<boolean> {
  const userId = req.user?.id
  if (userId === undefined) {
    logger.warn('checkOwnership: missing user id on req.user')
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }

  const rawId = readParam(req, paramKey)
  if (rawId === undefined) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }

  const row = await entry.model.findByPk(rawId)
  if (row === null) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }

  if (entry.owner.mode === 'row_pk_is_user') {
    const rowId = (row as Model).getDataValue('id') as unknown
    if (!idsEqual(rowId, userId)) {
      logger.warn('checkOwnership: user row id mismatch')
      sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
      return false
    }
    return true
  }

  const field = entry.owner.field
  const ownerValue = (row as Model).getDataValue(field) as unknown
  if (ownerValue === null || ownerValue === undefined) {
    logger.warn('checkOwnership: owner column null', { field })
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }
  if (!idsEqual(ownerValue, userId)) {
    logger.warn('checkOwnership: owner column mismatch', { field })
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }
  return true
}

async function handleDynamicEntity(
  paramKey: string,
  req: Request,
  res: Response,
  logger: AppLogger
): Promise<boolean> {
  const config = req.entityConfig
  if (config === undefined) {
    logger.warn('checkOwnership: entity route missing req.entityConfig')
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }

  const rawId = readParam(req, paramKey)
  if (rawId === undefined) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }

  const row = await config.model.findByPk(rawId)
  if (row === null) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }

  if (!isInternalStaffRole(req.user?.role)) {
    logger.warn('checkOwnership: entity mutation denied for non-staff role')
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }
  return true
}

async function handleBusinessSetting(paramKey: string, req: Request, res: Response, logger: AppLogger): Promise<boolean> {
  const key = readParam(req, paramKey)
  if (key === undefined || key !== AVAILABILITY_SETTINGS_KEY) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }
  if (!isInternalStaffRole(req.user?.role)) {
    logger.warn('checkOwnership: businessSetting denied for non-staff')
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }
  return true
}

async function handleSingletonAdminSetting(req: Request, res: Response, logger: AppLogger): Promise<boolean> {
  if (!isInternalStaffRole(req.user?.role)) {
    logger.warn('checkOwnership: singleton settings mutation denied for non-staff')
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }
  return true
}

async function handleAppointmentFeeSummary(
  paramKey: string,
  req: Request,
  res: Response,
  logger: AppLogger
): Promise<boolean> {
  const userId = req.user?.id
  if (userId === undefined) {
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }

  const rawId = readParam(req, paramKey)
  if (rawId === undefined) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }

  const summary = await AppointmentFeeSummary.findByPk(rawId)
  if (summary === null) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }

  const appointmentId = summary.getDataValue('appointmentId') as unknown
  if (typeof appointmentId !== 'string' || appointmentId === '') {
    logger.warn('checkOwnership: fee summary missing appointmentId')
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }

  const appointment = await Appointment.findByPk(appointmentId)
  if (appointment === null) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }

  const scheduledById = appointment.getDataValue('scheduledById') as unknown

  // Matching scheduler, or internal staff (admin fee edits) until 8.7.2 tightens policy.
  if (idsEqual(scheduledById, userId)) {
    return true
  }
  if (isInternalStaffRole(req.user?.role)) {
    return true
  }

  logger.warn('checkOwnership: appointment fee summary denied')
  sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
  return false
}

async function handlePropertyVersion(paramKey: string, req: Request, res: Response, logger: AppLogger): Promise<boolean> {
  const rawId = readParam(req, paramKey)
  if (rawId === undefined) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }
  const row = await PropertyVersion.findByPk(rawId)
  if (row === null) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }
  if (!isInternalStaffRole(req.user?.role)) {
    logger.warn('checkOwnership: property version denied for non-staff')
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }
  return true
}

async function handlePropertyType(paramKey: string, req: Request, res: Response, logger: AppLogger): Promise<boolean> {
  const rawId = readParam(req, paramKey)
  if (rawId === undefined) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }
  const row = await PropertyVersionType.findByPk(rawId)
  if (row === null) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }
  if (!isInternalStaffRole(req.user?.role)) {
    logger.warn('checkOwnership: property type denied for non-staff')
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }
  return true
}

async function handleStaffScopedModel(
  resourceName: StaffScopedResourceName,
  paramKey: string,
  req: Request,
  res: Response,
  logger: AppLogger
): Promise<boolean> {
  if (!isInternalStaffRole(req.user?.role)) {
    logger.warn('checkOwnership: staff-scoped resource denied for non-staff', { resourceName })
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }

  const rawId = readParam(req, paramKey)
  if (rawId === undefined) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }

  const model = STAFF_SCOPED_MODELS[resourceName]
  const row = await model.findByPk(rawId)
  if (row === null) {
    sendNotFound(res, RESOURCE_NOT_FOUND)
    return false
  }
  return true
}

async function handleSpecialResource(
  resourceName: string,
  paramKey: string,
  req: Request,
  res: Response,
  logger: AppLogger
): Promise<boolean> {
  if (resourceName === 'businessSetting') {
    return handleBusinessSetting(paramKey, req, res, logger)
  }
  if (resourceName === 'userRoleBlockAlignment') {
    const rawId = readParam(req, paramKey)
    if (rawId !== undefined) {
      sendNotFound(res, RESOURCE_NOT_FOUND)
      return false
    }
    return handleSingletonAdminSetting(req, res, logger)
  }
  if (resourceName === 'calendarSetting' || resourceName === 'wizardSetting') {
    const rawId = readParam(req, paramKey)
    if (rawId === undefined) {
      return handleSingletonAdminSetting(req, res, logger)
    }
    if (!isInternalStaffRole(req.user?.role)) {
      logger.warn('checkOwnership: settings id param present but caller is not staff')
      sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
      return false
    }
    return true
  }
  if (resourceName === 'appointmentFeeSummary') {
    return handleAppointmentFeeSummary(paramKey, req, res, logger)
  }
  if (resourceName === 'property') {
    return handlePropertyVersion(paramKey, req, res, logger)
  }
  if (resourceName === 'propertyType') {
    return handlePropertyType(paramKey, req, res, logger)
  }
  if (isStaffScopedResourceName(resourceName)) {
    return handleStaffScopedModel(resourceName, paramKey, req, res, logger)
  }

  logger.error('checkOwnership: special resource not handled', { resourceName })
  sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
  return false
}

/**
 * Runs ownership rules for `checkOwnership`. Returns `true` when the caller should `next()`,
 * `false` when a response was already sent.
 */
export async function runOwnershipCheck(
  resourceName: string,
  paramKey: string,
  req: Request,
  res: Response,
  logger: AppLogger
): Promise<boolean> {
  const entry = getOwnershipRegistryEntry(resourceName)
  if (entry === undefined) {
    logger.warn('checkOwnership: unknown resourceName', { resourceName })
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }

  if (req.user === undefined) {
    logger.warn('checkOwnership: req.user missing; use requireAuth before checkOwnership', { resourceName })
    sendForbidden(res, OWNERSHIP_DENY_MESSAGE)
    return false
  }

  if (entry.kind === 'sequelize') {
    return handleSequelizeOwned(entry, paramKey, req, res, logger)
  }
  if (entry.kind === 'dynamic_entity') {
    return handleDynamicEntity(paramKey, req, res, logger)
  }
  return handleSpecialResource(resourceName, paramKey, req, res, logger)
}
