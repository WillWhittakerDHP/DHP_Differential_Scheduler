/**
 * User Type Mapping Utility
 * 
 *      the UserTypeBlock system uses admin-configurable BlockInstances
 * 
 * SESSION: 2.1.3b - Appointment Attendees Architecture
 */

import { BlockInstance, BlockShape } from '../config/app.js';
import { Op } from 'sequelize';
import { createLogger } from './logger.js';
import { USER_ROLE_CLIENT, USER_ROLE_AGENT, ATTENDEE_ROLE_AGENT } from '../constants/userRoles.js';

const logger = createLogger('UserTypeMapping');

/**
 * Mapping from hardcoded user roles to expected UserTypeBlock names
 *           use business-friendly names like 'Buyer', ATTENDEE_ROLE_AGENT
 */
const ROLE_TO_BLOCK_NAME: Record<string, string> = {
  [USER_ROLE_CLIENT]: 'Buyer',           // Primary client = Buyer in real estate context
  [USER_ROLE_AGENT]: ATTENDEE_ROLE_AGENT, // Real estate agent
  'transaction_manager': 'Transaction Manager',
  'seller': 'Seller',
  'inspector': 'Inspector',    // The service provider/technician
};

/**
 * Cache for UserTypeBlock lookups (avoids repeated DB queries)
 */
let userTypeBlockCache: Map<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get UserTypeBlock ID for a given user role
 * 
 * @param role - Hardcoded role from Users table (USER_ROLE_CLIENT, USER_ROLE_AGENT, etc.)
 * @returns UserTypeBlock ID or null if not found
 */
export async function getUserTypeBlockIdForRole(role: string): Promise<string | null> {
  const blockName = ROLE_TO_BLOCK_NAME[role];
  if (!blockName) {
    logger.warn(`No mapping found for role: ${role}`);
    return null;
  }

  if (userTypeBlockCache && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    const cachedId = userTypeBlockCache.get(blockName);
    if (cachedId) {
      return cachedId;
    }
  }

  try {
    const userTypeBlock = await findUserTypeBlockByName(blockName);
    
    if (userTypeBlock) {
      if (!userTypeBlockCache) {
        userTypeBlockCache = new Map();
      }
      userTypeBlockCache.set(blockName, userTypeBlock.id);
      cacheTimestamp = Date.now();
      
      return userTypeBlock.id;
    }
    
    logger.warn(`UserTypeBlock not found for name: ${blockName}`);
    return null;
    
  } catch (error) {
    logger.error(`Error looking up UserTypeBlock for role ${role}:`, error);
    return null;
  }
}

/**
 * Find UserTypeBlock by name
 */
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
