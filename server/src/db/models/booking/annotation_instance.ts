import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';
/**
 * AnnotationInstance Model
 * 
 * Represents reusable, shared annotation instances (instance-level: concrete annotation entities)
 * that can be associated with block instances. Annotation instances can be user-type-specific
 * (matching state control block instances) or generic (null userType).
 * 
 * - Shared annotation instances across multiple block instances
 * - User-type-specific annotation instances (different text for same block based on user type)
 * - Centralized annotation instance management (update once, affects all block instances using it)
 * 
 * relationship through ActiveAnnotation. This allows:
 * - Reusability: Same annotation instance can be used by multiple blocks
 * - Flexibility: Blocks can have multiple annotation instances (ordered, with user-type filtering)
 * - Maintainability: Update annotation instance text once, all blocks using it get the update
 * 
 * PATTERN: Instance-level entity model matching block_instances/part_instances pattern
 * 
 * NOTE: Per–user-type copy lives in `annotation_instance_content` (see sync on entity CRUD). `userType` + `text` here remain for transition and list fallbacks.
 */
export class AnnotationInstance extends Model<
  InferAttributes<AnnotationInstance>,
  InferCreationAttributes<AnnotationInstance>
> {
  declare id: CreationOptional<string>;
  declare text: string;
  declare type: string; // Foreign key to annotation_shapes.id
  declare userType: string | null; // State control block instance ID or null (generic) - DEPRECATED: use active_annotations.user_type_block_instance_id
  declare orderIndex: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function AnnotationInstanceFactory(sequelize: Sequelize) {
  AnnotationInstance.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'type',
        references: {
          model: 'annotation_shapes',
          key: 'id',
        },
        comment: 'Foreign key to annotation_shapes table (e.g., description, tooltip)',
      },
      userType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'user_type',
        comment: 'User type filter: state control block instance ID or null for generic annotations. DEPRECATED: use annotation_assignments.user_type_block_instance_id',
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
        comment: 'Whether this annotation instance is active/enabled',
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
      modelName: 'annotation_instance',
      tableName: 'annotation_instances',
      freezeTableName: true,
      indexes: [
        {
          fields: ['user_type'],
          name: 'idx_annotation_instances_user_type',
        },
        {
          fields: ['type'],
          name: 'idx_annotation_instances_type',
        },
      ],
    }
  );

  return AnnotationInstance;
}

