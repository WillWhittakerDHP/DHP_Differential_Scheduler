import type { Transaction } from 'sequelize'
import { AppointmentTimeSlot } from '../config/app.js'
import {
  parseSelectedTimeSlotsBody,
  rowsToLegacySelectedTimeSlots,
} from './appointmentTimeSlotCodec.js'

export async function replaceTimeSlotsFromBody(
  appointmentId: string,
  raw: unknown,
  transaction?: Transaction
): Promise<void> {
  if (raw === undefined) return
  const parsed = parseSelectedTimeSlotsBody(raw)
  if (parsed === null) return

  await AppointmentTimeSlot.destroy({ where: { appointmentId }, transaction })

  if (parsed.length === 0) return

  await AppointmentTimeSlot.bulkCreate(
    parsed.map((row) => ({
      appointmentId,
      sortOrder: row.sortOrder,
      startAt: row.startAt,
      endAt: row.endAt,
      durationMinutes: row.durationMinutes,
      slotMetadata: row.slotMetadata,
    })),
    { transaction }
  )
}

export async function loadLegacySelectedTimeSlotsForAppointment(
  appointmentId: string,
  transaction?: Transaction
): Promise<Array<Record<string, unknown>> | null> {
  const rows = await AppointmentTimeSlot.findAll({
    where: { appointmentId },
    order: [['sortOrder', 'ASC']],
    transaction,
  })
  if (rows.length === 0) return null
  return rowsToLegacySelectedTimeSlots(rows)
}
