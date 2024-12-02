// import { AppointmentPart, UIDescription, Service} from '../models/index.js';

// import ServiceSeedData from './ServiceSeedData.json' assert { type: 'json' };
// import UIDescriptionSeedData from './UIDescriptionSeedData.json' assert { type: 'json' };
// import AppointmentPartSeedData from './AppointmentPartSeedData.json' assert { type: 'json' };

// export const seedDatabase = async () => {
//   await Services.bulkCreate(ServicesSeedData, {
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

// //     console.log('Checking out Services for AppointmentPart with id:', AppointmentPart.id);
// //     const randomServices = Services.slice(Math.floor(Math.random() * Services.length));
// //     await AppointmentPart.addServices(randomServices);
// //   }
// };
