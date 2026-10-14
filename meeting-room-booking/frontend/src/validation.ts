import type { BookingFormData, Room } from "./types";

function toMinutes(time: string) {
  const parts = time.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

export function getTimeError(date: string, start: string, end: string) {
  if (!date || !start || !end) {
    return "Please choose date, start time and end time.";
  }

  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);

  if (startMinutes % 15 !== 0 || endMinutes % 15 !== 0) {
    return "Minutes must be 00, 15, 30 or 45.";
  }
  if (endMinutes <= startMinutes) {
    return "End time must be after start time.";
  }
  if (endMinutes - startMinutes > 240) {
    return "Booking cannot be more than 4 hours.";
  }
  if (startMinutes < 8 * 60 || endMinutes > 20 * 60) {
    return "Time must be between 08:00 and 20:00.";
  }
  return "";
}

export function validateBookingForm(form: BookingFormData, rooms: Room[]) {
  const errors: any = {};

  const room = rooms.find((item) => String(item.id) === form.roomId);
  if (!room) {
    errors.roomId = "Please select a room.";
  }

  const title = form.title.trim();
  if (title === "") {
    errors.title = "Please enter a title.";
  } else if (title.length > 100) {
    errors.title = "Title is too long.";
  }

  if (!/^\S+@\S+\.\S+$/.test(form.organizerEmail.trim())) {
    errors.organizerEmail = "Please enter a valid email.";
  }

  const attendees = Number(form.attendees);
  if (!Number.isInteger(attendees) || attendees < 1) {
    errors.attendees = "Attendees must be 1 or more.";
  } else if (room && attendees > room.capacity) {
    errors.attendees = `${room.name} can hold only ${room.capacity} people.`;
  }

  const timeError = getTimeError(form.date, form.start, form.end);
  if (timeError) {
    errors.time = timeError;
  } else if (new Date(`${form.date}T${form.start}:00Z`) < new Date()) {
    errors.time = "Start time cannot be in the past.";
  }

  return errors;
}
