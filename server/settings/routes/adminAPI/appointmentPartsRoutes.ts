import { Router, Request, Response } from 'express';
import { AppointmentPart } from '../../models/index.js';

export const getAllAppointmentParts = async (_req: Request, res: Response) => {
  try {
    const AppointmentParts = await AppointmentPart.findAll();
    res.json(AppointmentParts);
    // console.log(AppointmentParts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOnSiteAppointmentParts = async (_req: Request, res: Response) => {
  try {
    const OnSiteAppointmentParts = await AppointmentPart.findAll({
      // Order by appointment_part_id in ascending order
      order: ['appointment_part_id'],
      where: {
        // Only get AppointmentParts that have this boolean set to TRUE
        on_site: true
      },
      attributes: {
        // Don't include these fields in the returned data
        exclude: ['on_site', 'time_block_set_id']
      }
    });
    res.json(OnSiteAppointmentParts);
    // console.log(OnSiteAppointmentParts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /AppointmentParts/:id
export const getAppointmentPartById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const AppointmentPartData = await AppointmentPart.findByPk(id);
    if (AppointmentPartData) {
      res.json(AppointmentPartData);
      // console.log(AppointmentPartData);
    } else {
      res.status(404).json({ message: 'AppointmentPart not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /AppointmentParts
export const createAppointmentPart = async (req: Request, res: Response) => {
  const { appointment_part_id, appointment_part_type_id, time_block_set_id, on_site } = req.body;
  try {
    const newAppointmentPart = await AppointmentPart.create({ appointment_part_id, appointment_part_type_id, time_block_set_id, on_site });
    res.status(201).json(newAppointmentPart);
    // console.log(newAppointmentPart);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /AppointmentParts/:id
export const updateAppointmentPart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { appointment_part_id, appointment_part_type_id, time_block_set_id, on_site } = req.body;
  try {
    const AppointmentPartData = await AppointmentPart.findByPk(id);
    if (AppointmentPartData) {
      AppointmentPartData.appointment_part_id = appointment_part_id;
      AppointmentPartData.appointment_part_type_id = appointment_part_type_id;
      AppointmentPartData.time_block_set_id = time_block_set_id;
      AppointmentPartData.on_site = on_site;
      await AppointmentPartData.save();
      res.json(AppointmentPartData);
      // console.log(AppointmentPartData);
    } else {
      res.status(404).json({ message: 'AppointmentPart not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// // DELETE /AppointmentParts/:id
// export const deleteAppointmentPart = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const AppointmentPart = await AppointmentPart.findByPk(id);
//     if (AppointmentPart) {
//       await AppointmentPart.destroy();
//       res.json({ message: 'AppointmentPart deleted' });
//     } else {
//       res.status(404).json({ message: 'AppointmentPart not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// POST /AppointmentParts/Seed

const router = Router();

// GET /AppointmentParts - Get all AppointmentParts
router.get('/', getAllAppointmentParts);

// GET /AppointmentParts/on-site - Get all paperback AppointmentParts
router.get('/on-site', getAllOnSiteAppointmentParts);

// GET a single AppointmentPart
router.get('/:id', getAppointmentPartById);

// POST /AppointmentParts - Create a new AppointmentPart
router.post('/', createAppointmentPart);

// PUT /AppointmentPart/:id - Update a AppointmentPart by id
router.put('/:id', updateAppointmentPart);

// // DELETE /AppointmentPart/:id - Delete a AppointmentPart by id
// router.delete('/:id', deleteAppointmentPart);

// // POST /AppointmentParts/seed - Create multiple AppointmentParts
// router.post('/seed', createAppointmentParts);

export { router as AppointmentPartsRouter };

// const router = Router();

// // GET /AppointmentParts - Get all AppointmentParts
// export { getAllAppointmentParts, 
//   getAllOnSiteAppointmentParts,  
//   getAppointmentPartById, 
//   createAppointmentPart, 
//   updateAppointmentPart
//   // , 
//   // deleteAppointmentPart, 
//   // createAppointmentParts 
// };
