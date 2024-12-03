import { Model, DataTypes, 
  // Optional,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  // type ForeignKey,
  // type BelongsToManyAddAssociationMixin,
  type Sequelize } from 'sequelize';
  

export class AppointmentPartType extends Model<
  InferAttributes<AppointmentPartType>,
  InferCreationAttributes<AppointmentPartType>
> {
  declare appointment_part_type_id: CreationOptional<number>;
  declare appointment_part_name: string;

  // TODO What's this?
  // //  Since TS cannot determine model associations at compile time, we need to declare the association methods here. These will not exist until `Model.init` was called.
  //   declare addReaders: BelongsToManyAddAssociationMixin<
  //   Reader[],
  //   Reader['id'][]
  // >;
  // declare addReader: BelongsToManyAddAssociationMixin<Reader, Reader['id']>;
}

export function AppointmentPartTypeFactory(sequelize: Sequelize): typeof AppointmentPartType {
  AppointmentPartType.init(
    {
      appointment_part_type_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      appointment_part_name: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      // Manually define the table name
      tableName: 'appointment_part_types',
      // Set to false to remove the `created_at` and `updated_at` columns
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    }
  );

  return AppointmentPartType;
}