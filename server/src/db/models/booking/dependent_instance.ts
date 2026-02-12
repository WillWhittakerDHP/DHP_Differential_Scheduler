import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

/**
 * DependentInstance Model
 * 
 * Represents dependent instance relationships between block instances.
 * Dependent instance relationships define which block instances are valid as 
 * dependent options within the booking wizard for a specific parent block instance.
 * 
 * LEARNING: Dependent instance relationships enable instance-specific nested selection
 * WHY: Block instances need to define which other block instances are valid as dependent options
 *      This is instance-specific (many-to-many) rather than shape-level
 *      Works for any block shape: services, property types, availability options, etc.
 * PATTERN: Through table for many-to-many dependent relationships between block instances
 * 
 * NOTE: Renamed from DependentInstanceOption to DependentInstance for clearer terminology (2026-01-20)
 * PREVIOUS: AdditionalServiceOption → DependentInstanceOption → DependentInstance
 */
export class DependentInstance extends Model<
  InferAttributes<DependentInstance>,
  InferCreationAttributes<DependentInstance>
> {
  declare id: CreationOptional<string>;
  declare kind: CreationOptional<string>;
  declare parentKind: CreationOptional<string>;
  declare childKind: CreationOptional<string>;
  declare parentId: ForeignKey<string>;
  declare childId: ForeignKey<string>;
  declare disabled: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function DependentInstanceFactory(sequelize: Sequelize) {
  DependentInstance.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "dependentInstances";
        }
      },
      parentKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'blockInstance';
        },
      },
      childKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'blockInstance';
        },
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      childId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'dependent_instance',
      tableName: 'dependent_instances',
      indexes: [
        {
          unique: true,
          fields: ['parentId', 'childId']
        }
      ],
      freezeTableName: true,
    }
  );

  return DependentInstance;
}
