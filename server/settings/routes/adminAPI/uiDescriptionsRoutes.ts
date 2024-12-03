import { Router, Request, Response } from 'express';
import { UIDescription } from '../../models/index.js';

export const getAllUIDescriptions = async (_req: Request, res: Response) => {
  try {
    const UIDescriptions = await UIDescription.findAll();
    res.json(UIDescriptions);
    // console.log(UIDescriptions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /UIDescriptions/:id
export const getUIDescriptionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const UIDescriptionData = await UIDescription.findByPk(id);
    if (UIDescriptionData) {
      res.json(UIDescriptionData);
      // console.log(UIDescriptionData);
    } else {
      res.status(404).json({ message: 'UIDescription not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /UIDescriptions
export const createUIDescription = async (req: Request, res: Response) => {
  const { ui_description_set_id, buyer_description, agent_description, owner_description } = req.body;
  try {
    const newUIDescription = await UIDescription.create({ ui_description_set_id, buyer_description, agent_description, owner_description});
    res.status(201).json(newUIDescription);
    // console.log(newUIDescription);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /UIDescriptions/:id
export const updateUIDescription = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ui_description_set_id, buyer_description, agent_description, owner_description} = req.body;
  try {
    const UpdatedUIDescription = await UIDescription.findByPk(id);
    if (UpdatedUIDescription) {
      UpdatedUIDescription.ui_description_set_id = ui_description_set_id;
      UpdatedUIDescription.buyer_description = buyer_description;
      UpdatedUIDescription.agent_description = agent_description;
      UpdatedUIDescription.owner_description = owner_description;
      await UpdatedUIDescription.save();
      res.json(UpdatedUIDescription);
      // console.log(UpdatedUIDescription);
    } else {
      res.status(404).json({ message: 'UIDescription not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// // DELETE /UIDescriptions/:id
// export const deleteUIDescription = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const UIDescription = await UIDescription.findByPk(id);
//     if (UIDescription) {
//       await UIDescription.destroy();
//       res.json({ message: 'UIDescription deleted' });
//     } else {
//       res.status(404).json({ message: 'UIDescription not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

const router = Router();

// GET /UIDescriptions - Get all UIDescriptions
router.get('/getall', getAllUIDescriptions);

// GET a single UIDescription
router.get('/get:id', getUIDescriptionById);

// POST /UIDescriptions - Create a new UIDescription
router.post('/create', createUIDescription);

// PUT /UIDescription/:id - Update a UIDescription by id
router.put('/put:id', updateUIDescription);

// // DELETE /UIDescription/:id - Delete a UIDescription by id
// router.delete('/:id', deleteUIDescription);

// // POST /UIDescriptions/seed - Create multiple UIDescriptions
// router.post('/seed', createUIDescriptions);

export { router as UIDescriptionsRouter };

// export {
//   getAllUIDescriptions,
//   getUIDescriptionById,
//   createUIDescription,
//   updateUIDescription
//   // ,
//   // deleteUIDescription,
//   // createUIDescriptions 
// };