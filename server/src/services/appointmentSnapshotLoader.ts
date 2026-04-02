import { Model } from 'sequelize';
import { BlockInstanceVersion, PartInstanceVersion, AppointmentSelectionLine } from '../config/app.js';
import { linesToFlatSelectionFields } from '../repositories/appointmentSelectionCodec.js'
import type { BlockInstanceSnapshot } from '../db/models/booking/appointment.js';
import { createLogger } from '../utils/logger.js';
import { asEmptyString } from '../utils/safeDefaults.js';

const logger = createLogger('SnapshotLoader');

/**
 * WHY: Transform block instance version to BookingBlockInstance format
WHY: Ver...

PATTERN: Transform versions to Book...
 */
function transformBlockVersionToBookingInstance(
  blockVersion: InstanceType<typeof BlockInstanceVersion>
): BlockInstanceSnapshot {
  const versionData = blockVersion instanceof Model ? blockVersion.toJSON() : blockVersion as Record<string, unknown>;
  const rawPartVersions = blockVersion.partInstanceVersions;
  if (rawPartVersions === undefined || rawPartVersions === null) {
    logger.debug('transformBlockVersionToBookingInstance: partInstanceVersions missing, using []');
  }
  const partVersions = rawPartVersions !== undefined && rawPartVersions !== null ? rawPartVersions : [];

  return {
    id: versionData.blockInstanceId as string,
    name: versionData.name as string,
    icon: asEmptyString(versionData.icon as string | null | undefined),
    baseSqFt: (versionData.baseSqFt as number | null) ?? 0,
    allowMultiple: Boolean(versionData.allowMultiple),
    orchestrator: Boolean(versionData.orchestrator),
    wizardVisible: Boolean(versionData.wizardVisible),
    partInstances: partVersions.map((partVersion: Model) => {
      const partData = partVersion.toJSON() as Record<string, unknown>;
      return {
        id: partData.partInstanceId as string,
        name: asEmptyString(partData.name as string | null | undefined),
        baseFee: partData.baseFee as number,
        baseTime: partData.baseTime as number,
        rateOverBaseFee: partData.rateOverBaseFee as number,
        rateOverBaseTime: partData.rateOverBaseTime as number,
      };
    }),
  };
}

async function loadBlockInstanceFromVersion(
  versionId: string
): Promise<BlockInstanceSnapshot | null> {
  const blockVersion = await BlockInstanceVersion.findByPk(versionId, {
    include: [{ 
      model: PartInstanceVersion, 
      as: 'partInstanceVersions' 
    }]
  });
  
  if (!blockVersion) {
    logger.warn(`Version ${versionId} not found`);
    return null; // Graceful degradation
  }
  
  return transformBlockVersionToBookingInstance(blockVersion);
}

async function loadAppointmentVersions(
  snapshotIds: string[]
): Promise<BlockInstanceSnapshot[]> {
  if (!snapshotIds || snapshotIds.length === 0) {
    return [];
  }

  const versions = await Promise.all(
    snapshotIds.map(id => loadBlockInstanceFromVersion(id))
  );
  
  const validVersions = versions.filter((v): v is NonNullable<typeof v> => v !== null);
  
  if (validVersions.length !== snapshotIds.length) {
    logger.warn(
      `Some versions missing: ${snapshotIds.length - validVersions.length} of ${snapshotIds.length}`
    );
  }
  
  return validVersions;
}

function snapshotIdsOrEmpty(
  appointment: { serviceSnapshotIds?: string[] | null; propertySnapshotIds?: string[] | null; optionSnapshotIds?: string[] | null },
  key: 'serviceSnapshotIds' | 'propertySnapshotIds' | 'optionSnapshotIds'
): string[] {
  const raw = appointment[key];
  if (raw === undefined || raw === null) {
    logger.debug(`loadAllAppointmentVersions: ${key} missing, using []`);
    return [];
  }
  return raw;
}

async function loadAllAppointmentVersions(appointment: {
  serviceSnapshotIds?: string[] | null;
  propertySnapshotIds?: string[] | null;
  optionSnapshotIds?: string[] | null;
}): Promise<{
  services: BlockInstanceSnapshot[];
  properties: BlockInstanceSnapshot[];
  options: BlockInstanceSnapshot[];
}> {
  const [services, properties, options] = await Promise.all([
    loadAppointmentVersions(snapshotIdsOrEmpty(appointment, 'serviceSnapshotIds')),
    loadAppointmentVersions(snapshotIdsOrEmpty(appointment, 'propertySnapshotIds')),
    loadAppointmentVersions(snapshotIdsOrEmpty(appointment, 'optionSnapshotIds')),
  ]);

  return { services, properties, options };
}

export async function loadAllAppointmentVersionsForAppointmentId(
  appointmentId: string
): Promise<{
  services: BlockInstanceSnapshot[];
  properties: BlockInstanceSnapshot[];
  options: BlockInstanceSnapshot[];
}> {
  const lines = await AppointmentSelectionLine.findAll({ where: { appointmentId } })
  const flat = linesToFlatSelectionFields(lines)
  return loadAllAppointmentVersions({
    serviceSnapshotIds: flat.serviceSnapshotIds,
    propertySnapshotIds: flat.propertySnapshotIds,
    optionSnapshotIds: flat.optionSnapshotIds,
  })
}
