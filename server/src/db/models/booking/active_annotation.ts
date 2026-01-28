import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import { BlockInstance } from './block_instance';
import { AnnotationInstance } from './annotation_instance';

/**
 * ActiveAnnotation Model
 * 
 * Through-table for many-to-many relationship between BlockInstance and AnnotationInstance.
 * Enables block instances to have multiple annotation instances with ordering and user-type filtering.
 * 
 * LEARNING: Active relationship pattern enables:
 * - Many-to-many relationships (one block can have many annotation instances, one annotation instance can be used by many blocks)
 * - Additional metadata on the relationship (orderIndex, userTypeBlockInstanceId override, isDefault)
 * - User-type-specific filtering at the relationship level via BlockInstance foreign key
 * 
 * WHY: Using an active relationship table instead of storing annotation instances directly on blocks allows:
 * - Reusability: Same annotation instance text can be shared across multiple blocks
 * - Ordering: Multiple annotation instances per block can be ordered via orderIndex
 * - User-type filtering: Annotation instances can be filtered by user type via user_type_block_instance_id (BlockInstance FK)
 * - Default flag: Mark which annotation instance should be shown by default
 * 
 * PATTERN: Active relationship model matching active_cascades/active_components/active_parts pattern
 * COMPARISON: ActiveAnnotation is runtime (which annotations are assigned), AnnotationShape/Instance are definitions/entities
 */
export class ActiveAnnotation extends Model<
  InferAttributes<ActiveAnnotation>,
  InferCreationAttributes<ActiveAnnotation>
> {
  declare id: CreationOptional<string>;
  declare blockInstanceId: ForeignKey<string>;
  declare annotationId: ForeignKey<string>;
  declare userTypeBlockInstanceId: ForeignKey<string> | null; // Optional override: BlockInstance ID for user type filtering
  declare orderIndex: number;
  declare isDefault: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare blockInstance?: BlockInstance;
  declare annotation?: AnnotationInstance;
  declare userTypeBlockInstance?: BlockInstance; // The BlockInstance representing the user type
}

export function ActiveAnnotationFactory(sequelize: Sequelize) {
  ActiveAnnotation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      blockInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_instance_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      annotationId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'annotation_id',
        references: {
          model: 'annotation_instances',
          key: 'id',
        },
      },
      userTypeBlockInstanceId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_type_block_instance_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
        comment: 'Optional user type override for this specific relationship (BlockInstance ID representing user type)',
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'order_index',
        comment: 'Order in which annotation instances should be displayed for this block',
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_default',
        comment: 'Whether this annotation instance should be shown by default for this block',
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
      modelName: 'active_annotation',
      tableName: 'active_annotations',
      indexes: [
        {
          unique: true,
          fields: ['block_instance_id', 'annotation_id', 'user_type_block_instance_id'],
          name: 'unique_block_instance_annotation_user_type',
        },
        {
          fields: ['block_instance_id'],
          name: 'idx_active_annotations_block_instance_id',
        },
        {
          fields: ['annotation_id'],
          name: 'idx_active_annotations_annotation_id',
        },
        {
          fields: ['user_type_block_instance_id'],
          name: 'idx_active_annotations_user_type_block_instance_id',
        },
        {
          fields: ['order_index'],
          name: 'idx_active_annotations_order_index',
        },
      ],
      freezeTableName: true,
    }
  );

  return ActiveAnnotation;
}

