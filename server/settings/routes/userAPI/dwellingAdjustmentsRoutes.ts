import { Router, Request, Response } from 'express';
import { DwellingAdjustment } from '../../models/index.js';
import { TimeBlockSet } from '../../models/index.js';
import { AppointmentPart } from '../../models/index.js';

// GET all DwellingAdjustments
export const getAllDwellingAdjustments = async (_req: Request, res: Response) => {
  try {
    const DwellingAdjustments = await DwellingAdjustment.findAll({
      include: [{ model: TimeBlockSet }, { model: AppointmentPart }],
    });
    res.status(200).json(DwellingAdjustments);
    // console.log(DwellingAdjustments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET a single DwellingAdjustment
export const getDwellingAdjustmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const DwellingAdjustmentData = await DwellingAdjustment.findByPk(id, {
      include: [{ model: AppointmentPart }],
    });
    
    if (!DwellingAdjustmentData) {
      res.status(404).json({ message: 'No DwellingAdjustment found with that id!' });
      return;
    }
    
    res.status(200).json(DwellingAdjustmentData);
    // console.log(DwellingAdjustmentData);
  } catch (err) {
    res.status(500).json(err);
  }
};

// POST /
export const createDwellingAdjustment = async (req: Request, res: Response) => {
  const { dwelling_adjustment_id, dwelling_type_id, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4 } = req.body;
  try {
    const newDwellingAdjustment = await DwellingAdjustment.create({ dwelling_adjustment_id, dwelling_type_id, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4 });
    res.status(201).json(newDwellingAdjustment);
    // console.log(newDwellingAdjustment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// PUT //:id
export const updateDwellingAdjustment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { dwelling_adjustment_id, dwelling_type_id, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4 } = req.body;
  try {
    const updatedDwellingAdjustment = await DwellingAdjustment.findByPk(id);
    if (updatedDwellingAdjustment) {
      updatedDwellingAdjustment.dwelling_adjustment_id = dwelling_adjustment_id;
      updatedDwellingAdjustment.dwelling_type_id = dwelling_type_id;
      updatedDwellingAdjustment.appointment_part_1 = appointment_part_1;
      updatedDwellingAdjustment.appointment_part_2 = appointment_part_2;
      updatedDwellingAdjustment.appointment_part_3 = appointment_part_3;
      updatedDwellingAdjustment.appointment_part_4 = appointment_part_4;
      await updatedDwellingAdjustment.save();
      res.json(DwellingAdjustment);
      // console.log(DwellingAdjustment);
    } else {
      res.status(404).json({ message: 'DwellingAdjustments not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// // DELETE a DwellingAdjustment
// router.delete('/:id', async (req: Request, res: Response) => {
//   try {
//     const DwellingAdjustmentData = await Book.destroy({
//       where: {
//         id: req.params.id,
//       },
//     });

  //   if (!DwellingAdjustmentData) {
  //     res.status(404).json({ message: 'No DwellingAdjustment found with that id!' });
  //     return;
  //   }

  //   res.status(200).json(DwellingAdjustmentData);
  // } catch (err) {
  //   res.status(500).json(err);
  // }
// }
// );



// // POST //Seed

const router = Router();

// GET / - Get all DwellingAdjustments
router.get('/', getAllDwellingAdjustments);

// GET a single DwellingAdjustments
router.get('/:id', getDwellingAdjustmentById);

router.post('/', createDwellingAdjustment);

// PUT /DwellingAdjustments/:id - Update a DwellingAdjustments by id
router.put('/:id', updateDwellingAdjustment);

// DwellingAdjustments/:id - Delete a DwellingAdjustments by id
// router.delete('/:id', deleteDwellingAdjustment);

export { router as DwellingAdjustmentsRouter };

// POST //Seed

// export {
//   getAllDwellingAdjustments,
//   getAllAvailableDwellingAdjustments,
//   getAllDifferentialDwellingAdjustments,
//   getDwellingAdjustmentById,
//   createDwellingAdjustment,
//   updateDwellingAdjustment
//   // ,
//   // deleteDwellingAdjustment,
//   // createDwellingAdjustment
// };
