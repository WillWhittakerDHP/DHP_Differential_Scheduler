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
  declare orderIndex: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
  declare isTernary: boolean; // Indicates if this event shape uses ternary logic (true/false/override)
  declare ternaryDefault: CreationOptional<'true' | 'false' | 'override' | null>; // Default ternary value (null means fail gracefully)
  declare differentialRole: CreationOptional<'major' | 'minor' | 'moveable' | null>;
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
      isTernary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_ternary',
        comment: 'Indicates if this event shape uses ternary logic (true/false/override)',
      },
      ternaryDefault: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'ternary_default',
        comment: 'Default ternary value to use when value cannot be determined (null means fail gracefully)',
      },
      differentialRole: {
        type: DataTypes.STRING(12),
        allowNull: true,
        defaultValue: null,
        field: 'differential_role',
        comment: 'Direct role declaration: major, minor, moveable, or null',
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
