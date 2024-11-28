interface Period{
  startTime: number;
  periodInterval: number;
  endTime: number;

  // setPeriodEndTime(slotStart, periodInterval) {
  //   let slotStart = '';
  //   let periodInterval = '';
  //   const endTime = slotStart + periodInterval;
  // }
}

class TimeFeeOver{
  rateOverBaseTime: number;
  rateOverBaseFee: number;
  
  constructor (
    rateOverBaseTime: number,
    rateOverBaseFee: number
  ) {
    this.rateOverBaseTime = rateOverBaseTime;
    this.rateOverBaseFee = rateOverBaseFee;
  }
}

class TimeFeeTotal extends TimeFeeOver {
  baseTime: number;
  baseFee: number;
  
  constructor (
    baseTime: number,
    rateOverBaseTime: number,
    baseFee: number,
    rateOverBaseFee: number
  ) {
    super(rateOverBaseTime, rateOverBaseFee)
    
    this.baseTime = baseTime;
    this.baseFee = baseFee;
  }
  
  // TODO: Create Overage Function
  timeTotal(): number {
    const appointmentOverage = 25
    const timeTotal = this.baseTime + (this.rateOverBaseTime * appointmentOverage) 
    return timeTotal;
  }
  
  feeTotal(): number {
    const appointmentOverage = 25
    const feeTotal = this.baseFee + (this.rateOverBaseFee * appointmentOverage)
    return feeTotal;
  }
  
}

class TimeBlock extends TimeFeeTotal{
  title: string;
  onSite: boolean;
  timePeriod?: Period;
  
  constructor (
    title: string,
    onSite: boolean,
    baseTime: number,
    rateOverBaseTime: number,
    baseFee: number,
    rateOverBaseFee: number,
    timePeriod: Period
  ) {
    super (baseTime, rateOverBaseTime, baseFee, rateOverBaseFee)
    
    this.title = title;
    this.onSite = onSite;
    this.timePeriod = timePeriod;
  }
}

class TimeContent {
  earlyArrival: TimeBlock;
  dataCollection: TimeBlock;
  reportWriting: TimeBlock;
  clientPresentation: TimeBlock;
  
  constructor (
    earlyArrival: TimeBlock,
    dataCollection: TimeBlock,
    reportWriting: TimeBlock,
    clientPresentation: TimeBlock
  ) {
    this.earlyArrival = earlyArrival;
    this.dataCollection = dataCollection;
    this.reportWriting = reportWriting;
    this.clientPresentation = clientPresentation;
  }
}
export { TimeContent, TimeBlock, TimeFeeTotal, Period }