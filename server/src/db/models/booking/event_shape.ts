import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

/**
 * EventShape — placement type (Feature 20). Admins define allowed placement kinds + anchor edges;
 * segments are event_instances scoped to a parent block instance.
 */
export class EventShape extends Model<
  InferAttributes<EventShape>,
  InferCreationAttributes<EventShape>
> {
  declare id: CreationOptional<string>
  declare name: string
  declare orderIndex: CreationOptional<number>
  declare active: CreationOptional<boolean>
  declare placementKind: 'primary' | 'secondary' | 'marginal' | 'floating'
  declare anchorEdge: CreationOptional<'start' | 'end' | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export function EventShapeFactory(sequelize: Sequelize) {
  EventShape.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Placement type name (e.g. Primary, FrontSecondary)',
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order index for UI drag-and-drop ordering',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this event shape is active/enabled',
      },
      placementKind: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'primary',
        field: 'placement_kind',
        comment: 'primary | secondary | marginal | floating (Principles §5.1)',
      },
      anchorEdge: {
        type: DataTypes.STRING(8),
        allowNull: true,
        defaultValue: null,
        field: 'anchor_edge',
        comment: 'start | end for non-primary; null for primary',
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
      modelName: 'event_shape',
      tableName: 'event_shapes',
      freezeTableName: true,
      indexes: [
        {
          fields: ['name'],
          unique: true,
          name: 'idx_event_shapes_name_unique',
        },
      ],
    }
  )

  return EventShape
}
