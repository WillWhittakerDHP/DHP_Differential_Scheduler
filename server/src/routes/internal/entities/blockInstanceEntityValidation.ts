import { ENTITY_KEYS } from '../../../constants/entities.js'

/** Sequelize `block_instances` boolean flags (camelCase API / model attributes). */
const BLOCK_INSTANCE_STRICT_BOOLEAN_KEYS = ['composite', 'orchestrator', 'wizardVisible'] as const

export function isBlockInstanceEntityType(entityType: string): boolean {
  return entityType === ENTITY_KEYS.BLOCK_INSTANCE || entityType === 'blockInstance'
}

/**
 * When any watched key exists on the payload, its value must be a JSON boolean (not string/number/null).
 * Omitted keys are valid (Sequelize defaults on create; partial updates).
 */
export function validateBlockInstanceBooleanFields(body: Record<string, unknown>): string | null {
  for (const key of BLOCK_INSTANCE_STRICT_BOOLEAN_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) {
      continue
    }
    const value = body[key]
    if (value === undefined) {
      continue
    }
    if (typeof value !== 'boolean') {
      return `Block instance field "${key}" must be a boolean (true or false).`
    }
  }
  return null
}
