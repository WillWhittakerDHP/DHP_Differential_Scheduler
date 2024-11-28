//Logic. Time Slotter will take a window of time in hours or minutes and then break them into 15 minute windows.
interface ClockTime {
  hours: number;
  minutes: number;  
}
interface TimeSlot {
  timeLeft: number;
  timeRight: number;  
}

class TimeSlots {
  lengthHours: number;
  initialTime: ClockTime;
  endTime?: ClockTime;
  constructor(lengthHours: number, startingTime : ClockTime, endTime?: ClockTime) {
    this.lengthHours = lengthHours;
    this.initialTime = startingTime;
    if(endTime){
      this.endTime = endTime;
    }    
  }


  // Helper Functions 
  // convertClockToTimeSlots() : number{
    
  // }
  public getAvailableTimeSlots(unavailableClockArray : ClockTime[]) : TimeSlot[]{
    const unavailableTimeSlotArray = this.convertClockArrayToTimeSlotArray(unavailableClockArray, this.getNumberOfSegments())
    let timeSlotArray = this.createTimeSlotsArray(this.getNumberOfSegments())
    let filteredTimeSlotArray  = timeSlotArray.filter(function(timeSlot) { 
      return unavailableTimeSlotArray .indexOf(timeSlot) < 0; // Returns true for items not found in unavailable.
    });
    return filteredTimeSlotArray;
  }

  private convertClockArrayToTimeSlotArray(clockTimeArray : ClockTime[], numberOfSegments : number){
    const TimeSlotArray : TimeSlot[] = []
    clockTimeArray.forEach((clock) => {
      const minutes = this.clockTimeToMinutes(clock);
      const timeSlot = this.convertMinutesToTimeSlot(minutes, numberOfSegments)
      if(timeSlot){
        TimeSlotArray.push(timeSlot)
      }      
    })
    return TimeSlotArray
  } 

  private convertMinutesToTimeSlot(minutes : number, totalNumSeg: number) : TimeSlot | null{
    const intervals : number[] = this.createIntervalArray(totalNumSeg);
    
    let theTimeSlot : TimeSlot = {timeLeft: 0, timeRight: 0 };
    for(let x = 1; x<intervals.length; x++){
      const intervalLeft = intervals[x-1];
      const intervalRight = intervals[x];
      if(intervalLeft < minutes && intervalRight > minutes){
        theTimeSlot = {timeLeft: intervals[x-1], timeRight: intervals[x]}
        return theTimeSlot;
      }
    }
    // No Time Slot exists return null.
    return null;
  }  
  // Basic Helper Functions
  // Basic Hours to minutes conversion
  private convertHoursToMinutes (minutes : number){
    return minutes*60;
  } 

  // These are the number of segements 
  private getNumberOfSegments () : number {
    return this.convertHoursToMinutes(this.lengthHours)/15
  }
  private createTimeSlotsArray(totalNumSeg : number) : TimeSlot[]{
    let timeSlots : TimeSlot[] = []
    for(let x = 0; x<totalNumSeg; x++){
      timeSlots.push({timeLeft: x*15, timeRight: (x+1)*15})
    }
    return timeSlots
  }

  private createIntervalArray(totalNumSeg : number) : number[]{
    let intervalArray : number[] = []
    for(let x = 0; x<=totalNumSeg; x++){
      intervalArray.push(x*15)
    }
    return intervalArray
  } 
  
  private clockTimeToMinutes(timeOnClock : ClockTime) : number{
    const differenceClockTime :  ClockTime =
    {hours: this.initialTime.hours-timeOnClock.hours, minutes: this.initialTime.minutes-timeOnClock.minutes}

    const minutes = this.convertHoursToMinutes(differenceClockTime.hours) - differenceClockTime.minutes
    return minutes;
  }
}

const timeSlots = new TimeSlots(15, {hours: 7, minutes: 0});

// getAvailableTimeSlots(unavailableClockArray : ClockTime[], numberOfSegments : number)
// console.log(`${JSON.stringify(timeSlots.createTimeSlotsArray(15*4))}`);




