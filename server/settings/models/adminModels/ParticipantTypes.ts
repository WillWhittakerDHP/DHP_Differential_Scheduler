import { Model, DataTypes, 
  // Optional,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  // type ForeignKey,
  // type BelongsToManyAddAssociationMixin,
  type Sequelize } from 'sequelize';
  

export class ParticipantType extends Model<
  InferAttributes<ParticipantType>,
  InferCreationAttributes<ParticipantType>
> {
  declare participant_type_id: CreationOptional<number>;
  declare participant_type: string;
  declare participant_description: string;
  declare visibility: boolean;

  // TODO What's this?
  // //  Since TS cannot determine model associations at compile time, we need to declare the association methods here. These will not exist until `Model.init` was called.
  //   declare addReaders: BelongsToManyAddAssociationMixin<
  //   Reader[],
  //   Reader['id'][]
  // >;
  // declare addReader: BelongsToManyAddAssociationMixin<Reader, Reader['id']>;
}

export function ParticipantTypeFactory(sequelize: Sequelize): typeof ParticipantType {
  ParticipantType.init(
    {
      participant_type_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      participant_type: {
        type: DataTypes.STRING,
      },
      participant_description: {
        type: DataTypes.STRING,
      },
      visibility: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      // Manually define the table name
      modelName: 'participant_types',
      // Set to false to remove the `created_at` and `updated_at` columns
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    }
  );

  return ParticipantType;
}