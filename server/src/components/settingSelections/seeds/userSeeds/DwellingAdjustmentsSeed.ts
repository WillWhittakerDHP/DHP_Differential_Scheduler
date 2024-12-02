// import { AppointmentPart, UIDescription, DwellingAdjustment} from '../models/index.js';

// import DwellingAdjustmentSeedData from './DwellingAdjustmentSeedData.json' assert { type: 'json' };
// import UIDescriptionSeedData from './UIDescriptionSeedData.json' assert { type: 'json' };
// import AppointmentPartSeedData from './AppointmentPartSeedData.json' assert { type: 'json' };

// export const seedDatabase = async () => {
//   await DwellingAdjustments.bulkCreate(DwellingAdjustmentsSeedData, {
//     validate: true,
//   });

//   const UIDescriptions = await UIDescription.bulkCreate(UIDescriptionSeedData, {
//     returning: true,
//     validate: true,
//   });

//   const AppointmentParts = await AppointmentPart.bulkCreate(AppointmentPartSeedData, {
//     individualHooks: true,
//     returning: true,
//     validate: true,
//   });

// //   for (const AppointmentPart of AppointmentParts) {
// //     console.log('Creating UIDescription for AppointmentPart with id:', AppointmentPart.id);
// //     await UIDescription.create({
// //       AppointmentPartId: AppointmentPart.id,
// //     });

// //     console.log('Checking out DwellingAdjustments for AppointmentPart with id:', AppointmentPart.id);
// //     const randomDwellingAdjustments = DwellingAdjustments.slice(Math.floor(Math.random() * DwellingAdjustments.length));
// //     await AppointmentPart.addDwellingAdjustments(randomDwellingAdjustments);
// //   }
// };
