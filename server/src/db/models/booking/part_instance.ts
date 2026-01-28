import { 
  Model, 
  DataTypes, 
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize, 
} from 'sequelize';

export class PartInstance extends Model<
  InferAttributes<PartInstance>,
  InferCreationAttributes<PartInstance>
> {
  declare id: CreationOptional<string>;
  declare orderIndex: CreationOptional<number>;
  declare partShapeRef: ForeignKey<string>;
  declare name: CreationOptional<string>;
  declare onSite: boolean;
  declare clientPresent: boolean;
  declare moveable: boolean;
  declare baseFee: number;
  declare rateOverBaseFee: number;
  declare baseTime: number;
  declare rateOverBaseTime: number;
  declare active: boolean;
  declare zeroOutPart: boolean;
  declare differentialOverride: CreationOptional<boolean | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function PartInstanceFactory(sequelize: Sequelize) {
  PartInstance.init(
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
      partShapeRef: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'part_shapes',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      onSite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      clientPresent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      moveable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      baseFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rateOverBaseFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      baseTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rateOverBaseTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      zeroOutPart: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      differentialOverride: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
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
      modelName: 'part_instance',
      tableName: 'part_instances',
      freezeTableName: true,
    }
  );

  return PartInstance;
}
