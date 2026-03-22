import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';
/**
 * AnnotationShape Model
 * 
 * Represents annotation shapes (shape-level: defines what annotation types can exist).
 * Shapes are fully dynamic and can be created/deleted by admins via CRUD interface.
 * 
 * - Dynamic shape management (admins can create/edit/delete shapes)
 * - Shape validation (ensures annotation instances use valid shapes)
 * - Shape filtering and organization
 * 
 * - Flexibility: Admins can add new shapes without code changes
 * - Maintainability: Shapes are managed through admin UI
 * - Data integrity: Foreign key constraints ensure valid shapes
 * 
 * PATTERN: Shape-level entity model matching block_shapes/part_shapes pattern
 */
export class AnnotationShape extends Model<
  InferAttributes<AnnotationShape>,
  InferCreationAttributes<AnnotationShape>
> {
  declare id: CreationOptional<string>;
  declare name: string; // e.g., 'description', 'tooltip'
  declare orderIndex: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
  /** Registered wizard slot (shared/constants/annotationSlots.ts) or null. */
  declare uiSlot: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function AnnotationShapeFactory(sequelize: Sequelize) {
  AnnotationShape.init(
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
        comment: 'Annotation shape name (e.g., description, tooltip)',
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
        comment: 'Whether this annotation shape is active/enabled',
      },
      uiSlot: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'ui_slot',
        comment: 'Wizard UI slot key from ANNOTATION_UI_SLOT_REGISTRY, or null',
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
      modelName: 'annotation_shape',
      tableName: 'annotation_shapes',
      freezeTableName: true,
      indexes: [
        {
          fields: ['name'],
          unique: true,
          name: 'idx_annotation_shapes_name_unique',
        },
      ],
    }
  );

  return AnnotationShape;
}

