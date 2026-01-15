import type { InferAttributes } from 'sequelize';
import { Model } from 'sequelize';
import { BlockInstanceVersion, PartInstanceVersion } from '../config/app.js';
import { Op } from 'sequelize';

/**
 * Appointment Snapshot Loader Service
 * 
 * LEARNING: Loads block instance versions for appointments
 * WHY: Provides complete historical data for appointments
 * PATTERN: Transform versions to BookingBlockInstance format
 */

// Use InstanceType for Sequelize model instances
type BlockInstanceVersionType = InstanceType<typeof BlockInstanceVersion>;
type PartInstanceVersionType = InstanceType<typeof PartInstanceVersion>;

/**
 * Transform block instance version to BookingBlockInstance format
 * WHY: Versions are complete - no merge needed, just transform format
 */
function transformBlockVersionToBookingInstance(
  blockVersion: InstanceType<typeof BlockInstanceVersion> & { partInstanceVersions?: InstanceType<typeof PartInstanceVersion>[] }
): any {
  // Convert to plain object if it's a Sequelize instance
  const versionData = blockVersion instanceof Model ? blockVersion.toJSON() : blockVersion;
  const partVersions = versionData.partInstanceVersions || [];
  
  return {
    id: versionData.blockInstanceId, // Use original instance ID
    name: versionData.name,
    icon: versionData.icon,
    baseSqFt: versionData.baseSqFt,
    allowMultiple: versionData.allowMultiple,
    differential: versionData.differential,
    partInstances: partVersions.map((partVersion: InstanceType<typeof PartInstanceVersion> | PartInstanceVersionType) => {
      const partData = partVersion instanceof Model ? partVersion.toJSON() : partVersion;
      return {
        id: partData.partInstanceId, // Use original instance ID
        name: partData.name,
        baseFee: partData.baseFee,
        baseTime: partData.baseTime,
        rateOverBaseFee: partData.rateOverBaseFee,
        rateOverBaseTime: partData.rateOverBaseTime,
      };
    }),
  };
}

/**
 * Load block instance from version with error handling
 * WHY: Graceful degradation if version missing
 */
export async function loadBlockInstanceFromVersion(
  versionId: string
): Promise<any | null> {
  const blockVersion = await BlockInstanceVersion.findByPk(versionId, {
    include: [{ 
      model: PartInstanceVersion, 
      as: 'partInstanceVersions' 
    }]
  });
  
  if (!blockVersion) {
    console.warn(`[SnapshotLoader] Version ${versionId} not found`);
    return null; // Graceful degradation
  }
  
  // Transform version to BookingBlockInstance format
  return transformBlockVersionToBookingInstance(blockVersion);
}

/**
 * Load all versions for appointment
 * Filters out missing versions with warnings
 */
export async function loadAppointmentVersions(
  snapshotIds: string[]
): Promise<any[]> {
  if (!snapshotIds || snapshotIds.length === 0) {
    return [];
  }

  const versions = await Promise.all(
    snapshotIds.map(id => loadBlockInstanceFromVersion(id))
  );
  
  // Filter out nulls (missing versions)
  const validVersions = versions.filter(v => v !== null) as any[];
  
  if (validVersions.length !== snapshotIds.length) {
    console.warn(
      `[SnapshotLoader] Some versions missing: ${snapshotIds.length - validVersions.length} of ${snapshotIds.length}`
    );
  }
  
  return validVersions;
}

/**
 * Load versions for all appointment snapshot arrays
 * Returns object with service, property, and option versions
 */
export async function loadAllAppointmentVersions(appointment: {
  serviceSnapshotIds?: string[] | null;
  propertySnapshotIds?: string[] | null;
  optionSnapshotIds?: string[] | null;
}): Promise<{
  services: any[];
  properties: any[];
  options: any[];
}> {
  const [services, properties, options] = await Promise.all([
    loadAppointmentVersions(appointment.serviceSnapshotIds || []),
    loadAppointmentVersions(appointment.propertySnapshotIds || []),
    loadAppointmentVersions(appointment.optionSnapshotIds || []),
  ]);

  return { services, properties, options };
}
