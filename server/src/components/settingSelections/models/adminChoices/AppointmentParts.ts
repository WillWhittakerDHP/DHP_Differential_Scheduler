import { Model, DataTypes, 
  // Optional,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  // type ForeignKey,
  // type BelongsToManyAddAssociationMixin,
  type Sequelize } from 'sequelize';
  

export class AppointmentPart extends Model<
  InferAttributes<AppointmentPart>,
  InferCreationAttributes<AppointmentPart>
> {
  declare appointment_part_id: CreationOptional<number>;
  declare appointment_part_type_id: number;
  declare on_site: boolean;
  declare time_block_set_id: number;

  // TODO What's this?
  // //  Since TS cannot determine model associations at compile time, we need to declare the association methods here. These will not exist until `Model.init` was called.
  //   declare addReaders: BelongsToManyAddAssociationMixin<
  //   Reader[],
  //   Reader['id'][]
  // >;
  // declare addReader: BelongsToManyAddAssociationMixin<Reader, Reader['id']>;
}

export function AppointmentPartFactory(sequelize: Sequelize): typeof AppointmentPart {
  AppointmentPart.init(
    {
      appointment_part_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      appointment_part_type_id: {
        type: DataTypes.INTEGER,
      },
      on_site: {
        type: DataTypes.BOOLEAN,
      },
      time_block_set_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      // Manually define the table name
      tableName: 'appointment_parts',
      // Set to false to remove the `created_at` and `updated_at` columns
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    }
  );

  return AppointmentPart;
}
