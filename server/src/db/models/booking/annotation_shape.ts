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
 * LEARNING: Separating annotation shapes into their own entity enables:
 * - Dynamic shape management (admins can create/edit/delete shapes)
 * - Shape validation (ensures annotation instances use valid shapes)
 * - Shape filtering and organization
 * 
 * WHY: Instead of hardcoding annotation shapes, we use a dynamic entity:
 * - Flexibility: Admins can add new shapes without code changes
 * - Maintainability: Shapes are managed through admin UI
 * - Data integrity: Foreign key constraints ensure valid shapes
 * 
 * PATTERN: Shape-level entity model matching block_shapes/part_shapes pattern
 * COMPARISON: AnnotationShape is shape-level (definitions), AnnotationInstance is instance-level (concrete entities)
 */
export class AnnotationShape extends Model<
  InferAttributes<AnnotationShape>,
  InferCreationAttributes<AnnotationShape>
> {
  declare id: CreationOptional<string>;
  declare name: string; // e.g., 'description', 'tooltip'
  declare orderIndex: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
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

