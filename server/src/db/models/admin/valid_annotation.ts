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
 * ValidAnnotation Model
 * 
 * Represents valid annotation relationships between block shapes and annotation shapes.
 * Annotation relationships are Block → Annotation relationships (similar to Block → Part).
 * 
 * LEARNING: Annotation relationships enable block-annotation composition
 * WHY: Block shapes need to define which annotation shapes can be annotations of them
 * PATTERN: Through table for many-to-many annotation relationships between block shapes and annotation shapes
 */
export class ValidAnnotation extends Model<
  InferAttributes<ValidAnnotation>,
  InferCreationAttributes<ValidAnnotation>
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

export function ValidAnnotationFactory(sequelize: Sequelize) {
  ValidAnnotation.init(
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
          return "validAnnotations";
        }
      },
      parent_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "blockShape";
        }
      },
      child_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "annotationShape";
        }
      },      
      parent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'parent_id',
        references: {
          model: 'block_shapes',
          key: 'id',
        },
      },
      child_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'child_id',
        references: {
          model: 'annotation_shapes',
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
      modelName: 'valid_annotation',
      tableName: 'valid_annotations',
      indexes: [
        {
          unique: true,
          fields: ["parent_id", "child_id"]
        },
        {
          fields: ["parent_id"],
          name: 'idx_valid_annotations_parent_id',
        },
        {
          fields: ["child_id"],
          name: 'idx_valid_annotations_child_id',
        },
      ],
      freezeTableName: true,
    }
  );

  return ValidAnnotation;
}
