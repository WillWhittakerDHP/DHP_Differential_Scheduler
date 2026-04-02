import { Model } from 'sequelize';
import {
  BlockInstance,
  PartInstance,
  Appointment,
  AppointmentSelectionLine,
  BlockInstanceVersion,
  PartInstanceVersion,
} from '../config/app.js';
import { FIELD_NAMES, SORT_ORDERS } from '../routes/internal/entities/entityConstants.js';

/**
 * Instance Versioning Service
 * 
 * 
 * CRITICAL: Capture old state BEFORE update/delete to preserve historical data correctly
 */

type BlockInstanceType = InstanceType<typeof BlockInstance>;
type BlockInstanceVersionType = InstanceType<typeof BlockInstanceVersion>;
/** Sequelize include adds part_assignment_instances; base type does not declare it. */
type BlockInstanceWithPartAssignments = BlockInstanceType & { part_assignment_instances?: InstanceType<typeof PartInstance>[] };

interface BlockInstanceVersionComparison {
  name?: string;
  icon?: string | null;
  baseSqFt?: number | null;
  allowMultiple?: boolean;
  orchestrator?: boolean;
  wizardVisible?: boolean;
  preClosing?: boolean;
}

function versionsMatch(
  version: BlockInstanceVersionType | InstanceType<typeof BlockInstanceVersion>,
  instance: BlockInstanceType | InstanceType<typeof BlockInstance>
): boolean {
  const versionData: BlockInstanceVersionComparison = (version instanceof Model ? version.toJSON() : version) as BlockInstanceVersionComparison;
  const instanceData: BlockInstanceVersionComparison = (instance instanceof Model ? instance.toJSON() : instance) as BlockInstanceVersionComparison;
  
  return versionData.name === instanceData.name &&
         versionData.icon === instanceData.icon &&
         versionData.baseSqFt === instanceData.baseSqFt &&
         versionData.allowMultiple === instanceData.allowMultiple &&
         versionData.orchestrator === instanceData.orchestrator &&
         versionData.wizardVisible === instanceData.wizardVisible &&
         versionData.preClosing === instanceData.preClosing;
}

async function findAppointmentsUsingBlockInstance(
  blockInstanceId: string
): Promise<InstanceType<typeof Appointment>[]> {
  return await Appointment.findAll({
    include: [
      {
        model: AppointmentSelectionLine,
        as: 'selectionLines',
        required: true,
        where: { blockInstanceId },
      },
    ],
  });
}

async function createVersionFromInstance(
  blockInstance: BlockInstanceType | InstanceType<typeof BlockInstance>
): Promise<InstanceType<typeof BlockInstanceVersion>> {
  const instanceData = blockInstance instanceof Model ? blockInstance.toJSON() : blockInstance;
  
  const blockVersion = await BlockInstanceVersion.create({
    blockInstanceId: instanceData.id,
    name: instanceData.name,
    icon: instanceData.icon,
    baseSqFt: instanceData.baseSqFt,
    allowMultiple: instanceData.allowMultiple,
    orchestrator: instanceData.orchestrator,
    wizardVisible: instanceData.wizardVisible,
    preClosing: instanceData.preClosing ?? false,
  });

  const blockInstanceWithParts = await BlockInstance.findByPk(instanceData.id, {
    include: [
      {
        model: PartInstance,
        as: 'part_assignment_instances',
        through: {
          where: { disabled: false },
        },
      }
    ]
  }) as BlockInstanceWithPartAssignments | null;

  const partInstances = blockInstanceWithParts?.part_assignment_instances;
  
  if (partInstances && partInstances.length > 0) {
    await PartInstanceVersion.bulkCreate(
      partInstances.map((part: InstanceType<typeof PartInstance>) => {
        const partData = part instanceof Model ? part.toJSON() : part;
        return {
          blockInstanceVersionId: blockVersion.id,
          partInstanceId: partData.id,
          name: partData.name,
          baseFee: partData.baseFee,
          baseTime: partData.baseTime,
          rateOverBaseFee: partData.rateOverBaseFee,
          rateOverBaseTime: partData.rateOverBaseTime,
        };
      })
    );
  }

  return blockVersion;
}

/**
 * PATTERN: CRITICAL: Capture old state BEFORE update
PATTERN: Pass old data as para...
 */
export async function createBlockInstanceVersionIfReferenced(
  blockInstanceId: string,
  oldBlockInstance: BlockInstanceType | InstanceType<typeof BlockInstance>  // CRITICAL: Pass OLD data
): Promise<string | null> {
  const appointments = await findAppointmentsUsingBlockInstance(blockInstanceId);
  
  if (appointments.length === 0) {
    return null; // No need to create version
  }
  
  const latestVersion = await BlockInstanceVersion.findOne({
    where: { blockInstanceId },
    order: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.DESC]],
  });
  
  if (latestVersion && versionsMatch(latestVersion, oldBlockInstance)) {
    return latestVersion.id; // Reuse existing version
  }
  
  // 3. Create immutable block instance version with OLD data
  const blockVersion = await createVersionFromInstance(oldBlockInstance);
  
  return blockVersion.id;
}

export async function createBlockInstanceVersion(
  blockInstanceId: string
): Promise<InstanceType<typeof BlockInstanceVersion>> {
  const instance = await BlockInstance.findByPk(blockInstanceId, {
    include: [
      {
        model: PartInstance,
        as: 'part_assignment_instances',
        through: {
          where: { disabled: false },
        },
      }
    ]
  });

  if (!instance) {
    throw new Error(`Block instance ${blockInstanceId} not found`);
  }

  const latestVersion = await BlockInstanceVersion.findOne({
    where: { blockInstanceId },
    order: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.DESC]],
  });

  if (latestVersion && versionsMatch(latestVersion, instance)) {
    return latestVersion; // Reuse existing version
  }

  return await createVersionFromInstance(instance);
}
