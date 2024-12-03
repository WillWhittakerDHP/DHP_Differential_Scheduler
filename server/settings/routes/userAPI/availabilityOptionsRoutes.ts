import { Router, Request, Response } from 'express';
import { AvailabilityOption } from '../../models/index.js';
import { UIDescription } from '../../models/index.js';
import { TimeBlockSet } from '../../models/index.js';
import { AppointmentPart } from '../../models/index.js';

// GET all AvailabilityOptions
export const getAllAvailabilityOptions = async (_req: Request, res: Response) => {
  try {
    const AvailabilityOptions = await AvailabilityOption.findAll({
      include: [{ model: UIDescription }, { model: TimeBlockSet }, { model: AppointmentPart }],
    });
    res.status(200).json(AvailabilityOptions);
    // console.log(AvailabilityOptions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET a single AvailabilityOption
export const getAvailabilityOptionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const AvailabilityOptionData = await AvailabilityOption.findByPk(id, {
      include: [{ model: UIDescription }],
    });
    
    if (!AvailabilityOptionData) {
      res.status(404).json({ message: 'No AvailabilityOption found with that id!' });
      return;
    }
    
    res.status(200).json(AvailabilityOptionData);
    // console.log(AvailabilityOptionData);
  } catch (err) {
    res.status(500).json(err);
  }
};


export const getAllAvailableAvailabilityOptions = async (_req: Request, res: Response) => {
  try {
    const AvailableAvailabilityOptions = await AvailabilityOption.findAll({
      // Order by title in ascending order
      order: ['title'],
      where: {
        // Only get that have this boolean set to TRUE
        can_be_scheduled: true
      },
      attributes: {
        // Don't include these fields in the returned data
        exclude: ['can_be_scheduled']
      }
    });
    res.json(AvailableAvailabilityOptions);
    // console.log(AvailableAvailabilityOptions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDifferentialAvailabilityOptions = async (_req: Request, res: Response) => {
  try {
    const DifferentialAvailabilityOptions = await AvailabilityOption.findAll({
      // Order by title in ascending order
      order: ['title'],
      where: {
        // Only get that have this boolean set to TRUE
        differential_scheduling_override: true
      },
      attributes: {
        // Don't include these fields in the returned data
        exclude: ['differential_scheduling_override']
      }
    });
    res.json(DifferentialAvailabilityOptions);
    // console.log(DifferentialAvailabilityOptions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /
export const createAvailabilityOption = async (req: Request, res: Response) => {
  const { availability_option_id, title, can_be_scheduled, differential_scheduling_override, ui_description_set, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4 } = req.body;
  try {
    const newAvailabilityOption = await AvailabilityOption.create({ availability_option_id, title, can_be_scheduled, differential_scheduling_override, ui_description_set, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4 });
    res.status(201).json(newAvailabilityOption);
    // console.log(newAvailabilityOption);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// PUT //:id
export const updateAvailabilityOption = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { availability_option_id, title, can_be_scheduled, differential_scheduling_override, ui_description_set, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4 } = req.body;
  try {
    const updatedAvailabilityOption = await AvailabilityOption.findByPk(id);
    if (updatedAvailabilityOption) {
      updatedAvailabilityOption.availability_option_id = availability_option_id;
      updatedAvailabilityOption.title = title;
      updatedAvailabilityOption.can_be_scheduled = can_be_scheduled;
      updatedAvailabilityOption.differential_scheduling_override = differential_scheduling_override;
      updatedAvailabilityOption.ui_description_set = ui_description_set;
      updatedAvailabilityOption.appointment_part_1 = appointment_part_1;
      updatedAvailabilityOption.appointment_part_2 = appointment_part_2;
      updatedAvailabilityOption.appointment_part_3 = appointment_part_3;
      updatedAvailabilityOption.appointment_part_4 = appointment_part_4;
      await updatedAvailabilityOption.save();
      res.json(AvailabilityOption);
      // console.log(AvailabilityOption);
    } else {
      res.status(404).json({ message: 'AvailabilityOptions not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// // DELETE a AvailabilityOption
// router.delete('/:id', async (req: Request, res: Response) => {
//   try {
//     const AvailabilityOptionData = await Book.destroy({
//       where: {
//         id: req.params.id,
//       },
//     });

  //   if (!AvailabilityOptionData) {
  //     res.status(404).json({ message: 'No AvailabilityOption found with that id!' });
  //     return;
  //   }

  //   res.status(200).json(AvailabilityOptionData);
  // } catch (err) {
  //   res.status(500).json(err);
  // }
// }
// );



// // POST //Seed

const router = Router();

// GET / - Get all AvailabilityOptions
router.get('/', getAllAvailabilityOptions);

// GET / - Get all AvailableAvailabilityOptions
router.get('/available', getAllAvailableAvailabilityOptions);

// GET / - Get all DifferentialAvailabilityOptions
router.get('/differential', getAllDifferentialAvailabilityOptions);

// GET a single AvailabilityOptions
router.get('/:id', getAvailabilityOptionById);

router.post('/', createAvailabilityOption);

// PUT /AvailabilityOptions/:id - Update a AvailabilityOptions by id
router.put('/:id', updateAvailabilityOption);

// AvailabilityOptions/:id - Delete a AvailabilityOptions by id
// router.delete('/:id', deleteAvailabilityOption);

export { router as AvailabilityOptionsRouter };

// POST //Seed

// export {
//   getAllAvailabilityOptions,
//   getAllAvailableAvailabilityOptions,
//   getAllDifferentialAvailabilityOptions,
//   getAvailabilityOptionById,
//   createAvailabilityOption,
//   updateAvailabilityOption
//   // ,
//   // deleteAvailabilityOption,
//   // createAvailabilityOption
// };
