import { Router, Request, Response } from 'express';
import { ParticipantType } from '../../models/adminModels/ParticipantTypes.js';

export const getAllParticipantTypes = async (_req: Request, res: Response) => {
  try {
    const ParticipantTypes = await ParticipantType.findAll();
    res.json(ParticipantTypes);
    console.log(ParticipantTypes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /ParticipantTypes/:id
export const getParticipantTypeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const ParticipantTypeData = await ParticipantType.findByPk(id);
    if (ParticipantTypeData) {
      res.json(ParticipantTypeData);
      console.log(ParticipantTypeData);
    } else {
      res.status(404).json({ message: 'ParticipantType not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /ParticipantTypes
export const createParticipantType = async (req: Request, res: Response) => {
  const { participant_type_id, participant_type, participant_description, visibility } = req.body;
  try {
    const newParticipantType = await ParticipantType.create({ participant_type_id, participant_type, participant_description, visibility});
    res.status(201).json(newParticipantType);
    console.log(newParticipantType);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /ParticipantTypes/:id
export const updateParticipantType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { participant_type_id, participant_type, participant_description, visibility} = req.body;
  try {
    const UpdatedParticipantType = await ParticipantType.findByPk(id);
    if (UpdatedParticipantType) {
      UpdatedParticipantType.participant_type_id = participant_type_id;
      UpdatedParticipantType.participant_type = participant_type;
      UpdatedParticipantType.participant_description = participant_description;
      UpdatedParticipantType.visibility = visibility;
      await UpdatedParticipantType.save();
      res.json(UpdatedParticipantType);
      // console.log(UpdatedParticipantType);
    } else {
      res.status(404).json({ message: 'ParticipantType not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// // DELETE /ParticipantTypes/:id
// export const deleteParticipantType = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const ParticipantType = await ParticipantType.findByPk(id);
//     if (ParticipantType) {
//       await ParticipantType.destroy();
//       res.json({ message: 'ParticipantType deleted' });
//     } else {
//       res.status(404).json({ message: 'ParticipantType not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

const router = Router();

// GET /ParticipantTypes - Get all ParticipantTypes
router.get('/getall', getAllParticipantTypes);

// GET a single ParticipantType
router.get('/get:id', getParticipantTypeById);

// POST /ParticipantTypes - Create a new ParticipantType
router.post('/create', createParticipantType);

// PUT /ParticipantType/:id - Update a ParticipantType by id
router.put('/put:id', updateParticipantType);

// // DELETE /ParticipantType/:id - Delete a ParticipantType by id
// router.delete('/:id', deleteParticipantType);

// // POST /ParticipantTypes/seed - Create multiple ParticipantTypes
// router.post('/seed', createParticipantTypes);

export { router as ParticipantTypesRouter };

// export {
//   getAllParticipantTypes,
//   getParticipantTypeById,
//   createParticipantType,
//   updateParticipantType
//   // ,
//   // deleteParticipantType,
//   // createParticipantTypes 
// };