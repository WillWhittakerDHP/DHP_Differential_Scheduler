//Logic. Time Slotter will take a window of time in hours or minutes and then break them into 15 minute windows.
// Limitations:
// I built this class assuming everything will lie within a 24 hour clock. The code doesn't stop you from going over 24 hours and I don't know how that will translate to Javascript Date object. But, you will still get 15 minute time intervals and appropriate (although strange) over 24 hour times. 

// Clock Time represent a 24 hour clock.
interface ClockTime {
  hours: number;
  minutes: number;  
}

// This interface holds all the information needed for a 15 minute Interval. 15 minute intervals is the timeSlot.
interface TimeSlot {
  timeLeft: number;
  timeRight: number;  
}


// Time Period is two ClockTimes (24 hour clock). One representing the start and the other the finish.
// Availability is an unused option on time period. It does nothing as of right now.
interface TimePeriod{
  start : ClockTime
  end : ClockTime
  availability? : boolean
}

// Date Period is using Javascript Date object. It is the same as TimePeriod just with extra information that Date object gives.
// Availability is unused just like in TimePeriod. It does nothing as of right now. 
interface DatePeriod{
  start : Date
  end : Date
  availability? : boolean
}

// The Time Slots class holds all the information and methods needed to get a functional Date -> time period and output 15 minute time intervals between time periods
export class TimeSlots {
  // Total Schedule is just the default Time period. It represents the entire window of time which this instance of the class will cover. This happens once. So after the instance of the class is completed, there is no logic to add back available times. Only to take away. 
  totalSchedule : TimePeriod 
  // Occupied Times to handle by the markTimePeriodBusy function. That function both pushes to the occupiedTime[] and changes the availableTimes to match. Other than being pushed towards, occupiedTimes is read in a single function (the validateTimePeriodCanBeMarked function) which is used to see if a time period is already marked.
  occupiedTimes : TimePeriod[]
  // Available Times holds all the Time Period which have not been marked by the markTimePeriodBusy function. It is used to get the available times and also change them.
  availableTimes : TimePeriod[]
  //timeChunkSize : number unimplemented. But theoretically, this code can be refactored to allow a variable time chunk instead of just 15 minutes. 

  //The constructor requires only the total time period -> Start ClockTime and End ClockTime.
  constructor(totalSchedule : TimePeriod) {
    this.totalSchedule = totalSchedule

    // Occupied Times Starts Empty
    this.occupiedTimes = []
    
    //AvailableTimes is immediately populated with the entire time window. 
    this.availableTimes = [totalSchedule]
  }


  
  // This function isn't used in this class. But it may be helpful to change timeSlots to array of Dates[]. This is placed in a DatePeriod interface to allow for easy access to the start/end of the 15 minute intervals.
  public convertTimeSlotsToDate(slots : TimeSlot[], year : number, monthIndex : number, monthDay : number) : DatePeriod[]{
    const dates : DatePeriod[] = []
    const dater : Date = new Date()
    dater.setFullYear(year)
    dater.setMonth(monthIndex)
    dater.setDate(monthDay);
    slots.forEach((slot) =>{
      const start = this.convertMinutesToClockTime(slot.timeLeft)
      const end = this.convertMinutesToClockTime(slot.timeRight)
      dates.push({
        start : new Date(year, monthIndex, monthDay, start.hours, start.minutes),
        end : new Date(year, monthIndex, monthDay, end.hours, end.minutes)
      })
    })

    return dates
  }

  // This function outputs the 15 minute time intervals (TimeSlot[]) inside of the availableTimes object. 
  public getAvailableTimeSlots() : TimeSlot[]{
    let availability : TimeSlot[] = []
    this.availableTimes.forEach((period) =>{
      availability = availability.concat((this.convertTimePeriodToTimeSlots(period)))
    })      
    return availability; 
  }

  // This is the function which changes availability. With a TimePeriod inputted, this function validates there is no overlapping busyness and then pushes the input into occupiedTimes and changes availableTimes property of the TimeSlots class. 
  // !! Right now this function does nothing when it detects an overlap. This may not be desired.
  public markTimePeriodBusy(period : TimePeriod){
    if(!this.validateTimePeriodCanBeMarked(period)){
      // do nothing validation failed
      console.log("Validation failed! Overlapping times")
    }else{
      this.occupiedTimes.push(period)
      this.changeAvailabilityArray(period)
    }
  }

  // This function accepts an occupied time period and then checks which collisions it has with the AvailableTimes property of the class. If there is no collision this function does nothing. If there is one, this function modifies availableTimes so it excludes all times in the occupiedPeriod. 
  public changeAvailabilityArray(occupiedPeriod : TimePeriod){
    let insertedTimePeriod : TimePeriod[] = []
    this.availableTimes.forEach((availPeriod) =>{
      if(this.doesTimePeriodsOverlap(availPeriod,occupiedPeriod)){
        const startAvail : number = this.clockTimeToMinutes(availPeriod.start)
        const endAvail : number = this.clockTimeToMinutes(availPeriod.end)
        const startInput : number = this.clockTimeToMinutes(occupiedPeriod.start)
        const endInput : number = this.clockTimeToMinutes(occupiedPeriod.end)
        
        if (startAvail < startInput) {
          insertedTimePeriod.push({start : this.convertMinutesToClockTime(startAvail), end: this.convertMinutesToClockTime(startInput)})
        }
        
        if (endInput  < endAvail) {
          insertedTimePeriod.push({start : this.convertMinutesToClockTime(endInput), end: this.convertMinutesToClockTime(endAvail)})
        }
        let newAvailability : TimePeriod[] = this.availableTimes.filter((period) => {
          if(!(period.start === availPeriod.start && period.end === availPeriod.end)){
            return true
          }
          else{
            return false; 
          }         
        });
        if(newAvailability.length === 0){
          newAvailability = insertedTimePeriod;
        }
        else{
          let insertedFlag = false;      
          for(let x = 0; x<newAvailability.length; x++){
            if(newAvailability[x].start.hours > insertedTimePeriod[0].end.hours){
              // Insert the array!
              newAvailability.splice(x, 0, ...insertedTimePeriod);
              insertedFlag = true
              break;
            }
          }
          if(!insertedFlag){
            newAvailability.splice(newAvailability.length, 0, ...insertedTimePeriod);
          }       
        }
        // Update the array on the class.
        this.availableTimes = newAvailability;
      }
    })
    
  } 

  // Helper Functions 
  // This returns the same clock time but rounded up to the nearness 15 minute interval
  private roundUpTo15Mark(time : ClockTime) : ClockTime{
    const minutes : number = this.clockTimeToMinutes(time)
    // Minutes not going over 60
    const hourMinutes : number = minutes- Math.floor(minutes/60)*60
    const remainder : number = hourMinutes%15
    let newTime : ClockTime
    let roundedUp : number;
    if(remainder === 0){
      roundedUp = hourMinutes
    }else{
      roundedUp = hourMinutes + 15 - remainder
    }
    if(roundedUp >= 60){
      newTime = {hours : Math.floor(minutes/60) + 1, minutes : 0} 
    }else{
      newTime = {hours : Math.floor(minutes/60), minutes : roundedUp} 
    }
    return newTime;    
  }

  // This is a basic function which converts minutes to hours.
  private convertHoursToMinutes (minutes : number){
    return minutes*60;
  } 

  // This converts a Time Period (Start - End) into a TimeSlot[] which is the 15 minute intervals from start to end. This function does not go over the time period's end point even if it isn't a multiple of 15 minutes.
  public convertTimePeriodToTimeSlots(period : TimePeriod) : TimeSlot[]{
    let timeSlots : TimeSlot[] = []
    const start : ClockTime = this.roundUpTo15Mark(period.start)
    const end : ClockTime = this.roundUpTo15Mark(period.end)
    const differenceClockTime :  ClockTime =
    {hours: Math.abs(end.hours-start.hours), minutes: Math.abs(end.minutes-start.minutes)}
    // Hardcoded, Four 15 minute chunks in an hour
    const numSeg = differenceClockTime.hours*4 + differenceClockTime.minutes/15
    for(let x = 0; x<=numSeg; x++){
      // If statement to ensure a time slot does not go over the time period's end.
      if((x+1)*15 + start.hours*60 <= end.hours*60 + end.minutes){
        timeSlots.push({timeLeft: x*15 + start.hours*60, timeRight: (x+1)*15 + start.hours*60})
      }      
    }
    return timeSlots
  }

  // This is a simple function that converts minutes to clock time. It is easier just to deal with minutes during calculations instead of hours and minutes. This function changes it back to hours and minutes
  public convertMinutesToClockTime(minutes : number) : ClockTime{
    return {hours : Math.floor(minutes/60), minutes : minutes%60} 
  }

  // This function sees if there is overlap in the input period and the occupiedTimes property of the class.
  public validateTimePeriodCanBeMarked(period :TimePeriod) : boolean{
    let validator = true;
    this.occupiedTimes.forEach((occPeriod) => {
      if(this.doesTimePeriodsOverlap(occPeriod, period)){
        validator = false // Collision detected
      }
    })
    return validator;
  }

  // This is a simple function which takes two ranges and see if they overlap. 
  public doesTimePeriodsOverlap(period1 : TimePeriod, period2 : TimePeriod) : boolean{
    // There's a -1 here because they do not overlap if they collide at the edges.
    const x1 = this.clockTimeToMinutes(period1.start)+1
    const x2 = this.clockTimeToMinutes(period1.end)-1

    const y1 = this.clockTimeToMinutes(period2.start)
    const y2 = this.clockTimeToMinutes(period2.end)

    // Now check if any of the starts or ends are inside start-end for each other. These are just ranges.
    return Math.max(x1,y1) <= Math.min(x2,y2)
  } 
  
  // This is a simple function that converts hours and minutes to just minutes as it is easier to deal with minutes during calculations instead of hours and minutes.
  protected clockTimeToMinutes(timeOnClock : ClockTime) : number{
    const minutes = this.convertHoursToMinutes(timeOnClock.hours) + timeOnClock.minutes
    return minutes;
  }
}

// This is an unused, untested function. It is meant to convert javascript Date object into hours and minutes (ClockTime). But I don't know if it works. 
export const convertJDateToClockTime = function(date: Date){
  const clockTime : ClockTime = {
    hours : date.getHours(),
    minutes : date.getMinutes()
  }
  return clockTime
}



// The comments below were used to test the class. 

// const testStart = {hours: 7, minutes: 10}
// const testEnd = {hours: 21, minutes: 5}
// const testSchedule = {start : testStart, end : testEnd}

// const timeSlots = new TimeSlots(testSchedule,);

// const testPeriod1 = {start : {hours: 10, minutes: 0}, end : {hours: 13, minutes: 0}}
// const testPeriod2 = {start : {hours: 15, minutes: 0}, end : {hours: 20, minutes: 0}}
// const testPeriod3 = {start : {hours: 8, minutes: 0}, end : {hours: 9, minutes: 0}}
// console.log(`Before Marking: ${JSON.stringify(timeSlots.availableTimes)}`);

// timeSlots.markTimePeriodBusy(testPeriod1)
// timeSlots.markTimePeriodBusy(testPeriod2)
// timeSlots.markTimePeriodBusy(testPeriod3)

// console.log(`After Marking: ${JSON.stringify(timeSlots.availableTimes)}`);


// console.log(`The Time Slots: ${JSON.stringify(timeSlots.getAvailableTimeSlots())}`);
// let dates : DatePeriod[] = []
// dates = timeSlots.convertTimeSlotsToDate(timeSlots.getAvailableTimeSlots(), 2024, 11, 1)
// dates.forEach((date)=>{
//   console.log(`Here's the date: ${date.start} and ${date.end}`)
// })






