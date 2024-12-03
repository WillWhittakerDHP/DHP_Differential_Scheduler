import { Router, Request, Response } from 'express';
import { TimeBlockSet } from '../../models/index.js';

export const getAllTimeBlockSets = async (_req: Request, res: Response) => {
  try {
    const timeBlockSets = await TimeBlockSet.findAll();
    res.json(timeBlockSets);
    // console.log(timeBlockSets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /TimeBlockSets/:id
export const getTimeBlockSetById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const timeBlockSetData = await TimeBlockSet.findByPk(id);
    if (timeBlockSetData) {
      res.json(timeBlockSetData);
      console.log(timeBlockSetData);
    } else {
      res.status(404).json({ message: 'TimeBlockSet not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /TimeBlockSets
export const createTimeBlockSet = async (req: Request, res: Response) => {
  const { time_block_set_id, base_time, rate_over_base_time, base_fee, rate_over_base_fee } = req.body;
  try {
    const newTimeBlockSet = await TimeBlockSet.create({ time_block_set_id, base_time, rate_over_base_time, base_fee, rate_over_base_fee });
    res.status(201).json(newTimeBlockSet);
    // console.log(newTimeBlockSet);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /TimeBlockSets/:id
export const updateTimeBlockSet = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { time_block_set_id, base_time, rate_over_base_time, base_fee, rate_over_base_fee } = req.body;
  try {
    const updatedTimeBlockSet = await TimeBlockSet.findByPk(id);
    if (updatedTimeBlockSet) {
      updatedTimeBlockSet.time_block_set_id = time_block_set_id;
      updatedTimeBlockSet.base_time = base_time;
      updatedTimeBlockSet.rate_over_base_time = rate_over_base_time;
      updatedTimeBlockSet.base_fee = base_fee;
      updatedTimeBlockSet.rate_over_base_fee = rate_over_base_fee;
      await updatedTimeBlockSet.save();
      res.json(updatedTimeBlockSet);
      // console.log(updatedTimeBlockSet);
    } else {
      res.status(404).json({ message: 'TimeBlockSet not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// // DELETE /TimeBlockSets/:id
// export const deleteTimeBlockSet = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const timeBlockSet = await TimeBlockSet.findByPk(id);
//     if (timeBlockSet) {
//       await timeBlockSet.destroy();
//       res.json({ message: 'TimeBlockSet deleted' });
//     } else {
//       res.status(404).json({ message: 'TimeBlockSet not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

const router = Router();

// GET /timeBlockSets - Get all timeBlockSets
router.get('/', getAllTimeBlockSets);

// GET a single timeBlockSet
router.get('/:id', getTimeBlockSetById);

// POST /timeBlockSets - Create a new timeBlockSet
router.post('/', createTimeBlockSet);

// PUT /timeBlockSet/:id - Update a timeBlockSet by id
router.put('/:id', updateTimeBlockSet);

// // DELETE /timeBlockSet/:id - Delete a timeBlockSet by id
// router.delete('/:id', deleteTimeBlockSet);

// // POST /timeBlockSets/seed - Create multiple timeBlockSets
// router.post('/seed', createTimeBlockSets);

export { router as TimeBlockSetsRouter };

// export {
//   getAllTimeBlockSets,
//   getTimeBlockSetById,
//   createTimeBlockSet,
//   updateTimeBlockSet
// // ,
// // deleteTimeBlockSet,
// // createTimeBlockSets
// };