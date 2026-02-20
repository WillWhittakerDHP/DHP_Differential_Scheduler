/**
 * User Type Mapping Utility
 * 
 * LEARNING: Bridges hardcoded user roles to dynamic UserTypeBlock system
 * WHY: Users table has hardcoded roles (USER_ROLE_CLIENT, USER_ROLE_AGENT, etc.) but
 *      the UserTypeBlock system uses admin-configurable BlockInstances
 * PATTERN: Maps role strings to UserTypeBlock (BlockInstance) IDs
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
 * LEARNING: The Users table uses USER_ROLE_CLIENT, USER_ROLE_AGENT, etc. but UserTypeBlocks
 *           use business-friendly names like 'Buyer', ATTENDEE_ROLE_AGENT
 * WHY: Need to translate between the two systems for calendar invitations
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
 * LEARNING: Simple in-memory cache for frequently accessed data
 * WHY: UserTypeBlocks rarely change, no need to query every time
 */
let userTypeBlockCache: Map<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get UserTypeBlock ID for a given user role
 * LEARNING: Translates hardcoded role to UserTypeBlock ID
 * WHY: appointment_attendees needs userTypeBlockInstanceId, not role string
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

  // Check cache
  if (userTypeBlockCache && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    const cachedId = userTypeBlockCache.get(blockName);
    if (cachedId) {
      return cachedId;
    }
  }

  // Query database
  try {
    const userTypeBlock = await findUserTypeBlockByName(blockName);
    
    if (userTypeBlock) {
      // Update cache
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
 * LEARNING: UserTypeBlocks are BlockInstances where blockShape.isStateControl === true
 * WHY: Distinguishes UserTypeBlocks from other BlockInstance types
 */
async function findUserTypeBlockByName(name: string): Promise<{ id: string; name: string } | null> {
  // First, find all state control BlockShapes
  const stateControlShapes = await BlockShape.findAll({
    where: { isStateControl: true },
    attributes: ['id']
  });
  
  if (stateControlShapes.length === 0) {
    logger.warn('No state control BlockShapes found');
    return null;
  }
  
  const stateControlShapeIds = stateControlShapes.map(s => s.id);
  
  // Find BlockInstance with matching name and state control shape
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
