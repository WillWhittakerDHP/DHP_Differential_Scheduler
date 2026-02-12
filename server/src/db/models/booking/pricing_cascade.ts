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
 * PricingCascade Model
 *
 * Represents pricing cascade relationships between part instances.
 * Enables validated control over which downstream part instances contribute to
 * a service part's pricing (e.g. Buyer's Inspection part cascades from property
 * detail parts such as interiors, decks, HVAC equipment).
 *
 * PATTERN: Through table for partInstance -> partInstance; mirrors bookingCascades (blockInstance -> blockInstance).
 */
export class PricingCascade extends Model<
  InferAttributes<PricingCascade>,
  InferCreationAttributes<PricingCascade>
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

export function PricingCascadeFactory(sequelize: Sequelize) {
  PricingCascade.init(
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
          return 'pricingCascades';
        },
      },
      parentKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'partInstance';
        },
      },
      childKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'partInstance';
        },
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'part_instances',
          key: 'id',
        },
      },
      childId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'part_instances',
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
      modelName: 'pricing_cascade',
      tableName: 'pricing_cascades',
      indexes: [
        {
          unique: true,
          fields: ['parentId', 'childId'],
        },
      ],
      freezeTableName: true,
    }
  );

  return PricingCascade;
}
