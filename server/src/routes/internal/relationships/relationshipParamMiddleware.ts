
import { Request, Response, NextFunction } from 'express'
import { RELATIONSHIP_REGISTRY } from './relationshipConstants.js'
import { isValidRelationshipKind, normalizeRelationshipKind } from './relationshipValidators.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

/**
PATTERN: Express param middleware th...
 */
export function relationshipTypeParamHandler(
  req: Request, res: Response, next: NextFunction, relationshipType: string
): void {
  if (!isValidRelationshipKind(relationshipType)) {
    res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
      error: `Unknown relationship kind: ${relationshipType}`,
      validKinds: Object.keys(RELATIONSHIP_REGISTRY)
    })
    return
  }
  
  const normalizedKind = normalizeRelationshipKind(relationshipType)
  req.relationshipConfig = RELATIONSHIP_REGISTRY[normalizedKind]
  next()
}
