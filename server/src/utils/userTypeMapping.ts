
import { BlockInstance, BlockShape } from '../config/app.js';
import { Op } from 'sequelize';
import { createLogger } from './logger.js';
import {
  USER_ROLE_AGENT,
  USER_ROLE_BUYER,
  USER_ROLE_OWNER,
  ATTENDEE_ROLE_AGENT,
} from '../constants/userRoles.js';

const logger = createLogger('UserTypeMapping');

const ROLE_TO_BLOCK_NAME: Record<string, string> = {
  [USER_ROLE_BUYER]: 'Buyer',
  [USER_ROLE_AGENT]: ATTENDEE_ROLE_AGENT, // Real estate agent
  // WHY: API role is `owner`; user-type block instance name may still be "Seller" until seed/admin rename (6.18.2+).
  [USER_ROLE_OWNER]: 'Seller',
  inspector: 'Inspector',
};

let userTypeBlockCache: Map<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/** Cached role → block_instance_id from `block_instances.semantic_type` on user-semantic shapes. */
let alignmentInstanceIdCache: Map<string, string> | null = null;
let alignmentCacheLoadedAt: number = 0;
const ALIGNMENT_CACHE_TTL = 60 * 1000;

function readCachedBlockId(blockName: string): string | null {
  if (!userTypeBlockCache || Date.now() - cacheTimestamp >= CACHE_TTL) {
    return null;
  }
  return userTypeBlockCache.get(blockName) ?? null;
}

function rememberBlockId(blockName: string, id: string): void {
  if (!userTypeBlockCache) {
    userTypeBlockCache = new Map();
  }
  userTypeBlockCache.set(blockName, id);
  cacheTimestamp = Date.now();
}

async function ensureAlignmentInstanceIdsLoaded(): Promise<void> {
  if (
    alignmentInstanceIdCache !== null &&
    Date.now() - alignmentCacheLoadedAt < ALIGNMENT_CACHE_TTL
  ) {
    return;
  }
  const rows = await BlockInstance.findAll({
    attributes: ['id', 'semanticType'],
    where: {
      semanticType: { [Op.ne]: null },
    },
    include: [
      {
        model: BlockShape,
        as: 'block_shape',
        attributes: ['id'],
        where: { semanticType: 'user' },
        required: true,
      },
    ],
  });
  const map = new Map<string, string>();
  for (const row of rows) {
    const st = row.semanticType;
    if (typeof st === 'string' && st.length > 0) {
      map.set(st, String(row.id));
    }
  }
  alignmentInstanceIdCache = map;
  alignmentCacheLoadedAt = Date.now();
}

/**
 * Clears name-based and column-backed role→instance caches (call after block instance / shape updates).
 */
export function invalidateUserTypeMappingCaches(): void {
  userTypeBlockCache = null;
  cacheTimestamp = 0;
  alignmentInstanceIdCache = null;
  alignmentCacheLoadedAt = 0;
}

export async function getUserTypeBlockIdForRole(role: string): Promise<string | null> {
  await ensureAlignmentInstanceIdsLoaded();
  const columnId = alignmentInstanceIdCache?.get(role);
  if (columnId !== undefined) {
    return columnId;
  }

  const blockName = ROLE_TO_BLOCK_NAME[role];
  if (!blockName) {
    logger.warn(`No mapping found for role: ${role}`);
    return null;
  }

  const cached = readCachedBlockId(blockName);
  if (cached) {
    return cached;
  }

  try {
    const userTypeBlock = await findUserTypeBlockByName(blockName);
    if (!userTypeBlock) {
      logger.warn(`UserTypeBlock not found for name: ${blockName}`);
      return null;
    }
    rememberBlockId(blockName, userTypeBlock.id);
    return userTypeBlock.id;
  } catch (error) {
    logger.error(`Error looking up UserTypeBlock for role ${role}:`, error);
    return null;
  }
}

async function findUserTypeBlockByName(name: string): Promise<{ id: string; name: string } | null> {
  const userShapes = await BlockShape.findAll({
    where: { semanticType: 'user' },
    attributes: ['id']
  });
  
  if (userShapes.length === 0) {
    logger.warn('No user-type BlockShapes found');
    return null;
  }
  
  const userShapeIds = userShapes.map(s => s.id);
  
  const blockInstance = await BlockInstance.findOne({
    where: {
      name: name,
      blockShapeRef: { [Op.in]: userShapeIds }
    },
    attributes: ['id', 'name']
  });
  
  if (!blockInstance) {
    return null;
  }
  
  return {
    id: blockInstance.id,
    name: blockInstance.name
  };
}
