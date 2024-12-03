import { Router, Request, Response } from 'express';
import { DwellingType } from '../../models/adminModels/DwellingTypes.js';

export const getAllDwellingTypes = async (_req: Request, res: Response) => {
  try {
    const DwellingTypes = await DwellingType.findAll();
    res.json(DwellingTypes);
    // console.log(DwellingTypes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /DwellingTypes/:id
export const getDwellingTypeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const DwellingTypeData = await DwellingType.findByPk(id);
    if (DwellingTypeData) {
      res.json(DwellingTypeData);
      // console.log(DwellingTypeData);
    } else {
      res.status(404).json({ message: 'DwellingType not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /DwellingTypes
export const createDwellingType = async (req: Request, res: Response) => {
  const { dwelling_type_id, dwelling_type_name, ui_description_set_id } = req.body;
  try {
    const newDwellingType = await DwellingType.create({ dwelling_type_id, dwelling_type_name, ui_description_set_id});
    res.status(201).json(newDwellingType);
    // console.log(newDwellingType);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /DwellingTypes/:id
export const updateDwellingType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { dwelling_type_id, dwelling_type, ui_description_set} = req.body;
  try {
    const UpdatedDwellingType = await DwellingType.findByPk(id);
    if (UpdatedDwellingType) {
      UpdatedDwellingType.dwelling_type_id = dwelling_type_id;
      UpdatedDwellingType.dwelling_type_name = dwelling_type;
      UpdatedDwellingType.ui_description_set_id = ui_description_set;
      await UpdatedDwellingType.save();
      res.json(UpdatedDwellingType);
      // console.log(UpdatedDwellingType);
    } else {
      res.status(404).json({ message: 'DwellingType not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// // DELETE /DwellingTypes/:id
// export const deleteDwellingType = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const DwellingType = await DwellingType.findByPk(id);
//     if (DwellingType) {
//       await DwellingType.destroy();
//       res.json({ message: 'DwellingType deleted' });
//     } else {
//       res.status(404).json({ message: 'DwellingType not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

const router = Router();

// GET /DwellingTypes - Get all DwellingTypes
router.get('/getall', getAllDwellingTypes);

// GET a single DwellingType
router.get('/get:id', getDwellingTypeById);

// POST /DwellingTypes - Create a new DwellingType
router.post('/create', createDwellingType);

// PUT /DwellingType/:id - Update a DwellingType by id
router.put('/put:id', updateDwellingType);

// // DELETE /DwellingType/:id - Delete a DwellingType by id
// router.delete('/:id', deleteDwellingType);

// // POST /DwellingTypes/seed - Create multiple DwellingTypes
// router.post('/seed', createDwellingTypes);

export { router as DwellingTypesRouter };

// export {
//   getAllDwellingTypes,
//   getDwellingTypeById,
//   createDwellingType,
//   updateDwellingType
//   // ,
//   // deleteDwellingType,
//   // createDwellingTypes 
// };