
import { BlockInstance, BlockShape } from '../config/app.js';
import { Op } from 'sequelize';
import { createLogger } from './logger.js';
import { USER_ROLE_CLIENT, USER_ROLE_AGENT, ATTENDEE_ROLE_AGENT } from '../constants/userRoles.js';

const logger = createLogger('UserTypeMapping');

const ROLE_TO_BLOCK_NAME: Record<string, string> = {
  [USER_ROLE_CLIENT]: 'Buyer',           // Primary client = Buyer in real estate context
  [USER_ROLE_AGENT]: ATTENDEE_ROLE_AGENT, // Real estate agent
  'transaction_manager': 'Transaction Manager',
  'seller': 'Seller',
  'inspector': 'Inspector',    // The service provider/technician
};

let userTypeBlockCache: Map<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

export async function getUserTypeBlockIdForRole(role: string): Promise<string | null> {
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
  const stateControlShapes = await BlockShape.findAll({
    where: { isStateControl: true },
    attributes: ['id']
  });
  
  if (stateControlShapes.length === 0) {
    logger.warn('No state control BlockShapes found');
    return null;
  }
  
  const stateControlShapeIds = stateControlShapes.map(s => s.id);
  
  const blockInstance = await BlockInstance.findOne({
    where: {
      name: name,
      blockShapeRef: { [Op.in]: stateControlShapeIds }
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
