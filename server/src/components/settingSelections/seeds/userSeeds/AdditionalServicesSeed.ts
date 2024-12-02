// import { AppointmentPart, UIDescription, AdditionalService} from '../models/index.js';

// import AdditionalServiceSeedData from './AdditionalServiceSeedData.json' assert { type: 'json' };
// import UIDescriptionSeedData from './UIDescriptionSeedData.json' assert { type: 'json' };
// import AppointmentPartSeedData from './AppointmentPartSeedData.json' assert { type: 'json' };

// export const seedDatabase = async () => {
//   await AdditionalServices.bulkCreate(AdditionalServicesSeedData, {
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

// //     console.log('Checking out AdditionalServices for AppointmentPart with id:', AppointmentPart.id);
// //     const randomAdditionalServices = AdditionalServices.slice(Math.floor(Math.random() * AdditionalServices.length));
// //     await AppointmentPart.addAdditionalServices(randomAdditionalServices);
// //   }
// };
