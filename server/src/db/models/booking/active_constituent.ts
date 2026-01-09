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
 * ActiveConstituent Model
 * 
 * Represents active constituent relationships between block instances and part instances.
 * Constituent relationships are Block → Part relationships (math dimension).
 * 
 * LEARNING: Active constituent relationships enable runtime block-part composition
 * WHY: Block instances need to define which part instances are constituents of them at runtime
 * PATTERN: Through table for many-to-many constituent relationships between block instances and part instances
 */
export class ActiveConstituent extends Model<
  InferAttributes<ActiveConstituent>,
  InferCreationAttributes<ActiveConstituent>
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

export function ActiveConstituentFactory(sequelize: Sequelize) {
  ActiveConstituent.init(
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
          return "activeConstituents";
        }
      },
      parent_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "blockInstance";
        }
      },
      child_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "partInstance";
        }
      },  
      parent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      child_id: {
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
      modelName: 'active_constituent',
      tableName: 'active_constituents',
      indexes: [
        {
          unique: true,
          fields: ["parent_id", "child_id"]
        }
      ],
      freezeTableName: true,
    }
  );

  return ActiveConstituent;
}

