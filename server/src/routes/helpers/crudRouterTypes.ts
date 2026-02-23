
import type { Request, Response, RequestHandler } from 'express'
import type { Model, ModelStatic, Includeable, Order } from 'sequelize'
import type { ValidationResult } from './routerValidators.js'

export interface CrudErrorMessages {
  FETCH_ALL: string
  FETCH_ONE: string
  NOT_FOUND: string
  CREATE: string
  UPDATE: string
  PATCH?: string
  DELETE: string
}

export interface CrudHandlerContext<T extends Model> {
  model: ModelStatic<T>
  resourceName: string
  errorMessages: CrudErrorMessages
  paramKey: string
  beforeCreate?: (req: Request, res: Response) => Promise<void>
  afterCreate?: (record: T, req: Request, res: Response) => Promise<void>
  beforeUpdate?: (req: Request, res: Response) => Promise<void>
  afterUpdate?: (record: T, req: Request, res: Response) => Promise<void>
  beforeDelete?: (record: T, req: Request, res: Response) => Promise<void>
  transformResponse?: (record: T) => unknown
  sanitizeInput?: (data: unknown, method: 'create' | 'update' | 'patch') => unknown
  validateRequest?: (req: Request, method: 'create' | 'update' | 'patch') => ValidationResult
  defaultIncludes?: Includeable[]
  defaultOrder?: Order
  constraintHandler?: (error: unknown, res: Response, entityId?: string) => boolean
}

export interface CrudRouterConfig<T extends Model> {
  /** Sequelize model for CRUD operations */
  model: ModelStatic<T>
  /** Resource name for error messages (e.g., 'user', 'appointment') */
  resourceName: string
  /** Error messages for all CRUD operations */
  errorMessages: CrudErrorMessages
  /** Parameter key for ID lookups (defaults to 'id', can be 'key' for settings) */
  paramKey?: string
  /** Lifecycle hooks (all optional) */
  beforeCreate?: (req: Request, res: Response) => Promise<void>
  afterCreate?: (record: T, req: Request, res: Response) => Promise<void>
  beforeUpdate?: (req: Request, res: Response) => Promise<void>
  afterUpdate?: (record: T, req: Request, res: Response) => Promise<void>
  beforeDelete?: (record: T, req: Request, res: Response) => Promise<void>
  /** Data transformation */
  transformResponse?: (record: T) => unknown
  sanitizeInput?: (data: unknown, method: 'create' | 'update' | 'patch') => unknown
  /** Request validation */
  validateRequest?: (req: Request, method: 'create' | 'update' | 'patch') => ValidationResult
  /** Query customization */
  defaultIncludes?: Includeable[]
  defaultOrder?: Order
  /** Feature flags */
  enablePost?: boolean
  enablePut?: boolean
  enablePatch?: boolean
  enableDelete?: boolean
  /** Custom constraint error handler (optional) */
  constraintHandler?: (error: unknown, res: Response, entityId?: string) => boolean
  /** Custom GET / handler (optional - if provided, overrides default GET /) */
  customGetAllHandler?: (req: Request, res: Response) => Promise<void>
  /** Custom GET /:id handler (optional - if provided, overrides default GET /:id) */
  customGetByIdHandler?: (req: Request, res: Response) => Promise<void>
  /** Middleware to run before GET /:id (e.g. checkOwnership for IDOR protection) */
  getByIdMiddleware?: RequestHandler[]
}

export type RouteHandler = (req: Request, res: Response) => Promise<void>
