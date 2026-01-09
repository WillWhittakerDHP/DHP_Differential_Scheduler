import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';


export class PartShape extends Model<
  InferAttributes<PartShape>,
  InferCreationAttributes<PartShape>
> {
  declare id: CreationOptional<string>;
  declare orderIndex: CreationOptional<number>;
  declare name: string;
  declare active: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function PartShapeFactory(sequelize: Sequelize) {
  PartShape.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      indexes: [
        {
          fields: ['orderIndex'],
        },
      ],
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'part_shape',
      tableName: 'part_shapes',
      freezeTableName: true,
    }
  );

  return PartShape;
}
