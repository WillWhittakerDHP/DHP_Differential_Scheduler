import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

export class Relationship extends Model<
  InferAttributes<Relationship>,
  InferCreationAttributes<Relationship>
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

export function RelationshipFactory(sequelize: Sequelize) {
  Relationship.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      kind: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'type', // Database column name remains 'type' until migration to 'kind'
      },
      parent_kind: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'parent_type', // Database column name remains 'parent_type' until migration to 'parent_kind'
      },
      child_kind: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'child_type', // Database column name remains 'child_type' until migration to 'child_kind'
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      child_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
      modelName: 'relationship',
      tableName: 'relationships',
      indexes: [
        {
          unique: true,
          fields: ["parent_id", "child_id"]
        }
      ],
      freezeTableName: true,
    }
  );

  return Relationship;
}
