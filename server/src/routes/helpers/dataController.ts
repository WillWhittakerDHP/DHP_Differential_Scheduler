import { Model, ModelStatic, UpdateOptions, DestroyOptions, WhereOptions, Attributes } from "sequelize";
import { MakeNullishOptional } from "sequelize/types/utils";
import { getModelAttributes, isModelUnderscored } from "../../utils/sequelizeHelpers.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('DataController');

/**
 * Type helper for creating where clauses by ID
 * LEARNING: All Sequelize models in this codebase have id: CreationOptional<string>
 * WHY: Provides type-safe way to create where clauses without using 'as unknown as'
 * PATTERN: Extract id type from model attributes - all models use string IDs
 * 
 * API Best Practice: Use proper type extraction instead of type assertions
 * This ensures type safety while working with Sequelize's generic model types
 * 
 * Note: When querying by ID, the ID is always defined (string), even though
 * the attribute type is CreationOptional<string> (string | undefined)
 */
type WhereById<T extends Model> = {
  id: NonNullable<T["_attributes"]["id"]>;
};

/**
 * Generic fetch function to retrieve all records of a model.
 * 
 * IMPORTANT: For models with `underscored: true`, always specify `attributes` explicitly
 * to avoid duplicate columns in SQL queries (both snake_case and camelCase versions).
 * This function automatically detects `underscored: true` models and adds attributes if missing.
 * 
 * WHY: Models with `underscored: true` have camelCase attributes that map to snake_case database columns.
 * When `attributes` aren't specified, Sequelize selects both formats, creating duplicate columns.
 * 
 * PATTERN: Use `getModelAttributes()` utility from `sequelizeHelpers.ts` to extract attributes programmatically.
 * Example:
 * ```typescript
 * import { getModelAttributes } from '../../../utils/sequelizeHelpers.js';
 * const attributes = getModelAttributes(MyModel);
 * const data = await fetchAll(MyModel, { attributes });
 * ```
 * 
 * @param Entity - The Sequelize model to fetch.
 * @param options - Optional configuration object
 * @param options.includes - Optional array of Sequelize include options for associations
 * @param options.attributes - Optional array of attribute names to select (camelCase)
 * @param options.order - Optional array of order clauses (e.g., [['orderIndex', 'ASC']])
 * @returns An array of model instances.
 * 
 * WHY: Uses Model without generics for generic model references
 * PATTERN: T extends Model is sufficient when using ModelStatic<T>
 * LEARNING: Added includes parameter to support fetching associations (e.g., descriptions for blockInstance)
 * WHY: Enables fetching related data in a single query instead of multiple queries
 * PATTERN: Optional includes parameter allows flexible association loading
 * 
 * LEARNING: Automatically detects models with `underscored: true` and adds attributes if missing
 * WHY: Prevents duplicate columns in SQL queries (both snake_case and camelCase versions)
 * PATTERN: Fail-safe approach - automatically fixes the issue if attributes are missing
 * NOTE: A warning will be logged if auto-extraction is used, encouraging explicit specification
 */
const fetchAll = async <T extends Model>(
  Entity: ModelStatic<T>,
  options?: {
    includes?: any[];
    attributes?: string[];
    order?: any[];
  }
): Promise<T[]> => {
  const queryOptions: any = {};
  
  if (options?.includes && options.includes.length > 0) {
    queryOptions.include = options.includes;
  }
  
  if (options?.attributes) {
    queryOptions.attributes = options.attributes;
    } else {
      if (isModelUnderscored(Entity)) {
        const autoAttributes = getModelAttributes(Entity);
        queryOptions.attributes = autoAttributes;
        logger.warn(
          `Model ${Entity.name} uses underscored: true but attributes were not explicitly provided. ` +
          `Auto-extracted attributes: ${autoAttributes.join(', ')}. ` +
          `Consider specifying attributes explicitly for better performance and clarity.`
        );
      }
    }
  
  if (options?.order && options.order.length > 0) {
    queryOptions.order = options.order;
  }
  
  const result = await Entity.findAll(queryOptions);
  return result;
};

/**
 * Generic fetch function to retrieve a single record by ID.
 * 
 * IMPORTANT: For models with `underscored: true`, this function automatically adds attributes
 * to avoid duplicate columns in SQL queries (both snake_case and camelCase versions).
 * 
 * @param Entity - The Sequelize model.
 * @param id - The ID of the record to find.
 * @returns A single model instance or null if not found.
 * 
 * LEARNING: Automatically detects models with `underscored: true` and adds attributes if needed
 * WHY: Prevents duplicate columns in SQL queries (both snake_case and camelCase versions)
 * PATTERN: Fail-safe approach - automatically fixes the issue if attributes are missing
 */
const fetchById = async <T extends Model>(
  Entity: ModelStatic<T>,
  id: string
): Promise<T | null> => {
  const options: any = {};
  
  if (isModelUnderscored(Entity)) {
    options.attributes = getModelAttributes(Entity);
  }
  
  return await Entity.findByPk(id, options);
};


const createRecord = async <T extends Model>(
  Entity: ModelStatic<T>,
  data: MakeNullishOptional<T["_creationAttributes"]> // ✅ Enforces correct attribute types
): Promise<T> => {
  // PATTERN: Server validates and rejects invalid types with clear errors
  return await Entity.create(data);
};

const updateRecord = async <T extends Model>(
  Entity: ModelStatic<T>,
  id: string, 
  data: Partial<T["_creationAttributes"]> 
): Promise<number> => {
  // WHY: Avoids 'as unknown as' by using proper type extraction from model attributes
  // PATTERN: NonNullable ensures we use the defined string type, not string | undefined
  const whereClause: WhereById<T> = { id };
  
  // PATTERN: Server validates and rejects invalid types with clear errors
  
  const [updatedRows] = await Entity.update(data as Partial<T["_creationAttributes"]>, {
    where: whereClause as WhereOptions<T["_attributes"]>, 
  } as UpdateOptions<T["_attributes"]>);
  
  return updatedRows; 
};

const patchRecord = async <T extends Model>(
  Entity: ModelStatic<T>,
  id: string,
  data: Partial<T["_creationAttributes"]>
): Promise<number> => {
  // WHY: Avoids 'as unknown as' by using proper type extraction from model attributes
  const whereClause: WhereById<T> = { id: id as T["_attributes"]["id"] };

  // PATTERN: Server validates and rejects invalid types with clear errors

  const [patchedRows] = await Entity.update(data as Partial<T["_creationAttributes"]>, {
    where: whereClause as WhereOptions<T["_attributes"]>,
  } as UpdateOptions<T["_attributes"]>);

  return patchedRows;
};

const bulkPatch = async <T extends Model>(
  Entity: ModelStatic<T>,
  updates: Array<{ id: string } & Partial<T["_creationAttributes"]>>
): Promise<number> => {
  let updatedCount = 0;

  for (const { id, ...data } of updates) {
/**
 * WHY: // WHY: Avoids 'as unknown as' by using proper type extraction from model attributes
 */
    const whereClause: WhereById<T> = { id: id as T["_attributes"]["id"] };
    const [count] = await Entity.update(data as Partial<Attributes<T>>, {
      where: whereClause as WhereOptions<T["_attributes"]>,
    });
    updatedCount += count;
  }
  return updatedCount;
};

const deleteRecord = async <T extends Model>(
  Entity: ModelStatic<T>,
  id: string
): Promise<number> => {
  // WHY: Avoids 'as unknown as' by using proper type extraction from model attributes
  const whereClause: WhereById<T> = { id: id as T["_attributes"]["id"] };

  const deletedRows = await Entity.destroy({
    where: whereClause as WhereOptions<T["_attributes"]>,
  } as DestroyOptions<T["_attributes"]>);

  return deletedRows;
};


export type DependentDelete = {
  Entity: ModelStatic<Model>;
  where: WhereOptions<Record<string, unknown>>;
};

export interface SafeDeleteOptions {
  parent: {
    Entity: ModelStatic<Model>;
    id: string;
  };
  dependents?: DependentDelete[];
}

export const safeDelete = async ({
  parent,
  dependents = [],
}: SafeDeleteOptions): Promise<number> => {
  for (const dep of dependents) {
    await dep.Entity.destroy({ where: dep.where });
  }

  return deleteRecord(parent.Entity, parent.id);
};



export { fetchAll, fetchById, createRecord, patchRecord, updateRecord, bulkPatch, deleteRecord }