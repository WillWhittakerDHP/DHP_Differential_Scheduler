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
 * - Dynamic shape management (admins can create/edit/delete shapes)
 * - Shape validation (ensures event instances use valid shapes)
 * - Shape filtering and organization
 * 
 * - Flexibility: Admins can add new shapes without code changes
 * - Maintainability: Shapes are managed through admin UI
 * - Data integrity: Foreign key constraints ensure valid shapes
 * 
 * PATTERN: Shape-level entity model matching block_shapes/part_shapes/annotation_shapes pattern
 */
export class EventShape extends Model<
  InferAttributes<EventShape>,
  InferCreationAttributes<EventShape>
> {
  declare id: CreationOptional<string>;
  declare name: string; // e.g., 'OnSite', 'Minimizer segment', 'ClientPresent'
  declare orderIndex: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
  declare differentialRole: CreationOptional<'major' | 'minor' | 'minimizer' | 'margin' | null>;
  declare includeRescheduleLink: CreationOptional<boolean>;
  declare includeCancelLink: CreationOptional<boolean>;
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
        comment: 'Event shape name (e.g., OnSite, Minimizer segment, ClientPresent)',
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
      differentialRole: {
        type: DataTypes.ENUM('major', 'minor', 'minimizer', 'margin'),
        allowNull: true,
        defaultValue: null,
        comment:
          'Scheduling role for this event shape (major/minor/minimizer/margin); null = none. Distinct from PartFinal ternary flags (major/minor/minimizer placement).',
      },
      includeRescheduleLink: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Include {rescheduleLink} in calendar invite templates for instances of this shape',
      },
      includeCancelLink: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Include {cancelLink} in calendar invite templates for instances of this shape',
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
  );

  return EventShape;
}
