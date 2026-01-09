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
 * InstanceComponent Model
 * 
 * Represents component relationships between block instances.
 * Component relationships define which block instances are used as components of other block instances.
 * 
 * LEARNING: Instance component relationships enable runtime option component selection
 * WHY: Block instances need to define which other block instances are components at runtime
 * PATTERN: Through table for many-to-many component relationships between block instances
 * 
 * NOTE: Renamed from ServiceComponent to InstanceComponent for generalized terminology (2026-01-07)
 * The component pattern applies to any composable block instance, not just "services".
 */
export class InstanceComponent extends Model<
  InferAttributes<InstanceComponent>,
  InferCreationAttributes<InstanceComponent>
> {
  declare id: CreationOptional<string>;
  declare kind: CreationOptional<string>;
  declare parent_kind: CreationOptional<string>;
  declare child_kind: CreationOptional<string>;  
  declare parent_id: ForeignKey<string>;
  declare child_id: ForeignKey<string>;
  declare orderIndex: number;
  declare disabled: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function InstanceComponentFactory(sequelize: Sequelize) {
  InstanceComponent.init(
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
          return "instanceComponents";
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
          return "blockInstance";
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
          model: 'block_instances',
          key: 'id',
        },
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'order_index',
        comment: 'Order in which components should be displayed',
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
      modelName: 'instance_component',
      tableName: 'instance_components',
      indexes: [
        {
          unique: true,
          fields: ["parent_id", "child_id"]
        }
      ],
      freezeTableName: true,
    }
  );

  return InstanceComponent;
}

