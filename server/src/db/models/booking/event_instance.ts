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
 * EventInstance Model
 * 
 * Represents reusable, shared event instances (instance-level: concrete event configurations)
 * that can be associated with part shapes or block shapes. Event instances contain templates
 * for calendar event creation (title, description, location).
 * 
 * LEARNING: Separating event instances into their own entity enables:
 * - Shared event configurations across multiple shapes
 * - Template management (update templates once, affects all shapes using it)
 * - Centralized event instance management
 * 
 * WHY: Instead of storing event configurations directly on shapes, we use a many-to-many
 * relationship through EventAssignment. This allows:
 * - Reusability: Same event instance can be used by multiple shapes
 * - Flexibility: Shapes can have multiple event instances (ordered)
 * - Maintainability: Update event templates once, all shapes using it get the update
 * 
 * PATTERN: Instance-level entity model matching block_instances/part_instances/annotation_instances pattern
 * COMPARISON: EventShape is shape-level (definitions), EventInstance is instance-level (concrete entities)
 */
export class EventInstance extends Model<
  InferAttributes<EventInstance>,
  InferCreationAttributes<EventInstance>
> {
  declare id: CreationOptional<string>;
  declare eventShapeRef: ForeignKey<string>;
  declare name: string;
  declare titleTemplate: string | null;
  declare descriptionTemplate: string | null;
  declare locationTemplate: string | null;
  declare orderIndex: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function EventInstanceFactory(sequelize: Sequelize) {
  EventInstance.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      eventShapeRef: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'event_shape_ref',
        references: {
          model: 'event_shapes',
          key: 'id',
        },
        comment: 'Foreign key to event_shapes table',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Event instance name/template name',
      },
      titleTemplate: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'title_template',
        comment: 'Template for event title (e.g., "{service} on {propertyType}")',
      },
      descriptionTemplate: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'description_template',
        comment: 'Template for event description (e.g., "{clientName} - {propertyAddress}")',
      },
      locationTemplate: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'location_template',
        comment: 'Template for event location (e.g., "{propertyAddress}")',
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
        comment: 'Whether this event instance is active/enabled',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'event_instance',
      tableName: 'event_instances',
      freezeTableName: true,
      indexes: [
        {
          fields: ['event_shape_ref'],
          name: 'idx_event_instances_event_shape_ref',
        },
      ],
    }
  );

  return EventInstance;
}
