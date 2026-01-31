import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

/**
 * EventShape Model
 * 
 * Represents event shapes (shape-level: defines what event types can exist).
 * Shapes are fully dynamic and can be created/deleted by admins via CRUD interface.
 * 
 * LEARNING: Separating event shapes into their own entity enables:
 * - Dynamic shape management (admins can create/edit/delete shapes)
 * - Shape validation (ensures event instances use valid shapes)
 * - Shape filtering and organization
 * 
 * WHY: Instead of hardcoding event shapes, we use a dynamic entity:
 * - Flexibility: Admins can add new shapes without code changes
 * - Maintainability: Shapes are managed through admin UI
 * - Data integrity: Foreign key constraints ensure valid shapes
 * 
 * PATTERN: Shape-level entity model matching block_shapes/part_shapes/annotation_shapes pattern
 * COMPARISON: EventShape is shape-level (definitions), EventInstance is instance-level (concrete entities)
 */
export class EventShape extends Model<
  InferAttributes<EventShape>,
  InferCreationAttributes<EventShape>
> {
  declare id: CreationOptional<string>;
  declare name: string; // e.g., 'OnSite', 'Moveable', 'ClientPresent'
  declare defaultTernaryValue: CreationOptional<'true' | 'false' | 'override' | null>; // Default ternary value for this event shape
  declare defaultOrderIndex: CreationOptional<number>; // Default order index for this event shape
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
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
        comment: 'Event shape name (e.g., OnSite, Moveable, ClientPresent)',
      },
      defaultTernaryValue: {
        type: DataTypes.ENUM('true', 'false', 'override'),
        allowNull: true,
        field: 'default_ternary_value',
        comment: 'Default ternary value for this event shape (for onSite/clientPresent logic)',
      },
      defaultOrderIndex: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'default_order_index',
        comment: 'Default order index for this event shape',
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
  );

  return EventShape;
}
