import { Op, Model } from 'sequelize';
import type { InferAttributes } from 'sequelize';
import { BlockInstance, PartInstance, Appointment, BlockInstanceVersion, PartInstanceVersion, ActiveConstituent } from '../config/app.js';

/**
 * Instance Versioning Service
 * 
 * LEARNING: Lazy versioning - creates immutable versions only when appointments reference instances
 * WHY: Preserves historical data for appointments while avoiding unnecessary storage
 * PATTERN: Temporal/tuple versioning - immutable snapshots of block and part instances
 * 
 * CRITICAL: Capture old state BEFORE update/delete to preserve historical data correctly
 */

// Use InstanceType for Sequelize model instances
type BlockInstanceType = InstanceType<typeof BlockInstance>;
type BlockInstanceVersionType = InstanceType<typeof BlockInstanceVersion>;

/**
 * Check if version matches instance (field equality)
 * WHY: Avoid creating duplicate versions for identical data
 */
function versionsMatch(
  version: BlockInstanceVersionType | InstanceType<typeof BlockInstanceVersion>,
  instance: BlockInstanceType | InstanceType<typeof BlockInstance>
): boolean {
  // Convert to plain objects if they're Sequelize instances
  const versionData: any = version instanceof Model ? version.toJSON() : version;
  const instanceData: any = instance instanceof Model ? instance.toJSON() : instance;
  
  return versionData.name === instanceData.name &&
         versionData.icon === instanceData.icon &&
         versionData.baseSqFt === instanceData.baseSqFt &&
         versionData.allowMultiple === instanceData.allowMultiple &&
         versionData.differential === instanceData.differential;
}

/**
 * Find appointments using a block instance
 * Checks all appointment array fields (selectedServiceIds, selectedPropertyIds, selectedOptionIds)
 */
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

/**
 * Create a block instance version from an instance
 * Includes creating part instance versions as children
 */
async function createVersionFromInstance(
  blockInstance: BlockInstanceType | InstanceType<typeof BlockInstance>
): Promise<InstanceType<typeof BlockInstanceVersion>> {
  // Convert to plain object if it's a Sequelize instance
  const instanceData = blockInstance instanceof Model ? blockInstance.toJSON() : blockInstance;
  
  // Create block instance version
  const blockVersion = await BlockInstanceVersion.create({
    blockInstanceId: instanceData.id,
    name: instanceData.name,
    icon: instanceData.icon,
    baseSqFt: instanceData.baseSqFt,
    allowMultiple: instanceData.allowMultiple,
    differential: instanceData.differential,
  });

  // Get part instances for this block instance via ActiveConstituent
  // Use the belongsToMany relationship through ActiveConstituent
  const blockInstanceWithParts = await BlockInstance.findByPk(instanceData.id, {
    include: [
      {
        model: PartInstance,
        as: 'active_constituent_part_instances',
        through: {
          where: { disabled: false },
        },
      }
    ]
  });

  // Create part instance versions
  // Type assertion needed because Sequelize includes don't preserve exact types
  const partInstances = (blockInstanceWithParts as any)?.active_constituent_part_instances as InstanceType<typeof PartInstance>[] | undefined;
  
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
  // 1. Check if any appointments reference this block instance
  const appointments = await findAppointmentsUsingBlockInstance(blockInstanceId);
  
  if (appointments.length === 0) {
    return null; // No need to create version
  }
  
  // 2. Check if latest version matches current state (reuse if identical)
  const latestVersion = await BlockInstanceVersion.findOne({
    where: { blockInstanceId },
    order: [['createdAt', 'DESC']],
  });
  
  if (latestVersion && versionsMatch(latestVersion, oldBlockInstance)) {
    return latestVersion.id; // Reuse existing version
  }
  
  // 3. Create immutable block instance version with OLD data
  const blockVersion = await createVersionFromInstance(oldBlockInstance);
  
  return blockVersion.id;
}

/**
 * Create a version for a block instance (used during appointment creation)
 * Checks for existing matching version before creating new one
 */
export async function createBlockInstanceVersion(
  blockInstanceId: string
): Promise<InstanceType<typeof BlockInstanceVersion>> {
  // Get current instance with part instances
  const instance = await BlockInstance.findByPk(blockInstanceId, {
    include: [
      {
        model: PartInstance,
        as: 'active_constituent_part_instances',
        through: {
          where: { disabled: false },
        },
      }
    ]
  });

  if (!instance) {
    throw new Error(`Block instance ${blockInstanceId} not found`);
  }

  // Check if latest version matches current state
  const latestVersion = await BlockInstanceVersion.findOne({
    where: { blockInstanceId },
    order: [['createdAt', 'DESC']],
  });

  if (latestVersion && versionsMatch(latestVersion, instance)) {
    return latestVersion; // Reuse existing version
  }

  // Create new version
  return await createVersionFromInstance(instance);
}
