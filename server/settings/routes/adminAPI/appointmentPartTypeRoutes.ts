import { Router, Request, Response } from 'express';
import { AppointmentPartType } from '../../models/index.js';

export const getAllAppointmentPartTypes = async (_req: Request, res: Response) => {
  try {
    const AppointmentPartTypes = await AppointmentPartType.findAll();
    res.json(AppointmentPartTypes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /AppointmentPartTypes/:id
export const getAppointmentPartTypeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const AppointmentPartTypeData = await AppointmentPartType.findByPk(id);
    if (AppointmentPartTypeData) {
      res.json(AppointmentPartTypeData);
      // console.log(AppointmentPartTypeData);
    } else {
      res.status(404).json({ message: 'AppointmentPartType not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /AppointmentPartTypes
export const createAppointmentPartType = async (req: Request, res: Response) => {
  const { appointment_part_type_id, appointment_part_name} = req.body;
  try {
    const newAppointmentPartType = await AppointmentPartType.create({ appointment_part_type_id, appointment_part_name});
    res.status(201).json(newAppointmentPartType);
    // console.log(newAppointmentPartType);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /AppointmentPartTypes/:id
export const updateAppointmentPartType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { appointment_part_type_id, appointment_part_name } = req.body;
  try {
    const updatedAppointmentPartType = await AppointmentPartType.findByPk(id);
    if (updatedAppointmentPartType) {
      updatedAppointmentPartType.appointment_part_type_id = appointment_part_type_id;
      updatedAppointmentPartType.appointment_part_name = appointment_part_name;
      await updatedAppointmentPartType.save();
      res.json(updatedAppointmentPartType);
      // console.log(updatedAppointmentPartType);
    } else {
      res.status(404).json({ message: 'AppointmentPart not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// // DELETE /AppointmentPartTypes/:id
// export const deleteAppointmentPartType = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const AppointmentPartType = await AppointmentPartType.findByPk(id);
//     if (AppointmentPartType) {
//       await AppointmentPartType.destroy();
//       res.json({ message: 'AppointmentPartType deleted' });
//     } else {
//       res.status(404).json({ message: 'AppointmentPartType not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// POST /AppointmentPartTypes/Seed


const router = Router();

// GET /AppointmentPartTypes - Get all AppointmentPartTypes
router.get('/', getAllAppointmentPartTypes);

// GET a single AppointmentPartType
router.get('/:id', getAppointmentPartTypeById);

// POST /AppointmentPartTypes - Create a new AppointmentPartType
router.post('/', createAppointmentPartType);

// PUT /AppointmentPartType/:id - Update a AppointmentPartType by id
router.put('/:id', updateAppointmentPartType);

// // DELETE /AppointmentPartType/:id - Delete a AppointmentPartType by id
// router.delete('/:id', deleteAppointmentPartType);

// // POST /AppointmentPartTypes/seed - Create multiple AppointmentPartTypes
// router.post('/seed', createAppointmentPartTypes);

export { router as AppointmentPartTypesRouter };

// export { 
//   getAllAppointmentPartTypes, 
//   getAppointmentPartTypeByID, 
//   createAppointmentPartType, 
//   updateAppointmentPartType
//   // , 
//   // deleteAppointmentPartType, 
//   // createAppointmentPartTypes
// };
