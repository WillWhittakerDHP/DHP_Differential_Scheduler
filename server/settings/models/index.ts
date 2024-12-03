import sequelize from '../../config/connection.js';
//AdminChoices
import { AppointmentPartFactory } from './adminModels/AppointmentParts.js';
import { AppointmentPartTypeFactory } from './adminModels/AppointmentPartTypes.js';
// import { DwellingTypeFactory } from './adminChoices/DwellingTypes.js';
import { TimeBlockSetFactory } from './adminModels/TimeBlockSets.js';
import { UIDescriptionFactory } from './adminModels/UIDescriptions.js';
// import { UserTypeFactory } from './adminChoices/UserTypes.js';
//UserChoices
import { ServiceFactory } from './userModels/Services.js';
import { AdditionalServiceFactory } from './userModels/AdditionalServices.js'
import { AvailabilityOptionFactory } from './userModels/AvailabilityOptions.js'
import { DwellingAdjustmentFactory } from './userModels/DwellingAdjustments.js';


//AdminChoices
const AppointmentPart = AppointmentPartFactory(sequelize);
const AppointmentPartType = AppointmentPartTypeFactory(sequelize);
// const DwellingType = DwellingTypeFactory(sequelize);
const TimeBlockSet = TimeBlockSetFactory(sequelize);
const UIDescription = UIDescriptionFactory(sequelize);
// const UserType = UserTypeFactory(sequelize);

//UserChoices
const Service = ServiceFactory(sequelize);
const AdditionalService = AdditionalServiceFactory(sequelize);
const AvailabilityOption = AvailabilityOptionFactory(sequelize);
const DwellingAdjustment = DwellingAdjustmentFactory(sequelize);


//PART RELATIONSHIPS
//TO PartTypes 
AppointmentPart.hasOne(AppointmentPartType, {
  onDelete: 'CASCADE',
});

//FROM PartType 
AppointmentPartType.belongsToMany(AppointmentPart, {
  through: 'AppointmentPartAppointmentPartTypes',
});

//TO TimeBlock
AppointmentPart.hasOne(TimeBlockSet, {
  onDelete: 'CASCADE',
});

//FROM TimeBlock
TimeBlockSet.belongsToMany(AppointmentPart, {
  through: 'AppointmentPartTimeBlockSet'
});


// //UIDescription RELATIONSHIPS
// //TO PartTypes 
// AppointmentPart.hasOne(AppointmentPartType, {
//   onDelete: 'CASCADE',
// });

// //FROM PartType 
// AppointmentPartType.belongsToMany(AppointmentPart, {
//   through: 'AppointmentPartAppointmentPartTypes',
// });

// //TO TimeBlock
// AppointmentPart.hasOne(TimeBlockSet, {
//   onDelete: 'CASCADE',
// });

// //FROM TimeBlock
// TimeBlockSet.belongsToMany(AppointmentPart, {
//   through: 'AppointmentPartTimeBlockSet'
// });

// !TIME BLOCK RELATIONSHIPS TO USER OPTIONS SHOULD GO THROUGH PARTS
// //TimeBlocksSets TO Services
// TimeBlockSet.belongsToMany(Service, {
//   through: 'ServiceTimeBlockSets',
// });

// //Serv to TimeBlockSets
// Service.belongsToMany(TimeBlockSet, {
//   through: 'ServiceTimeBlockSets',
// });

// //TimeBlocksSets TO AddServices
// TimeBlockSet.belongsToMany(AdditionalService, {
//   through: 'AdditionalServiceTimeBlockSets',
// });

// //AddServ TO TimeBlockSets
// AdditionalService.belongsToMany(TimeBlockSet, {
  //   through: 'AdditionalServiceTimeBlockSets',
  // });

// //FROM TimeBlocksSets m2m
// TimeBlockSet.belongsToMany(AvailabilityOption, {
//   through: 'AvailabilityOptionTimeBlockSets',
// });

// //TO TimeBlockSets m2m
// AvailabilityOption.belongsToMany(TimeBlockSet, {
//   through: 'AvailabilityOptionTimeBlockSets',
// });
  
  
//SERVICE RELATIONSHIPS: UIDescription, AppointmentPart
//TO Desc 121
Service.hasOne(UIDescription, {
  onDelete: 'CASCADE',
});

//FROMDesc 121
UIDescription.belongsTo(Service);

//TO AppointmentParts m2m
Service.belongsToMany(AppointmentPart, {
  through: 'ServiceAppointmentPart',
});

//FROM AppointmentParts m2m
AppointmentPart.belongsToMany(Service, {
  through: 'ServiceAppointmentPart',
});


//AVAILABILITY OPTIONS RELATIONSHIPS: UIDescription, AppointmentPart
//TO Desc 121
AvailabilityOption.hasOne(UIDescription, {
  onDelete: 'CASCADE',
});

//FROMDesc 121
UIDescription.belongsTo(AvailabilityOption);

//TO AppointmentParts m2m
AvailabilityOption.belongsToMany(AppointmentPart, {
  through: 'AvailabilityOptionAppointmentPart',
});

//FROM AppointmentParts m2m
AppointmentPart.belongsToMany(AvailabilityOption, {
  through: 'AvailabilityOptionAppointmentPart',
});

//DWELLING ADJUSTMENTS RELATIONSHIPS: AppointmentPart
// //FROM TimeBlocksSets m2m
// TimeBlockSet.belongsToMany(DwellingAdjustment, {
//   through: 'DwellingAdjustmentTimeBlockSets',
// });

// //TO TimeBlockSets m2m
// DwellingAdjustment.belongsToMany(TimeBlockSet, {
//   through: 'DwellingAdjustmentTimeBlockSets',
// });

//TO AppointmentParts m2m
DwellingAdjustment.belongsToMany(AppointmentPart, {
  through: 'DwellingAdjustmentAppointmentPart',
});

//FROM AppointmentParts m2m
AppointmentPart.belongsToMany(DwellingAdjustment, {
  through: 'DwellingAdjustmentAppointmentPart',
});


//ADDITIONAL SERVICE RELATIONSHIPS: UIDescription, AppointmentPart
//TO Desc 121
AdditionalService.hasOne(UIDescription, {
  onDelete: 'CASCADE',
});

//FROM Desc 121
UIDescription.belongsTo(AdditionalService);

//TO AppointmentParts m2m
AdditionalService.belongsToMany(AppointmentPart, {
  through: 'AdditionalServiceAppointmentPart',
});

//FROM AppointmentParts m2m
AppointmentPart.belongsToMany(AdditionalService, {
  through: 'AdditionalServiceAppointmentPart',
});

export { AdditionalService, AppointmentPartType, AppointmentPart, AvailabilityOption, DwellingAdjustment, Service, TimeBlockSet, UIDescription };