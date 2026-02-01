import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { Appointment, PropertyVersion, Address, PropertyDetails, User, BlockInstanceVersion } from '../../../config/app.js';
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord 
} from '../../helpers/dataController.js';
import { createBlockInstanceVersion } from '../../../services/instanceVersioning.js';
import { loadAllAppointmentVersions } from '../../../services/appointmentSnapshotLoader.js';

const router = Router();

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

async function createSnapshotsForAppointment(
  blockInstanceIds: string[]
): Promise<string[]> {
  if (!blockInstanceIds || blockInstanceIds.length === 0) {
    return [];
  }

  const snapshots = await Promise.all(
    blockInstanceIds.map(async (blockInstanceId) => {
      const version = await createBlockInstanceVersion(blockInstanceId);
      return version.id;
    })
  );
  
  return snapshots;
}

/**
 * Validate snapshot IDs exist
 * Application-level FK validation for arrays
 */
async function validateSnapshotIds(snapshotIds: string[]): Promise<void> {
  if (snapshotIds.length === 0) return;
  
  const count = await BlockInstanceVersion.count({
    where: { id: { [Op.in]: snapshotIds } }
  });
  
  if (count !== snapshotIds.length) {
    throw new Error('One or more snapshot IDs are invalid');
  }
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentData = req.body;
    
    const serviceSnapshotIds = await createSnapshotsForAppointment(
      appointmentData.selectedServiceIds || []
    );
    const propertySnapshotIds = await createSnapshotsForAppointment(
      appointmentData.selectedPropertyIds || []
    );
    const optionSnapshotIds = await createSnapshotsForAppointment(
      appointmentData.selectedOptionIds || []
    );
    
    // 2. Validate snapshot IDs (redundant but defensive)
    await validateSnapshotIds(serviceSnapshotIds);
    await validateSnapshotIds(propertySnapshotIds);
    await validateSnapshotIds(optionSnapshotIds);
    
    const appointment = await createRecord(Appointment, {
      ...appointmentData,
      serviceSnapshotIds: serviceSnapshotIds.length > 0 ? serviceSnapshotIds : null,
      propertySnapshotIds: propertySnapshotIds.length > 0 ? propertySnapshotIds : null,
      optionSnapshotIds: optionSnapshotIds.length > 0 ? optionSnapshotIds : null,
    });
    
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

router.get('/:id/versions', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    const { services, properties, options } = await loadAllAppointmentVersions({
      serviceSnapshotIds: appointment.serviceSnapshotIds,
      propertySnapshotIds: appointment.propertySnapshotIds,
      optionSnapshotIds: appointment.optionSnapshotIds,
    });
    
    res.json({
      services,
      properties,
      options,
    });
  } catch (error) {
    console.error('[AppointmentRouter] Error fetching appointment versions:', error);
    res.status(500).json({ 
      error: 'Error fetching appointment versions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as AppointmentRouter };

