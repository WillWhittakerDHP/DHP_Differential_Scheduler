// import { AppointmentPart } from '../models/adminModels/AppointmentParts.js';
// import AppointmentPartSeedData from './adminSeeds/AppointmentPartsSeedData.json' with { type: 'json' };
// import { AppointmentPartType } from '../models/adminModels/AppointmentPartTypes.js';
// import AppointmentPartTypeSeedData from './adminSeeds/AppointmentPartTypeSeedData.json' with { type: 'json' };
// import { DwellingType } from '../models/adminModels/DwellingTypes.js';
// import DwellingTypeSeedData from './adminSeeds/DwellingTypesSeedData.json' with { type: 'json' };
// import { TimeBlockSet } from '../models/adminModels/TimeBlockSets.js';
// import TimeBlockSetSeedData from './adminSeeds/TimeBlockSetsSeedData.json' with { type: 'json' };
import { UIDescription } from '../models/adminModels/UIDescriptions.js';
import UIDescriptionSeedData from './adminSeeds/UIDescriptionSeedData.json' with { type: 'json' };
// import { ParticipantType } from '../models/adminModels/ParticipantTypes.js';
// import ParticipantTypeSeedData from './adminSeeds/ParticipantTypesSeedData.json' with { type: 'json' };
// import { AdditionalService } from '../models/userModels/AdditionalServices.js';
// import AdditionalServicesSeedData from './userSeeds/AdditionalServicesSeedData.json' with { type: 'json' };
// import { AvailabilityOption } from '../models/userModels/AvailabilityOptions.js';
// import AvailabilityOptionSeedData from './userSeeds/AvailabilityOptionsSeedData.json' with { type: 'json' };
// import { DwellingAdjustment } from '../models/userModels/DwellingAdjustments.js';
// import DwellingAdjustmentSeedData from './userSeeds/DwellingAdjustmentsSeedData.json' with { type: 'json' };
// import { Service } from '../models/userModels/Services.js';
// import ServicesSeedData from './userSeeds/ServicesSeedData.json' with { type: 'json' };

export const seedDatabase = async () => {

//   try{
//     await AppointmentPart.bulkCreate(AppointmentPartSeedData, {
//       validate: true,
//     });
//   } catch (error) { console.log(error)};

//   try{
//     await AppointmentPartType.bulkCreate(AppointmentPartTypeSeedData, {
//       validate: true,
//     });
//   } catch (error) { console.log(error)};

//   try{
// // TODO: Correct SeedData typing and titles
//     await DwellingType.bulkCreate(DwellingTypeSeedData, {
//       validate: true,
//     });
//   } catch (error) { console.log(error)};

//   try{
//     await TimeBlockSet.bulkCreate(TimeBlockSetSeedData, {
//       validate: true,
//     });
//   } catch (error) { console.log(error)};

  try{
    await UIDescription.bulkCreate(UIDescriptionSeedData, {
      validate: true,
    });
  } catch (error) { console.log(error)};

//   try{
// // TODO: Correct SeedData typing and titles
//     await ParticipantType.bulkCreate(ParticipantTypeSeedData, {
//       validate: true,
//     });
//   } catch (error) { console.log(error)};

//   try{
//     await AdditionalService.bulkCreate(AdditionalServicesSeedData, {
//       validate: true,
//     });
//   } catch (error) { console.log(error)};

//   try{    
// // TODO: Correct SeedData typing and titles
//     await AvailabilityOption.bulkCreate(AvailabilityOptionSeedData, {
//       validate: true,
//     });
//   } catch (error) { console.log(error)};

//   try{
// // TODO: Correct SeedData typing and titles
//     await DwellingAdjustment.bulkCreate(DwellingAdjustmentSeedData, {
//       validate: true,
//     });
//   } catch (error) { console.log(error)};

//   try{
//     await Service.bulkCreate(ServicesSeedData, {
//       validate: true,
//     });
//   } catch (error) { console.log(error)};
};