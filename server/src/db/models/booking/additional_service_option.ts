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
 * AdditionalServiceOption Model
 * 
 * Represents additional service option relationships between block instances.
 * Additional service option relationships define which block instances are valid as independent components
 * in the booking wizard for a specific composite block instance.
 * 
 * LEARNING: Additional service option relationships enable instance-specific component selection
 * WHY: Block instances need to define which other block instances are valid as independent components
 *      This is instance-specific (many-to-many) rather than shape-level
 * PATTERN: Through table for many-to-many additional service option relationships between block instances
 * 
 * NOTE: Renamed from ValidIndependentComponent to AdditionalServiceOption for clearer domain terminology (2026-01-08)
 */
export class AdditionalServiceOption extends Model<
  InferAttributes<AdditionalServiceOption>,
  InferCreationAttributes<AdditionalServiceOption>
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

export function AdditionalServiceOptionFactory(sequelize: Sequelize) {
  AdditionalServiceOption.init(
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
          return "additionalServiceOptions";
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
      modelName: 'additional_service_option',
      tableName: 'additional_service_options',
      indexes: [
        {
          unique: true,
          fields: ['parentId', 'childId']
        }
      ],
      freezeTableName: true,
    }
  );

  return AdditionalServiceOption;
}

