import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

export class ValidAnnotationAssignment extends Model<
  InferAttributes<ValidAnnotationAssignment>,
  InferCreationAttributes<ValidAnnotationAssignment>
> {
  declare id: CreationOptional<string>;
  declare kind: CreationOptional<string>;
  declare parentKind: CreationOptional<string>;
  declare childKind: CreationOptional<string>;
  declare parentId: ForeignKey<string>;
  declare childId: ForeignKey<string>;
  declare disabled: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function ValidAnnotationAssignmentFactory(sequelize: Sequelize) {
  ValidAnnotationAssignment.init(
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
          return 'validAnnotationAssignments';
        },
      },
      parentKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'blockShape';
        },
      },
      childKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'annotationShape';
        },
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
          key: 'id',
        },
      },
      childId: {
        type: DataTypes.UUID,
        allowNull: false,
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
      modelName: 'valid_annotation_assignment',
      tableName: 'valid_annotation_assignments',
      indexes: [
        {
          unique: true,
          fields: ['parentId', 'childId'],
        },
        {
          fields: ['parentId'],
          name: 'idx_valid_annotation_assignments_parent_id',
        },
        {
          fields: ['childId'],
          name: 'idx_valid_annotation_assignments_child_id',
        },
      ],
      freezeTableName: true,
    }
  );

  return ValidAnnotationAssignment;
}
