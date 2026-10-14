import { createError } from "../utils/create-error";
import { getDay, getTime } from "../utils/date";
import type { Booking, Room } from "../types";

function isQuarterHour(date: Date) {
  if (date.getUTCMinutes() % 15 !== 0) {
    return false;
  }
  if (date.getUTCSeconds() !== 0) {
    return false;
  }
  if (date.getUTCMilliseconds() !== 0) {
    return false;
  }
  return true;
}

export function checkTimes(start: Date, end: Date) {
  if (end <= start) {
    throw createError(400, "INVALID_TIME_RANGE", "End time must be after start time.");
  }

  if (!isQuarterHour(start) || !isQuarterHour(end)) {
    throw createError(400, "INVALID_TIME_BOUNDARY", "Minutes must be 00, 15, 30 or 45.");
  }

  const totalMinutes = (end.getTime() - start.getTime()) / 60000;
  if (totalMinutes > 240) {
    throw createError(400, "INVALID_DURATION", "Booking cannot be more than 4 hours.");
  }

  if (getDay(start) !== getDay(end)) {
    throw createError(400, "OUTSIDE_BUSINESS_HOURS", "Booking must start and end on the same day.");
  }

  const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
  const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();
  if (startMinutes < 480 || endMinutes > 1200) {
    throw createError(400, "OUTSIDE_BUSINESS_HOURS", "Time must be between 08:00 and 20:00.");
  }
}

export function checkNotInPast(start: Date, now: Date) {
  if (start < now) {
    throw createError(400, "BOOKING_IN_PAST", "Start time cannot be in the past.");
  }
}

export function checkCapacity(attendees: number, room: Room) {
  if (attendees > room.capacity) {
    throw createError(400, "CAPACITY_EXCEEDED", `${room.name} can hold only ${room.capacity} people.`);
  }
}

export function findConflict(bookings: Booking[], roomId: number, start: Date, end: Date) {
  for (const booking of bookings) {
    if (booking.status === "confirmed" && booking.roomId === roomId) {
      if (booking.start < end && start < booking.end) {
        return booking;
      }
    }
  }
  return undefined;
}

export function checkConflict(bookings: Booking[], room: Room, start: Date, end: Date) {
  const conflict = findConflict(bookings, room.id, start, end);

  if (conflict) {
    const from = getTime(conflict.start);
    const to = getTime(conflict.end);
    throw createError(409, "BOOKING_CONFLICT", `${room.name} is already booked from ${from} to ${to}.`, {
      conflictingBookingId: conflict.id,
    });
  }
}

export function checkCanCancel(booking: Booking, now: Date) {
  if (booking.start <= now) {
    throw createError(409, "BOOKING_ALREADY_STARTED", "This booking has already started, so it cannot be cancelled.");
  }
}

export function checkDailyLimit(bookings: Booking[], organizerEmail: string, start: Date) {
  let count = 0;

  for (const booking of bookings) {
    const sameEmail = booking.organizerEmail.toLowerCase() === organizerEmail.toLowerCase();
    const sameDay = getDay(booking.start) === getDay(start);

    if (booking.status === "confirmed" && sameEmail && sameDay) {
      count = count + 1;
    }
  }

  if (count >= 3) {
    throw createError(409, "DAILY_LIMIT_EXCEEDED", "You can have only 3 bookings in one day.");
  }
}
