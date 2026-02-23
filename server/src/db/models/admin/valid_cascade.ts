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
 * ValidCascade Model
 * 
 * Represents valid cascade relationships between block shapes.
 * Cascade relationships are vertical hierarchy relationships (different shapes, e.g., user_shape → service).
 * 
 */
export class ValidCascade extends Model<
  InferAttributes<ValidCascade>,
  InferCreationAttributes<ValidCascade>
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

export function ValidCascadeFactory(sequelize: Sequelize) {
  ValidCascade.init(
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
          return "validCascades";
        }
      },
      parentKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'blockShape';
        },
      },
      childKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'blockShape';
        },
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
          key: 'id',
        },
      },
      childId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
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
      modelName: 'valid_cascade',
      tableName: 'valid_cascades',
      indexes: [
        {
          unique: true,
          fields: ['parentId', 'childId']
        }
      ],
      freezeTableName: true,
    }
  );

  return ValidCascade;
}

