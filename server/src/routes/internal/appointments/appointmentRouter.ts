import { Router, Request, Response } from 'express';
import { Appointment, PropertyVersion, Address, PropertyDetails, User } from '../../../config/app.js';
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord 
} from '../../helpers/dataController.js';

const router = Router();

/**
 * GET /appointments
 * Get all appointments with relationships (propertyVersion with address and details, client, agent)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await fetchAll(Appointment, {
      includes: [
        { 
          model: PropertyVersion, 
          as: 'propertyVersion',
          include: [
            { model: Address, as: 'address' },
            { model: PropertyDetails, as: 'propertyDetails' },
          ],
        },
        { model: User, as: 'client' },
        { model: User, as: 'agent' },
      ]
    });
    res.json(appointments);
  } catch (error) {
    console.error('[AppointmentRouter] Error fetching appointments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch appointments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /appointments/:id
 * Get an appointment by ID with relationships (propertyVersion with address and details, client, agent)
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { 
          model: PropertyVersion, 
          as: 'propertyVersion',
          include: [
            { model: Address, as: 'address' },
            { model: PropertyDetails, as: 'propertyDetails' },
          ],
        },
        { model: User, as: 'client' },
        { model: User, as: 'agent' },
      ],
    });
    
    if (!appointment) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('[AppointmentRouter] Error fetching appointment:', error);
    res.status(500).json({ 
      error: 'Error fetching appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /appointments
 * Create a new appointment
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await createRecord(Appointment, req.body);
    
    // Fetch with relationships for response
    const appointmentWithRelations = await Appointment.findByPk(appointment.id, {
      include: [
        { 
          model: PropertyVersion, 
          as: 'propertyVersion',
          include: [
            { model: Address, as: 'address' },
            { model: PropertyDetails, as: 'propertyDetails' },
          ],
        },
        { model: User, as: 'client' },
        { model: User, as: 'agent' },
      ],
    });
    
    res.status(201).json(appointmentWithRelations);
  } catch (error) {
    console.error('[AppointmentRouter] Error creating appointment:', error);
    res.status(500).json({ 
      error: 'Failed to create appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /appointments/:id
 * Update an appointment by ID
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedRows = await updateRecord(Appointment, req.params.id, req.body);
    
    if (updatedRows === 0) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { 
          model: PropertyVersion, 
          as: 'propertyVersion',
          include: [
            { model: Address, as: 'address' },
            { model: PropertyDetails, as: 'propertyDetails' },
          ],
        },
        { model: User, as: 'client' },
        { model: User, as: 'agent' },
      ],
    });
    
    res.json(appointment);
  } catch (error) {
    console.error('[AppointmentRouter] Error updating appointment:', error);
    res.status(500).json({ 
      error: 'Failed to update appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /appointments/:id
 * Partially update an appointment by ID
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await patchRecord(Appointment, req.params.id, req.body);
    
    if (!updated) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { 
          model: PropertyVersion, 
          as: 'propertyVersion',
          include: [
            { model: Address, as: 'address' },
            { model: PropertyDetails, as: 'propertyDetails' },
          ],
        },
        { model: User, as: 'client' },
        { model: User, as: 'agent' },
      ],
    });
    
    res.json(appointment);
  } catch (error) {
    console.error('[AppointmentRouter] Error patching appointment:', error);
    res.status(500).json({ 
      error: 'Failed to patch appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /appointments/:id
 * Delete an appointment by ID
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteRecord(Appointment, req.params.id);
    
    if (!deleted) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('[AppointmentRouter] Error deleting appointment:', error);
    res.status(500).json({ 
      error: 'Failed to delete appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as AppointmentRouter };

