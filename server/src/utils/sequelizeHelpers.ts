import { Model, ModelStatic } from 'sequelize';

/**
 * Extract all attribute names (camelCase) from a Sequelize model definition.
 * 
 * LEARNING: Sequelize models expose their attribute definitions via getAttributes()
 * WHY: Allows programmatic extraction of model attributes for explicit attribute selection
 * PATTERN: Filter out virtual attributes and associations to get only real database columns
 * 
 * IMPORTANT: For models with `underscored: true`, always specify `attributes` explicitly
 * to avoid duplicate columns in SQL queries (both snake_case and camelCase versions).
 * Use this utility to extract attributes programmatically.
 * 
 * @param ModelClass - The Sequelize model class
 * @returns Array of attribute names (camelCase) that map to database columns
 */
export function getModelAttributes<T extends Model>(
  ModelClass: ModelStatic<T>
): string[] {
  const modelAttributes = ModelClass.getAttributes();
  return Object.keys(modelAttributes).filter(key => {
    const attr = modelAttributes[key];
    // Exclude virtual attributes (VIRTUAL type) and associations
    // Virtual attributes don't map to database columns
    if (!attr.type) {
      return false;
    }
    
    // Check if it's a VIRTUAL type
    const typeName = attr.type.constructor.name;
    if (typeName === 'VIRTUAL' || typeName.includes('VIRTUAL')) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get model attributes excluding specific fields.
 * 
 * LEARNING: Sometimes we want most attributes but need to exclude certain ones
 * WHY: Useful when you want all attributes except specific ones (e.g., exclude password fields)
 * PATTERN: Filter attributes list to exclude specified keys
 * 
 * @param ModelClass - The Sequelize model class
 * @param exclude - Array of attribute names to exclude
 * @returns Array of attribute names excluding the specified ones
 */
export function getModelAttributesExcluding<T extends Model>(
  ModelClass: ModelStatic<T>,
  exclude: string[]
): string[] {
  const allAttributes = getModelAttributes(ModelClass);
  return allAttributes.filter(attr => !exclude.includes(attr));
}

/**
 * Check if a Sequelize model uses `underscored: true` option.
 * 
 * LEARNING: Sequelize stores model options in the model's options property
 * WHY: Need to detect underscored models to automatically add attributes
 * PATTERN: Check model.options.underscored property
 * 
 * @param ModelClass - The Sequelize model class
 * @returns True if model uses underscored: true, false otherwise
 */
export function isModelUnderscored<T extends Model>(
  ModelClass: ModelStatic<T>
): boolean {
  // Access the model's options - Sequelize stores init options here
  const modelOptions = (ModelClass as any).options;
  return modelOptions?.underscored === true;
}

