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

export function isModelUnderscored<T extends Model>(
  ModelClass: ModelStatic<T>
): boolean {
  const modelOptions = (ModelClass as { options?: { underscored?: boolean } }).options;
  return modelOptions?.underscored === true;
}

