import { TimeContent, TimeBlock } from "./timeContentClasses";

class UIDescription {
  buyer: string;
  agent: string;
  owner: string;

  constructor (
    buyer: string,
    agent: string,
    owner: string 
  ) {
    this.buyer = buyer;
    this.agent = agent;
    this.owner = owner;
    }
}

class DwellingType extends TimeContent {
  title: string;
  canBeScheduled: boolean;
  description: UIDescription;
  differentialScheduling: boolean;

  constructor (
    title: string,
    canBeScheduled: boolean,
    description: UIDescription,
    differentialScheduling: boolean,
    earlyArrival: TimeBlock,
    dataCollection: TimeBlock,
    reportWriting: TimeBlock,
    clientPresentation: TimeBlock
  ) {
    super(earlyArrival, dataCollection, reportWriting, clientPresentation)

    this.title = title;
    this.canBeScheduled = canBeScheduled;
    this.description = description;
    this.differentialScheduling = differentialScheduling;
  }
}

class Service extends TimeContent {
  title: string;
  canBeScheduled: boolean;
  description: UIDescription;
  differentialScheduling: boolean;

  constructor (
    title: string,
    canBeScheduled: boolean,
    description: UIDescription,
    differentialScheduling: boolean,
    earlyArrival: TimeBlock,
    dataCollection: TimeBlock,
    reportWriting: TimeBlock,
    clientPresentation: TimeBlock
  ) {
    super(earlyArrival, dataCollection, reportWriting, clientPresentation)
    this.title = title;
    this.canBeScheduled = canBeScheduled;
    this.description = description;
    this.differentialScheduling = differentialScheduling;
  }
}

class AdditionalService extends TimeContent {
  title: string;
  canBeScheduled: boolean;
  description: UIDescription;
  differentialScheduling: boolean;

  constructor (
    title: string,
    canBeScheduled: boolean,
    description: UIDescription,
    differentialScheduling: boolean,
    earlyArrival: TimeBlock,
    dataCollection: TimeBlock,
    reportWriting: TimeBlock,
    clientPresentation: TimeBlock
  ) {
    super(earlyArrival, dataCollection, reportWriting, clientPresentation)
    this.title = title;
    this.canBeScheduled = canBeScheduled;
    this.description = description;
    this.differentialScheduling = differentialScheduling;
  }
}

class AvailabilityOption extends TimeContent {
  title: string;
  canBeScheduled: boolean;
  description: UIDescription;
  differentialScheduling: boolean;
  differentialOverride: boolean;

  constructor (
    title: string,
    canBeScheduled: boolean,
    description: UIDescription,
    differentialScheduling: boolean,
    differentialOverride: boolean,
    earlyArrival: TimeBlock,
    dataCollection: TimeBlock,
    reportWriting: TimeBlock,
    clientPresentation: TimeBlock
  ) {
    super(earlyArrival, dataCollection, reportWriting, clientPresentation)

    this.title = title;
    this.canBeScheduled = canBeScheduled;
    this.description = description;
    this.differentialScheduling = differentialScheduling;
    this.differentialOverride = differentialOverride;
  }
}

export { UIDescription, DwellingType, Service, AdditionalService, AvailabilityOption }