import { Model, DataTypes, 
  // Optional,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  type BelongsToManyAddAssociationMixin,
  type Sequelize } from 'sequelize';
  
import { AvailabilityOption } from '../userModels/AvailabilityOptions';
import { TimeBlockSet } from './TimeBlockSets';
import { AppointmentPartType } from './AppointmentPartTypes';

export class AppointmentPart extends Model<
  InferAttributes<AppointmentPart>,
  InferCreationAttributes<AppointmentPart>
> {
  declare appointment_part_id: CreationOptional<number>;
  declare appointment_part_type_id: ForeignKey<AppointmentPartType['appointment_part_type_id']>;
  declare on_site: boolean;
  declare time_block_set_id: ForeignKey<TimeBlockSet['time_block_set_id']>;
  
  declare addAvailabilityOption: BelongsToManyAddAssociationMixin<AvailabilityOption, AvailabilityOption['availability_option_id']>;
  declare addAvailabilityOptions: BelongsToManyAddAssociationMixin<
  AvailabilityOption[],
  AvailabilityOption['availability_option_id'][]
  >;
}

export function AppointmentPartFactory(sequelize: Sequelize): typeof AppointmentPart {
  AppointmentPart.init(
    {
      appointment_part_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      on_site: {
        type: DataTypes.BOOLEAN,
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