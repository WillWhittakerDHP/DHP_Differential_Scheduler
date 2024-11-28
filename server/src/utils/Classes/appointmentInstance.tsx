import { TimeBlock, TimeFeeTotal, Period } from "./timeContentClasses";
import Participant from "./participantClasses";
import Property from "./propertyClasses";
import { Service, AdditionalService, AvailabilityOption } from "./schedulingClasses"

interface AppointmentInstance {
  user: Participant;
  participants: Participant[];
  property: Property;
  quoteOnly: boolean;
  differentialScheduling: boolean;
  service: Service;
  additionalServices?: AdditionalService[];
  availabilityOptions?: AvailabilityOption[];
  TimeBlocks: TimeBlock;
  TimeFeeTotal: TimeFeeTotal;
  timePeriods: Period[];
  earliestReportCompletionTime: number;
}

export default AppointmentInstance