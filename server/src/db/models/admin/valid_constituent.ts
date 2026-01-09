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
 * ValidConstituent Model
 * 
 * Represents valid constituent relationships between block shapes and part shapes.
 * Constituent relationships are Block → Part relationships (math dimension).
 * 
 * LEARNING: Constituent relationships enable block-part composition
 * WHY: Block shapes need to define which part shapes can be constituents of them
 * PATTERN: Through table for many-to-many constituent relationships between block shapes and part shapes
 */
export class ValidConstituent extends Model<
  InferAttributes<ValidConstituent>,
  InferCreationAttributes<ValidConstituent>
> {
  declare id: CreationOptional<string>;
  declare kind: CreationOptional<string>;
  declare parent_kind: CreationOptional<string>;
  declare child_kind: CreationOptional<string>;  
  declare parent_id: ForeignKey<string>;
  declare child_id: ForeignKey<string>;
  declare disabled: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function ValidConstituentFactory(sequelize: Sequelize) {
  ValidConstituent.init(
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
          return "validConstituents";
        }
      },
      parent_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "blockShape";
        }
      },
      child_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "partShape";
        }
      },      
      parent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
          key: 'id',
        },
      },
      child_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'part_shapes',
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
      modelName: 'valid_constituent',
      tableName: 'valid_constituents',
      indexes: [
        {
          unique: true,
          fields: ["parent_id", "child_id"]
        }
      ],
      freezeTableName: true,
    }
  );

  return ValidConstituent;
}

