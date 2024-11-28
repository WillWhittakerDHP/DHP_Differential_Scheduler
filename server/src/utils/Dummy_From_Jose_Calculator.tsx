// // import {useCallback, useEffect, useState} from "react";
// // import add from 'date-fns/add';
// // import isWithinInterval from 'date-fns/isWithinInterval';
// // import format from "date-fns/format";
// // import sub from 'date-fns/sub';
// // import getTimeSlots from "../utils/getTimeSlots";


// useEffect(() => {
//   const {appointmentParts} = ServiceTypes[serviceType];
//   const isClientPresent = appointmentParts.includes(PartTypes.CLIENT_PRESENTATION);
//   setIsClientPresent(isClientPresent);
// }, [serviceType])

// const getSlotPart = (dwellingSize, partType, serviceType) => {
//   const { baseTime, baseSqft, workRate } = PartTypeMap[partType][serviceType];
//   const { minutes: baseTimeMinutes } = baseTime;
//   const overBaseDwellingSize = Number(dwellingSize) < baseSqft ? 0 : dwellingSize - baseSqft;
//   const overBaseMinutes = overBaseDwellingSize * workRate;
//   const overBaseMinutesRounded = Math.ceil(overBaseMinutes / defaultIncrement) * defaultIncrement;
//   const slotPartTime = baseTimeMinutes + overBaseMinutesRounded;
  
//   return slotPartTime;
// }
// useEffect(() => {
//   const {appointmentParts} = ServiceTypes[serviceType];
//   const onsiteLength = appointmentParts.reduce((acc, partType) => {
    
//     const slotPart = getSlotPart(dwellingSize, partType, serviceType);
//     acc.defaultAppointmentLength.minutes += slotPart;
//     acc[`${partType}Length`] = {minutes: slotPart};
    
//     return acc;
//   }, {defaultAppointmentLength: {minutes: 0}})
//   setAppointmentDetails(onsiteLength);
  
// }, [serviceType, dwellingSize]);

// useEffect(() => {
//   setTimeSlots(getTimeSlots(day, {
//     startTime: [7, 0],
//     endTime: [21, 0],
//     appointmentDetails
//   }))
// }, [day, appointmentDetails]);


// const getLabel = date => format(date, 'h:mmaaa');

// const defaultInterval = 15;
// const defaultIncrement = 30;
// const defaultAppointmentLength = 120;

// const getSlot = (date, {defaultInterval, defaultAppointmentLength}) => {
//   if (!defaultAppointmentLength) {
//     return {}
//   }
  
//   const newStart = defaultInterval
//   ? add(new Date(date.getTime()), {minutes: defaultInterval})
//   : date;
  
//   const start = new Date(newStart.getTime());
//   const end = add(new Date(newStart.getTime()), defaultAppointmentLength);
  
//   return {
//     start,
//     startLabel: getLabel(start),
//     end,
//     endLabel: getLabel(end)
//   }
// }

// const getClientSlot = (currentSlot, appointmentDetails) => {
//   const { clientPresentationLength, dataCollectionLength, reportWritingLength } = appointmentDetails;
  
//   return getSlot(currentSlot.start, {
//     defaultInterval: dataCollectionLength.minutes + reportWritingLength.minutes,
//     defaultAppointmentLength: clientPresentationLength
//   });
// }

// const isWithinWorkingHours = (slot, dayInterval) => {
//   return isWithinInterval(slot.end, dayInterval);
// }

// const isAvailableSlot = (candidateAppointment, appointmentIntervals = []) => {
//   return !appointmentIntervals.some(appointmentInterval => {
//     const { start, end } = appointmentInterval;
//     const paddedStart = sub(start, { minutes: 30 });
//     const paddedEnd = add(end, { minutes: 30 });
    
//     return isWithinInterval(candidateAppointment.start, { start: paddedStart, end: paddedEnd }) ||
//     isWithinInterval(candidateAppointment.end, { start: paddedStart, end: paddedEnd });
//   })
// }

// const getMockAppointment = (date, startHour) => {
//   return {
//     start: add(new Date(date.getTime()), {hours: startHour}),
//     end: add(new Date(date.getTime()), {hours: startHour + 2})
//   }
// }

// const getMockAppointmentIntervals = date => {
//   return [
//     getMockAppointment(date, 14)
//   ]
// }


// const getTimeSlots = (date, {startTime, endTime, appointmentDetails}) => {
  
//   if (!date) {
//     return [];
//   }
  
//   const mockAppointments = getMockAppointmentIntervals(date);
  
//   const { defaultAppointmentLength } = appointmentDetails;
//   const [startingHours, startingMinutes] = startTime;
//   const [endHours, endMinutes] = endTime;
  
//   const dayInterval = {
//     start: add(new Date(date.getTime()), {hours: startingHours, minutes: startingMinutes}),
//     end: add(new Date(date.getTime()), {hours: endHours, minutes: endMinutes + 1})
//   }
  
//   const timeSlots = [];
//   let inspectorAppointment = getSlot(dayInterval.start, { defaultAppointmentLength });
  
//   while (isWithinWorkingHours(inspectorAppointment, dayInterval)) {
//     if (isAvailableSlot(inspectorAppointment, mockAppointments)) {
//       timeSlots.push({
//         inspectorAppointment,
//         clientAppointment: getClientSlot(inspectorAppointment, appointmentDetails)
//       });
//     }
    
//     inspectorAppointment = getSlot(inspectorAppointment.start, {
//       defaultInterval: defaultIncrement,
//       defaultAppointmentLength: defaultAppointmentLength
//     });
//     }
    
//     return timeSlots;
//   }
  
// const useAppointment = () => {

// // Service Selection
// const [user, setUser] = useState(UserTypes.BUYER);
// const [serviceType, setServiceType] = useState(ServiceTypeNames.BUYERS_INSPECTION);
// const [additionalServices, setAdditionalServices] = useState([]);
// const [isClientPresent, setIsClientPresent] = useState(true);

// // Property Details
// const [dwellingType, setDwellingType] = useState(DwellingType.CONDO);

//   // Schedule
//   const [inspectorTimeSlot, setInspectorTimeSlot] = useState('');
//   const [clientTimeSlot, setClientTimeSlot] = useState('');
//   const [day, setDay] = useState('');
//   const [minimizeInspectionTime, setMinimizeInspectionTime] = useState(false);
//   const [additionalPresentationTime, setAdditionalPresentationTime] = useState(false);
  
//   const [selectedTimeSlotPair, setSelectedTimeSlotPair] = useState();
//   const [timeSlots, setTimeSlots] = useState([]);
//   const [appointmentDetails, setAppointmentDetails] = useState({
//     dataCollectionLength: {minutes: 0},

//     defaultAppointmentLength: {minutes: 120}
//   })
  
  
//   const getInspectorTimeSlot = useCallback(inspectorTimeStart => {
//     return timeSlots.find(({inspectorAppointment}) => inspectorAppointment.startLabel === inspectorTimeStart);
//   }, [timeSlots]);
  
//   const getClientTimeSlot = useCallback(clientTimeStart => {
//     return timeSlots.find(({clientAppointment}) => clientAppointment.startLabel === clientTimeStart);
//   }, [timeSlots]);
  
//   const setTimeSlot = useCallback(({inspectorStart, clientStart}) => {
//     const timeSlotPair = inspectorStart
//     ? getInspectorTimeSlot(inspectorStart)
//     : getClientTimeSlot(clientStart)
    
//     setSelectedTimeSlotPair(timeSlotPair);
//     setInspectorTimeSlot(timeSlotPair.inspectorAppointment.startLabel)
//     setClientTimeSlot(timeSlotPair.clientAppointment.startLabel);
//   }, [inspectorTimeSlot, clientTimeSlot, timeSlots]);
  
//   const resetTimeSlot = () => {
//     setSelectedTimeSlotPair(null);
//     setInspectorTimeSlot('');
//     setClientTimeSlot('');
//   }
// }
    
// const PartTypes = {
//   DATA_COLLECTION: 'dataCollection',
// }
    
// const ServiceTypeNames = {
//   BUYERS_INSPECTION: 'buyersInspection',
// }
    
// const ServiceTypes = {
//   [ServiceTypeNames.BUYERS_INSPECTION]: {
//     title: 'Buyer\'s Inspection',
//     description: 'I am under contract on a home, and I need someone to inspect the property, test all of the equipment, and recommend repairs',
//     appointmentParts: [
//       PartTypes.DATA_COLLECTION,
//     ]
//   }
// }

// const UserTypeMap = {
//   [UserTypes.BUYER]: [
//     ServiceTypeNames.BUYERS_INSPECTION,
//   ]
// }
// const PartTypeMap = {
//   [PartTypes.DATA_COLLECTION]: {
//     [ServiceTypeNames.BUYERS_INSPECTION]: {
//       baseTime: {minutes: 30},
//       baseSqft: 750,
//       workRate: 0.06
//     }
//   }
// }