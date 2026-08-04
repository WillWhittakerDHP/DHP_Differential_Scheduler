import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize'

/**
 * Lateral inclusion gate edge: accumulator parent → characteristic child,
 * gated by property_fact_key (see shared/constants/accumulator.ts).
 */
export class AccumulationLink extends Model<
  InferAttributes<AccumulationLink>,
  InferCreationAttributes<AccumulationLink>
> {
  declare id: CreationOptional<string>
  declare kind: CreationOptional<string>
  declare parentKind: CreationOptional<string>
  declare childKind: CreationOptional<string>
  declare parentId: ForeignKey<string>
  declare childId: ForeignKey<string>
  declare propertyFactKey: string
  declare disabled: boolean
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export function AccumulationLinkFactory(sequelize: Sequelize) {
  AccumulationLink.init(
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
          return 'accumulationLinks'
        },
      },
      parentKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'blockInstance'
        },
      },
      childKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'blockInstance'
        },
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'parent_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      childId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'child_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      propertyFactKey: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'property_fact_key',
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'accumulation_link',
      tableName: 'accumulation_links',
      indexes: [
        {
          unique: true,
          fields: ['parent_id', 'child_id'],
        },
      ],
      freezeTableName: true,
    }
  )

  return AccumulationLink
}
