import { createError } from "../utils/create-error";
import { getDay } from "../utils/date";
import type { NewBooking } from "../types";

function throwValidationError(fields: any) {
  throw createError(400, "VALIDATION_ERROR", "Please check the data you entered.", { fields });
}

function isWholeNumber(value: any) {
  return Number.isInteger(value) && value >= 1;
}

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function isValidDateTime(value: any) {
  if (typeof value !== "string") {
    return false;
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*Z$/.test(value)) {
    return false;
  }
  return !isNaN(new Date(value).getTime());
}

function isValidDay(value: any) {
  if (typeof value !== "string") {
    return false;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(value + "T00:00:00Z");
  if (isNaN(date.getTime())) {
    return false;
  }
  return getDay(date) === value;
}

function isValidTime(value: any) {
  if (typeof value !== "string") {
    return false;
  }
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function validateNewBooking(body: any): NewBooking {
  const data = body || {};
  const errors: any = {};

  if (!isWholeNumber(data.roomId)) {
    errors.roomId = "Room is not valid.";
  }

  let title = "";
  if (typeof data.title === "string") {
    title = data.title.trim();
  }
  if (title.length < 1 || title.length > 100) {
    errors.title = "Title must be 1 to 100 characters.";
  }

  let email = "";
  if (typeof data.organizerEmail === "string") {
    email = data.organizerEmail.trim();
  }
  if (!isValidEmail(email)) {
    errors.organizerEmail = "Email is not valid.";
  }

  if (!isWholeNumber(data.attendees)) {
    errors.attendees = "Attendees must be 1 or more.";
  }

  if (!isValidDateTime(data.start)) {
    errors.start = "Start time is not valid.";
  }
  if (!isValidDateTime(data.end)) {
    errors.end = "End time is not valid.";
  }

  if (Object.keys(errors).length > 0) {
    throwValidationError(errors);
  }

  return {
    roomId: data.roomId,
    title: title,
    organizerEmail: email,
    attendees: data.attendees,
    start: new Date(data.start),
    end: new Date(data.end),
  };
}

export function validateId(value: any, name: string) {
  const id = Number(value);
  if (!isWholeNumber(id)) {
    throwValidationError({ [name]: "Invalid " + name + "." });
  }
  return id;
}

export function validateBookingsQuery(query: any) {
  if (!isValidDay(query.date)) {
    throwValidationError({ date: "Date is required (YYYY-MM-DD)." });
  }

  let roomId;
  if (query.roomId) {
    roomId = validateId(query.roomId, "roomId");
  }

  return { dayStart: new Date(query.date + "T00:00:00Z"), roomId: roomId };
}

export function validateAvailabilityQuery(query: any) {
  const errors: any = {};

  if (!isValidDay(query.date)) {
    errors.date = "Date is required (YYYY-MM-DD).";
  }
  if (!isValidTime(query.start)) {
    errors.start = "Start time is required (HH:mm).";
  }
  if (!isValidTime(query.end)) {
    errors.end = "End time is required (HH:mm).";
  }

  let minCapacity = 1;
  if (query.minCapacity) {
    minCapacity = Number(query.minCapacity);
  }
  if (!isWholeNumber(minCapacity)) {
    errors.minCapacity = "Minimum seats must be 1 or more.";
  }

  if (Object.keys(errors).length > 0) {
    throwValidationError(errors);
  }

  return {
    start: new Date(query.date + "T" + query.start + ":00Z"),
    end: new Date(query.date + "T" + query.end + ":00Z"),
    minCapacity: minCapacity,
  };
}
