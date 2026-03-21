/**
 * Relational persistence for availability settings (no JSONB).
 */
import type { Transaction } from 'sequelize'
import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'
import {
  AvailabilitySetting,
  AvailabilityBusinessHour,
  AvailabilityBufferEntry,
  AvailabilityRangeConstraint,
  AvailabilityRangeConstraintHour,
  AvailabilityMaxWorkHour,
  AvailabilityMaxIncomeRow,
  AvailabilityDifferentialAttendee,
} from '../config/app.js'
import { sequelize } from '../config/database.js'
import { defaultAvailabilitySettings } from '../routes/internal/businessSettings/businessSettingsConstants.js'
import { createLogger } from '../utils/logger.js'
import {
  assembleAvailabilityDocument,
  apiBufferKind,
  apiScopeToDb,
} from './availabilityRelationalCodec.js'

const logger = createLogger('AvailabilitySettingsRepository')

async function clearAvailabilityChildren(availabilitySettingsId: string, t: Transaction): Promise<void> {
  const rcs = await AvailabilityRangeConstraint.findAll({
    attributes: ['id'],
    where: { availabilitySettingsId },
    transaction: t,
  })
  const rcIds = rcs.map((x) => x.id)
  if (rcIds.length > 0) {
    await AvailabilityRangeConstraintHour.destroy({
      where: { rangeConstraintId: rcIds },
      transaction: t,
    })
  }
  await AvailabilityRangeConstraint.destroy({ where: { availabilitySettingsId }, transaction: t })
  await AvailabilityBufferEntry.destroy({ where: { availabilitySettingsId }, transaction: t })
  await AvailabilityBusinessHour.destroy({ where: { availabilitySettingsId }, transaction: t })
  await AvailabilityMaxWorkHour.destroy({ where: { availabilitySettingsId }, transaction: t })
  await AvailabilityMaxIncomeRow.destroy({ where: { availabilitySettingsId }, transaction: t })
  await AvailabilityDifferentialAttendee.destroy({ where: { availabilitySettingsId }, transaction: t })
}

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

  return assembleAvailabilityDocument(
    root,
    businessHours,
    buffers,
    rangeConstraints,
    rangeConstraintHours,
    maxWork,
    maxIncome,
    differential
  )
}

async function persistAvailabilityData(data: AvailabilitySettingsData, t: Transaction): Promise<void> {
  let root = await AvailabilitySetting.findOne({ transaction: t })
  if (!root) {
    root = await AvailabilitySetting.create(
      {
        minuteIncrement: data.minuteIncrement ?? 15,
        durationRoundingEnabled: data.durationRounding?.enabled ?? false,
      },
      { transaction: t }
    )
  }

  const id = root.id
  await root.update(
    {
      minuteIncrement: data.minuteIncrement ?? 15,
      timezone: data.timezone ?? null,
      defaultLocationPlaceId: data.defaultLocation?.placeId ?? null,
      defaultLocationLabel: data.defaultLocation?.label ?? null,
      defaultLocationLat: data.defaultLocation?.coordinates?.lat ?? null,
      defaultLocationLng: data.defaultLocation?.coordinates?.lng ?? null,
      durationRoundingEnabled: data.durationRounding?.enabled ?? false,
      durationRoundingIncrement: data.durationRounding?.increment ?? null,
      durationRoundingMethod: data.durationRounding?.method ?? null,
      overlapOutOfOfficeEnforcement: data.overlapSources?.outOfOffice?.enforcement ?? null,
      updatedAt: new Date(),
    },
    { transaction: t }
  )

  await clearAvailabilityChildren(id, t)

  for (let dow = 0; dow <= 6; dow++) {
    const day = data.businessHours?.[dow as 0 | 1 | 2 | 3 | 4 | 5 | 6]
    if (!day?.start || !day?.end) continue
    await AvailabilityBusinessHour.create(
      {
        availabilitySettingsId: id,
        dayOfWeek: dow,
        startAt: new Date(day.start),
        endAt: new Date(day.end),
      },
      { transaction: t }
    )
  }

  const buf = data.buffers
  if (buf) {
    for (const key of Object.keys(buf) as (keyof typeof buf)[]) {
      const b = buf[key]
      if (!b) continue
      const kind = apiBufferKind(key)
      if (key === 'driveToCandidate' || key === 'driveFromCandidate') {
        const d = b as import('../../../shared/types/availabilityTypes.js').DriveTimeConfig
        await AvailabilityBufferEntry.create(
          {
            availabilitySettingsId: id,
            bufferKind: kind,
            minutes: d.minutes,
            enforcement: d.enforcement,
            placement: null,
            applyTo: d.applyTo,
          },
          { transaction: t }
        )
      } else {
        const d = b as import('../../../shared/types/availabilityTypes.js').BufferConfig
        await AvailabilityBufferEntry.create(
          {
            availabilitySettingsId: id,
            bufferKind: kind,
            minutes: d.minutes,
            enforcement: d.enforcement,
            placement: d.placement,
            applyTo: null,
          },
          { transaction: t }
        )
      }
    }
  }

  const rc = data.rangeConstraints
  if (rc) {
    for (const rt of ['businessHours', 'leadTime', 'dateRange'] as const) {
      const c = rc[rt]
      if (!c) continue
      const row = await AvailabilityRangeConstraint.create(
        {
          availabilitySettingsId: id,
          rangeType: rt,
          enforcement: c.enforcement,
          leadTimeMinutes: c.type === 'leadTime' ? (c.config as { minutes: number }).minutes : null,
          dateRangeStart:
            c.type === 'dateRange' ? new Date((c.config as { start: string }).start) : null,
          dateRangeEnd: c.type === 'dateRange' ? new Date((c.config as { end: string }).end) : null,
        },
        { transaction: t }
      )
      if (c.type === 'businessHours') {
        const hours = (c.config as { hours: Record<string, { start: string; end: string }> }).hours
        for (let dow = 0; dow <= 6; dow++) {
          const day = hours[String(dow)] ?? hours[dow]
          if (!day?.start || !day?.end) continue
          await AvailabilityRangeConstraintHour.create(
            {
              rangeConstraintId: row.id,
              dayOfWeek: dow,
              startAt: new Date(day.start),
              endAt: new Date(day.end),
            },
            { transaction: t }
          )
        }
      }
    }
  }

  const mw = data.maxWorkHours
  if (mw) {
    for (const sk of ['day', 'calendarWeek', 'rollingWeek'] as const) {
      const w = mw[sk]
      if (!w || (w as { maxHours?: number }).maxHours == null) continue
      await AvailabilityMaxWorkHour.create(
        {
          availabilitySettingsId: id,
          scope: apiScopeToDb(sk),
          maxHours: (w as { maxHours: number }).maxHours,
          enforcement: w.enforcement,
          rollingDirection: 'direction' in w ? (w as { direction?: string }).direction ?? null : null,
        },
        { transaction: t }
      )
    }
  }

  const mi = data.maxIncome
  if (mi) {
    for (const sk of ['day', 'calendarWeek', 'rollingWeek'] as const) {
      const w = mi[sk]
      if (!w || (w as { maxIncome?: number }).maxIncome == null) continue
      await AvailabilityMaxIncomeRow.create(
        {
          availabilitySettingsId: id,
          scope: apiScopeToDb(sk),
          maxIncome: (w as { maxIncome: number }).maxIncome,
          enforcement: w.enforcement,
          rollingDirection: 'direction' in w ? (w as { direction?: string }).direction ?? null : null,
        },
        { transaction: t }
      )
    }
  }

  const dp = data.differentialPerspectives
  if (dp?.majorAttendees?.length) {
    let so = 0
    for (const v of dp.majorAttendees) {
      await AvailabilityDifferentialAttendee.create(
        { availabilitySettingsId: id, role: 'major', sortOrder: so++, value: String(v) },
        { transaction: t }
      )
    }
  }
  if (dp?.minorAttendees?.length) {
    let so = 0
    for (const v of dp.minorAttendees) {
      await AvailabilityDifferentialAttendee.create(
        { availabilitySettingsId: id, role: 'minor', sortOrder: so++, value: String(v) },
        { transaction: t }
      )
    }
  }
}

export async function saveAvailabilitySettingsData(
  data: AvailabilitySettingsData,
  options?: { transaction?: Transaction }
): Promise<void> {
  if (options?.transaction) {
    await persistAvailabilityData(data, options.transaction)
    return
  }
  await sequelize.transaction(async (t) => {
    await persistAvailabilityData(data, t)
  })
}
