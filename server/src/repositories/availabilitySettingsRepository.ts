/**
 * Relational persistence for availability settings (no JSONB).
 */
import type { Transaction } from 'sequelize'
import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'
import {
  AvailabilityBusinessHour,
  AvailabilityBufferEntry,
  AvailabilityRangeConstraint,
  AvailabilityRangeConstraintHour,
  AvailabilityMaxWorkHour,
  AvailabilityMaxIncomeRow,
  AvailabilityDifferentialAttendee,
  AvailabilitySetting,
} from '../config/app.js'
import { sequelize } from '../config/database.js'
import { defaultAvailabilitySettings } from '../routes/internal/businessSettings/businessSettingsConstants.js'
import { createLogger } from '../utils/logger.js'
import { assembleAvailabilityDocument } from './availabilityRelationalCodec.js'
import { getStateControlUserTypeBlockInstanceIdSet } from './stateControlUserTypeBlockInstanceIds.js'
import { driveTimeFeeScalarsForRow } from '../utils/availabilityPersistenceScalars.js'
import {
  clearAvailabilityChildRows,
  ensureAvailabilityRootUpdated,
  persistBusinessHoursChunk,
  persistBufferEntriesChunk,
  persistDifferentialAttendeesChunk,
  persistMaxIncomeChunk,
  persistMaxWorkHoursChunk,
  persistRangeConstraintsChunk,
} from './availabilityPersistenceChunks.js'

const logger = createLogger('AvailabilitySettingsRepository')

export async function getAvailabilitySettingsData(): Promise<AvailabilitySettingsData> {
  const root = await AvailabilitySetting.findOne()
  if (!root) {
    logger.warn('No availability_settings row; using defaults')
    return defaultAvailabilitySettings
  }
  const id = root.id
  const [businessHours, buffers, rangeConstraints, maxWork, maxIncome, differential] =
    await Promise.all([
      AvailabilityBusinessHour.findAll({ where: { availabilitySettingsId: id } }),
      AvailabilityBufferEntry.findAll({ where: { availabilitySettingsId: id } }),
      AvailabilityRangeConstraint.findAll({ where: { availabilitySettingsId: id } }),
      AvailabilityMaxWorkHour.findAll({ where: { availabilitySettingsId: id } }),
      AvailabilityMaxIncomeRow.findAll({ where: { availabilitySettingsId: id } }),
      AvailabilityDifferentialAttendee.findAll({ where: { availabilitySettingsId: id } }),
    ])

  const rcIds = rangeConstraints.map((r) => r.id)
  const rangeConstraintHours =
    rcIds.length === 0
      ? []
      : await AvailabilityRangeConstraintHour.findAll({
          where: { rangeConstraintId: rcIds },
        })

  const allowedStateControlBlockInstanceIds = await getStateControlUserTypeBlockInstanceIdSet()

  return assembleAvailabilityDocument(
    root,
    businessHours,
    buffers,
    rangeConstraints,
    rangeConstraintHours,
    maxWork,
    maxIncome,
    differential,
    allowedStateControlBlockInstanceIds
  )
}

async function persistAvailabilityData(data: AvailabilitySettingsData, t: Transaction): Promise<void> {
  const feeScalars = driveTimeFeeScalarsForRow(data.driveTimeFee)
  const { id } = await ensureAvailabilityRootUpdated(data, feeScalars, t)
  await clearAvailabilityChildRows(id, t)
  await persistBusinessHoursChunk(id, data.businessHours, t)
  await persistBufferEntriesChunk(id, data.buffers, t)
  await persistRangeConstraintsChunk(id, data.rangeConstraints, t)
  await persistMaxWorkHoursChunk(id, data.maxWorkHours, t)
  await persistMaxIncomeChunk(id, data.maxIncome, t)
  await persistDifferentialAttendeesChunk(id, data.differentialPerspectives, t, logger)
}

export async function saveAvailabilitySettingsData(
  data: AvailabilitySettingsData,
  options?: { transaction?: Transaction }
): Promise<void> {
  if (options?.transaction) {
    await persistAvailabilityData(data, options.transaction)
    return
  }
  await sequelize.transaction(async (transaction) => {
    await persistAvailabilityData(data, transaction)
  })
}

/** DELETE /business-settings/availability_settings: rewrite DB to application defaults. */
export async function resetAvailabilitySettingsToDefault(): Promise<void> {
  await saveAvailabilitySettingsData(defaultAvailabilitySettings)
}
