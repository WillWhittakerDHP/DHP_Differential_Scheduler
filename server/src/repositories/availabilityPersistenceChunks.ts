/**
 * WHY: Split relational availability persistence into named chunks (function-complexity / governance).
 */

import type { Transaction } from 'sequelize'
import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'
import type { BufferConfig, DriveTimeConfig } from '../../../shared/types/availabilityTypes.js'
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
import {
  apiBufferKind,
  apiScopeToDb,
  isDriveBufferApiKey,
} from './availabilityRelationalCodec.js'
import { getStateControlUserTypeBlockInstanceIdSet } from './stateControlUserTypeBlockInstanceIds.js'
import {
  type DriveTimeFeeRowScalars,
  sanitizeDifferentialAttendeeIdsForPersist,
} from '../utils/availabilityPersistenceScalars.js'
import type { Logger } from '../utils/logger.js'

export async function clearAvailabilityChildRows(
  availabilitySettingsId: string,
  t: Transaction
): Promise<void> {
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

export async function ensureAvailabilityRootUpdated(
  data: AvailabilitySettingsData,
  feeScalars: DriveTimeFeeRowScalars,
  t: Transaction
): Promise<{ id: string }> {
  const {
    driveTimeFeeComplimentaryMinutes,
    driveTimeFeeRatePerHour,
    driveTimeFeeRoundingMinutes,
  } = feeScalars

  let root = await AvailabilitySetting.findOne({ transaction: t })
  if (!root) {
    root = await AvailabilitySetting.create(
      {
        minuteIncrement: data.minuteIncrement ?? 15,
        durationRoundingEnabled: data.durationRounding?.enabled ?? false,
        driveTimeFeeComplimentaryMinutes,
        driveTimeFeeRatePerHour,
        driveTimeFeeRoundingMinutes,
      },
      { transaction: t }
    )
  }

  await root.update(
    {
      minuteIncrement: data.minuteIncrement ?? 15,
      timezone: data.timezone ?? null,
      defaultLocationPlaceId: data.defaultLocation?.placeId ?? null,
      defaultLocationAddress: data.defaultLocation?.address ?? null,
      defaultLocationLabel: data.defaultLocation?.label ?? null,
      defaultLocationLat: data.defaultLocation?.coordinates?.lat ?? null,
      defaultLocationLng: data.defaultLocation?.coordinates?.lng ?? null,
      durationRoundingEnabled: data.durationRounding?.enabled ?? false,
      durationRoundingIncrement: data.durationRounding?.increment ?? null,
      durationRoundingMethod: data.durationRounding?.method ?? null,
      overlapOutOfOfficeEnforcement: data.overlapSources?.outOfOffice?.enforcement ?? null,
      driveTimeFeeComplimentaryMinutes,
      driveTimeFeeRatePerHour,
      driveTimeFeeRoundingMinutes,
      updatedAt: new Date(),
    },
    { transaction: t }
  )

  return { id: root.id }
}

export async function persistBusinessHoursChunk(
  id: string,
  businessHours: AvailabilitySettingsData['businessHours'],
  t: Transaction
): Promise<void> {
  for (let dow = 0; dow <= 6; dow++) {
    const day = businessHours?.[dow as 0 | 1 | 2 | 3 | 4 | 5 | 6]
    if (!day?.start || !day?.end) {
      continue
    }
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
}

export async function persistBufferEntriesChunk(
  id: string,
  buffers: AvailabilitySettingsData['buffers'],
  t: Transaction
): Promise<void> {
  if (!buffers) {
    return
  }
  for (const key of Object.keys(buffers) as (keyof typeof buffers)[]) {
    const b = buffers[key]
    if (!b) {
      continue
    }
    const kind = apiBufferKind(key)
    if (isDriveBufferApiKey(key)) {
      const d = b as DriveTimeConfig
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
      const d = b as BufferConfig
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

async function persistBusinessHoursForRangeConstraintRow(
  rangeConstraintId: string,
  hours: Record<string, { start: string; end: string }>,
  t: Transaction
): Promise<void> {
  for (let dow = 0; dow <= 6; dow++) {
    const day = hours[String(dow)] ?? hours[dow]
    if (!day?.start || !day?.end) {
      continue
    }
    await AvailabilityRangeConstraintHour.create(
      {
        rangeConstraintId,
        dayOfWeek: dow,
        startAt: new Date(day.start),
        endAt: new Date(day.end),
      },
      { transaction: t }
    )
  }
}

export async function persistRangeConstraintsChunk(
  id: string,
  rangeConstraints: AvailabilitySettingsData['rangeConstraints'],
  t: Transaction
): Promise<void> {
  if (!rangeConstraints) {
    return
  }
  for (const rt of ['businessHours', 'leadTime', 'dateRange'] as const) {
    const c = rangeConstraints[rt]
    if (!c) {
      continue
    }
    const row = await AvailabilityRangeConstraint.create(
      {
        availabilitySettingsId: id,
        rangeType: rt,
        enforcement: c.enforcement,
        leadTimeMinutes: c.type === 'leadTime' ? (c.config as { minutes: number }).minutes : null,
        dateRangeStart: c.type === 'dateRange' ? new Date((c.config as { start: string }).start) : null,
        dateRangeEnd: c.type === 'dateRange' ? new Date((c.config as { end: string }).end) : null,
      },
      { transaction: t }
    )
    if (c.type !== 'businessHours') {
      continue
    }
    const hours = (c.config as { hours: Record<string, { start: string; end: string }> }).hours
    await persistBusinessHoursForRangeConstraintRow(row.id, hours, t)
  }
}

export async function persistMaxWorkHoursChunk(
  id: string,
  maxWork: AvailabilitySettingsData['maxWorkHours'],
  t: Transaction
): Promise<void> {
  if (!maxWork) {
    return
  }
  for (const sk of ['day', 'calendarWeek', 'rollingWeek'] as const) {
    const w = maxWork[sk]
    if (!w || (w as { maxHours?: number }).maxHours == null) {
      continue
    }
    await AvailabilityMaxWorkHour.create(
      {
        availabilitySettingsId: id,
        scope: apiScopeToDb(sk),
        maxHours: (w as { maxHours: number }).maxHours,
        enforcement: w.enforcement,
        rollingDirection: 'direction' in w ? ((w as { direction?: string }).direction ?? null) : null,
      },
      { transaction: t }
    )
  }
}

export async function persistMaxIncomeChunk(
  id: string,
  maxIncome: AvailabilitySettingsData['maxIncome'],
  t: Transaction
): Promise<void> {
  if (!maxIncome) {
    return
  }
  for (const sk of ['day', 'calendarWeek', 'rollingWeek'] as const) {
    const w = maxIncome[sk]
    if (!w || (w as { maxIncome?: number }).maxIncome == null) {
      continue
    }
    await AvailabilityMaxIncomeRow.create(
      {
        availabilitySettingsId: id,
        scope: apiScopeToDb(sk),
        maxIncome: (w as { maxIncome: number }).maxIncome,
        enforcement: w.enforcement,
        rollingDirection: 'direction' in w ? ((w as { direction?: string }).direction ?? null) : null,
      },
      { transaction: t }
    )
  }
}

export async function persistDifferentialAttendeesChunk(
  id: string,
  differential: AvailabilitySettingsData['differentialPerspectives'],
  t: Transaction,
  logger: Pick<Logger, 'debug'>
): Promise<void> {
  const allowedDifferentialIds = await getStateControlUserTypeBlockInstanceIdSet(t)
  const { majorSanitized, minorSanitized, droppedMajor, droppedMinor } =
    sanitizeDifferentialAttendeeIdsForPersist(differential, allowedDifferentialIds)
  if (droppedMajor.length > 0) {
    logger.debug('persistAvailabilityData: dropped major attendee ids (ineligible block instance)', {
      dropped: droppedMajor,
    })
  }
  if (droppedMinor.length > 0) {
    logger.debug('persistAvailabilityData: dropped minor attendee ids (ineligible block instance)', {
      dropped: droppedMinor,
    })
  }
  if (majorSanitized.length > 0) {
    let so = 0
    for (const v of majorSanitized) {
      await AvailabilityDifferentialAttendee.create(
        { availabilitySettingsId: id, role: 'major', sortOrder: so++, value: String(v) },
        { transaction: t }
      )
    }
  }
  if (minorSanitized.length > 0) {
    let so = 0
    for (const v of minorSanitized) {
      await AvailabilityDifferentialAttendee.create(
        { availabilitySettingsId: id, role: 'minor', sortOrder: so++, value: String(v) },
        { transaction: t }
      )
    }
  }
}
