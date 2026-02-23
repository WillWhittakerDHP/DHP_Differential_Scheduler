import { Model, ModelStatic } from 'sequelize';

export function getModelAttributes<T extends Model>(
  ModelClass: ModelStatic<T>
): string[] {
  const modelAttributes = ModelClass.getAttributes();
  return Object.keys(modelAttributes).filter(key => {
    const attr = modelAttributes[key];
    if (!attr.type) {
      return false;
    }
    
    const typeName = attr.type.constructor.name;
    if (typeName === 'VIRTUAL' || typeName.includes('VIRTUAL')) {
      return false;
    }
    
    return true;
  });
}

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
 * 
 * @param ModelClass - The Sequelize model class
 * @returns True if model uses underscored: true, false otherwise
 */
export function isModelUnderscored<T extends Model>(
  ModelClass: ModelStatic<T>
): boolean {
  const modelOptions = (ModelClass as { options?: { underscored?: boolean } }).options;
  return modelOptions?.underscored === true;
}

