// import { AppointmentPart, UIDescription, AvailabilityOption} from '../models/index.js';

// import AppointmentPartSeedData from './AppointmentPartSeedData.json' assert { type: 'json' };
// import UIDescriptionSeedData from './UIDescriptionSeedData.json' assert { type: 'json' };
// import AvailabilityOptionSeedData from './AvailabilityOptionSeedData.json' assert { type: 'json' };

// export const seedDatabase = async () => {
//   await Author.bulkCreate(UIDescriptionSeedData, {
//     validate: true,
//   });

//   const AvailabilityOptions = await AvailabilityOption.bulkCreate(AvailabilityOptionSeedData, {
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



// //     console.log('Checking out AvailabilityOptions for AppointmentPart with id:', AppointmentPart.id);
// //     const randomAvailabilityOptions = AvailabilityOptions.slice(Math.floor(Math.random() * AvailabilityOptions.length));
// //     await AppointmentPart.addAvailabilityOptions(randomAvailabilityOptions);
// //   }
// };
