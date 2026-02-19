import { Op, Model } from 'sequelize';
import { BlockInstance, PartInstance, Appointment, BlockInstanceVersion, PartInstanceVersion } from '../config/app.js';
import { FIELD_NAMES, SORT_ORDERS } from '../routes/internal/entities/entityConstants.js';

/**
 * Instance Versioning Service
 * 
 * LEARNING: Lazy versioning - creates immutable versions only when appointments reference instances
 * WHY: Preserves historical data for appointments while avoiding unnecessary storage
 * PATTERN: Temporal/tuple versioning - immutable snapshots of block and part instances
 * 
 * CRITICAL: Capture old state BEFORE update/delete to preserve historical data correctly
 */

type BlockInstanceType = InstanceType<typeof BlockInstance>;
type BlockInstanceVersionType = InstanceType<typeof BlockInstanceVersion>;
/** Sequelize include adds part_assignment_instances; base type does not declare it. */
type BlockInstanceWithPartAssignments = BlockInstanceType & { part_assignment_instances?: InstanceType<typeof PartInstance>[] };

function versionsMatch(
  version: BlockInstanceVersionType | InstanceType<typeof BlockInstanceVersion>,
  instance: BlockInstanceType | InstanceType<typeof BlockInstance>
): boolean {
  const versionData: any = version instanceof Model ? version.toJSON() : version;
  const instanceData: any = instance instanceof Model ? instance.toJSON() : instance;
  
  return versionData.name === instanceData.name &&
         versionData.icon === instanceData.icon &&
         versionData.baseSqFt === instanceData.baseSqFt &&
         versionData.allowMultiple === instanceData.allowMultiple &&
         versionData.differential === instanceData.differential;
}

async function findAppointmentsUsingBlockInstance(
  blockInstanceId: string
): Promise<InstanceType<typeof Appointment>[]> {
  return await Appointment.findAll({
    where: {
      [Op.or]: [
        { selectedServiceIds: { [Op.contains]: [blockInstanceId] } },
        { selectedPropertyIds: { [Op.contains]: [blockInstanceId] } },
        { selectedOptionIds: { [Op.contains]: [blockInstanceId] } },
      ]
    }
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
    differential: instanceData.differential,
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
 * CRITICAL: Capture old state BEFORE update
 * WHY: Versions must preserve historical data, not new data
 * PATTERN: Pass old data as parameter, don't fetch after update
 * 
 * Creates a block instance version if any appointments reference it
 * Returns the version ID if created, null if not needed
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
