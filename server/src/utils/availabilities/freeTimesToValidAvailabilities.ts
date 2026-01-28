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
 * PATTERN: Generate offsets dynamically from minuteIncrement, fallback to hard-coded mappings
 * P0-4: Added rule generation to support any minuteIncrement value
 */
export function mapPermissibleStarts(rule: string, minuteIncrement?: number): number[] {
  // P0-4: Generate offsets dynamically from minuteIncrement if provided
  // LEARNING: Derive permissible starts from minuteIncrement
  // WHY: Supports any minuteIncrement value (e.g., :60, :20) instead of hard-coded mappings
  // PATTERN: Generate offsets from 0 to 60 in increments of minuteIncrement
  if (minuteIncrement && minuteIncrement > 0 && minuteIncrement <= 60) {
    const offsets: number[] = []
    for (let offset = 0; offset < 60; offset += minuteIncrement) {
      offsets.push(offset)
    }
    return offsets
  }

  // Fallback to hard-coded mappings for backward compatibility
  const mapping: Record<string, number[]> = {
    "every :00": [0],
    "every :15": [0, 15, 30, 45],
    "every :30": [0, 30],
    "every :60": [0],
  };
  
  // P0-4: Default to [0] when unknown instead of empty array
  // LEARNING: Always return at least one permissible start
  // WHY: Prevents empty array from causing no slots to be produced
  // PATTERN: Return [0] as safe default for unknown rules
  return mapping[rule] || [0];
}

/**
 * Helper Function: Split Free Times into FreeBits
 * LEARNING: Splits free time periods into smaller increments based on minute increment and permissible starts
 * WHY: Creates granular time slots that can be combined to match appointment duration
 * PATTERN: Iterate through free times, align to permissible starts, create increment-sized slots
 * P1-5: Fixed to carry forward windows to subsequent hours when start minute is later than max permissible start
 */
export function splitFreeTimesToFreeBits(
  freeTimes: { start: Date; end: Date }[],
  minuteIncrement: number,
  permissibleStarts: number[]
): TimeSlot[] {
  const freeBits: TimeSlot[] = [];

  for (const { start, end } of freeTimes) {
    const startMinutes = start.getUTCMinutes();
    
    // P1-5: Find first permissible start >= current start minute, or carry forward to next hour
    // LEARNING: Align to next permissible start >= current start across the full window
    // WHY: Prevents dropping windows whose start minute is later than max permissible start in that hour
    //      (e.g., free window at 09:50 with :15 increments should align to 10:00, not be dropped)
    // PATTERN: Find first valid permissible start in current hour, or use first permissible start of next hour
    const alignedStarts = permissibleStarts.filter(
      (pStart) => pStart >= startMinutes
    );

    // If no aligned starts in current hour, start from next hour with first permissible start
    const startsToUse = alignedStarts.length > 0 
      ? alignedStarts 
      : permissibleStarts; // Use all permissible starts, will align to next hour below

    for (const permissibleStart of startsToUse) {
      let currentStart = new Date(start);
      
      // P1-5: Align to permissible start, handling carry-forward to next hour
      // LEARNING: If permissible start is less than start minutes, it's in the next hour
      // WHY: Ensures we don't miss windows that start mid-hour
      // PATTERN: Set minutes to permissible start, increment hour if needed
      if (permissibleStart >= startMinutes) {
        // Same hour: set minutes to permissible start
        currentStart.setUTCMinutes(permissibleStart, 0, 0);
      } else {
        // Next hour: increment hour and set to first permissible start
        currentStart.setUTCHours(currentStart.getUTCHours() + 1);
        currentStart.setUTCMinutes(permissibleStart, 0, 0);
      }

      // Only process if aligned start is still within the free time window
      if (currentStart >= start && currentStart < end) {
        while (isBefore(currentStart, end)) {
          const currentEnd = addMinutes(currentStart, minuteIncrement);
          if (isBefore(currentEnd, end) || currentEnd.getTime() === end.getTime()) {
            freeBits.push(new TimeSlot(minuteIncrement, currentStart, currentEnd));
          }
          currentStart = addMinutes(currentStart, minuteIncrement);
        }
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