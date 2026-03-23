import {
  AppointmentAttendee,
  AppointmentFeeSummary,
  AppointmentFeeEntry,
  PropertyVersion,
  Address,
  PropertyDetails,
  User,
  BlockInstance,
  AppointmentSelectionLine,
  AppointmentTimeSlot,
} from '../../../config/app.js'

export const appointmentIncludes = [
  {
    model: PropertyVersion,
    as: 'propertyVersion',
    include: [
      { model: Address, as: 'address' },
      { model: PropertyDetails, as: 'propertyDetails' },
    ],
  },
  {
    model: AppointmentAttendee,
    as: 'attendees',
    include: [
      { model: User, as: 'user' },
      { model: BlockInstance, as: 'userTypeBlockInstance' },
    ],
  },
  {
    model: AppointmentFeeSummary,
    as: 'feeSummary',
    include: [{ model: AppointmentFeeEntry, as: 'feeEntries' }],
  },
  {
    model: AppointmentSelectionLine,
    as: 'selectionLines',
    separate: true,
  },
  {
    model: AppointmentTimeSlot,
    as: 'timeSlots',
    separate: true,
  },
]
