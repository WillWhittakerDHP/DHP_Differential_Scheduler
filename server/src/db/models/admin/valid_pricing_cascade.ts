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
 * ValidPricingCascade Model
 *
 * Represents valid pricing cascade relationships between part shapes.
 * Shape-level validation: which part shapes can pricing-cascade into which others
 * (e.g. "HVAC Equipment" partShape can cascade into "Mechanical Inspection" partShape).
 *
 */
export class ValidPricingCascade extends Model<
  InferAttributes<ValidPricingCascade>,
  InferCreationAttributes<ValidPricingCascade>
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

export function ValidPricingCascadeFactory(sequelize: Sequelize) {
  ValidPricingCascade.init(
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
          return 'validPricingCascades';
        },
      },
      parentKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'partShape';
        },
      },
      childKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'partShape';
        },
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'part_shapes',
          key: 'id',
        },
      },
      childId: {
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
      modelName: 'valid_pricing_cascade',
      tableName: 'valid_pricing_cascades',
      indexes: [
        {
          unique: true,
          fields: ['parentId', 'childId'],
        },
      ],
      freezeTableName: true,
    }
  );

  return ValidPricingCascade;
}
