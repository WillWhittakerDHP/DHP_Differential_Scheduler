import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize'
/**
 * Per–user-type (or generic) text for an annotation instance.
 * Legacy columns annotation_instances.text + user_type are deprecated for new writes; sync via service on PATCH/CREATE.
 */
export class AnnotationInstanceContent extends Model<
  InferAttributes<AnnotationInstanceContent>,
  InferCreationAttributes<AnnotationInstanceContent>
> {
  declare id: CreationOptional<string>
  declare annotationInstanceId: ForeignKey<string>
  declare userTypeBlockInstanceId: ForeignKey<string> | null
  declare text: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

}

export function AnnotationInstanceContentFactory(sequelize: Sequelize) {
  AnnotationInstanceContent.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      annotationInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'annotation_instance_id',
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
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      modelName: 'annotation_instance_content',
      tableName: 'annotation_instance_content',
      freezeTableName: true,
    }
  )

  return AnnotationInstanceContent
}
