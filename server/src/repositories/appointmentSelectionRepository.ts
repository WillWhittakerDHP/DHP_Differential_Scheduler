import type { Transaction } from 'sequelize'
import { AppointmentSelectionLine } from '../config/app.js'
import { createBlockInstanceVersion } from '../services/instanceVersioning.js'
import {
  flatSelectionBodyToLineCreates,
  linesToFlatSelectionFields,
  mergeFlatSelectionPatch,
  flatSelectionFieldsToBody,
} from './appointmentSelectionCodec.js'

function lineSortKey(line: InstanceType<typeof AppointmentSelectionLine>): [number, number] {
  const rank = line.lineKind === 'service' ? 0 : line.lineKind === 'time' ? 1 : 2
  return [rank, line.sortOrder]
}

async function replaceSelectionLinesFromBody(
  appointmentId: string,
  body: Record<string, unknown>,
  transaction?: Transaction
): Promise<void> {
  const rows = flatSelectionBodyToLineCreates(appointmentId, body)
  await AppointmentSelectionLine.destroy({ where: { appointmentId }, transaction })
  if (rows.length > 0) {
    await AppointmentSelectionLine.bulkCreate(rows, { transaction })
  }
}

async function fillMissingSnapshotVersionIds(
  appointmentId: string,
  transaction?: Transaction
): Promise<void> {
  const lines = await AppointmentSelectionLine.findAll({
    where: { appointmentId },
    transaction,
  })
  lines.sort((a, b) => {
    const ka = lineSortKey(a)
    const kb = lineSortKey(b)
    if (ka[0] !== kb[0]) return ka[0] - kb[0]
    return ka[1] - kb[1]
  })
  for (const line of lines) {
    if (line.snapshotVersionId) continue
    const version = await createBlockInstanceVersion(line.blockInstanceId)
    await line.update({ snapshotVersionId: version.id }, { transaction })
  }
}

export async function syncSelectionsAndSnapshotsFromBody(
  appointmentId: string,
  body: Record<string, unknown>,
  transaction?: Transaction
): Promise<void> {
  await replaceSelectionLinesFromBody(appointmentId, body, transaction)
  await fillMissingSnapshotVersionIds(appointmentId, transaction)
}

export async function applyMergedSelectionPatch(
  appointmentId: string,
  patchBody: Record<string, unknown>,
  transaction?: Transaction
): Promise<void> {
  const existing = await AppointmentSelectionLine.findAll({ where: { appointmentId }, transaction })
  const existingFlat = linesToFlatSelectionFields(existing)
  const merged = mergeFlatSelectionPatch(existingFlat, patchBody)
  const synthetic = flatSelectionFieldsToBody(merged)
  await syncSelectionsAndSnapshotsFromBody(appointmentId, synthetic, transaction)
}
