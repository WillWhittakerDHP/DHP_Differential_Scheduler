import { addMinutes, isBefore } from "date-fns";

/**
 * Class Definitions
 * LEARNING: TimeSlot class represents a time slot with duration
 * WHY: Encapsulates time slot data with start, end, and duration
 * PATTERN: Class-based data structure for time slots
 */
export class TimeSlot {
  constructor(
    public duration: number, 
    public slotStart: Date, 
    public slotEnd: Date
  ) {}
}

/**
 * Helper Function: Map Permissible Starts
 * LEARNING: Maps admin-defined rules to minute offsets for time slot starts
 * WHY: Ensures appointments start at specific times (e.g., every 15 minutes)
 * PATTERN: String-based rule mapping to minute arrays
 */
export function mapPermissibleStarts(rule: string): number[] {
  const mapping: Record<string, number[]> = {
    "every :00": [0],
    "every :15": [0, 15, 30, 45],
    "every :30": [0, 30],
  };
  return mapping[rule] || [];
}

/**
 * Helper Function: Split Free Times into FreeBits
 * LEARNING: Splits free time periods into smaller increments based on minute increment and permissible starts
 * WHY: Creates granular time slots that can be combined to match appointment duration
 * PATTERN: Iterate through free times, align to permissible starts, create increment-sized slots
 */
export function splitFreeTimesToFreeBits(
  freeTimes: { start: Date; end: Date }[],
  minuteIncrement: number,
  permissibleStarts: number[]
): TimeSlot[] {
  const freeBits: TimeSlot[] = [];

  for (const { start, end } of freeTimes) {
    const startMinutes = start.getUTCMinutes();
    const alignedStarts = permissibleStarts.filter(
      (pStart) => pStart >= startMinutes
    );

    for (const permissibleStart of alignedStarts) {
      let currentStart = new Date(start);
      currentStart.setUTCMinutes(permissibleStart, 0, 0);

      while (isBefore(currentStart, end)) {
        const currentEnd = addMinutes(currentStart, minuteIncrement);
        if (isBefore(currentEnd, end) || currentEnd.getTime() === end.getTime()) {
          freeBits.push(new TimeSlot(minuteIncrement, currentStart, currentEnd));
        }
        currentStart = addMinutes(currentStart, minuteIncrement);
      }
    }
  }

  return freeBits;
}

/**
 * Helper Function: Find Availabilities
 * LEARNING: Combines contiguous free bits into time slots that meet minimum duration requirement
 * WHY: Creates valid appointment time slots from smaller time increments
 * PATTERN: Sliding window approach - accumulate bits until duration requirement is met
 */
export function findAvailabilities(freeBits: TimeSlot[], duration: number): TimeSlot[] {
  const availabilities: TimeSlot[] = [];
  let contiguousBits: TimeSlot[] = [];

  for (const bit of freeBits) {
    contiguousBits.push(bit);

    const totalDuration = contiguousBits.reduce((sum, slot) => sum + slot.duration, 0);

    if (totalDuration >= duration) {
      availabilities.push(
        new TimeSlot(
          totalDuration,
          contiguousBits[0].slotStart,
          contiguousBits[contiguousBits.length - 1].slotEnd
        )
      );

      contiguousBits.shift(); // Move to the next potential start
    }
  }

  return availabilities;
}