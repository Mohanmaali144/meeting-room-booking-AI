import type { PoolClient } from "pg";
import { pool } from "../config/db";
import { createError } from "../utils/create-error";
import { getDay, getDayStart, getNextDayStart } from "../utils/date";
import { getAllRooms, getRoomById } from "./room.service";
import {
  checkCanCancel,
  checkCapacity,
  checkConflict,
  checkDailyLimit,
  checkNotInPast,
  checkTimes,
  findConflict,
} from "./booking-rules";
import type { Booking, NewBooking } from "../types";

function toBooking(row: any): Booking {
  return {
    id: row.id,
    roomId: row.room_id,
    title: row.title,
    organizerEmail: row.organizer_email,
    attendees: row.attendees,
    start: row.start_time,
    end: row.end_time,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function getConfirmedBookingsBetween(from: Date, to: Date, roomId?: number) {
  let result;

  if (roomId) {
    result = await pool.query(
      "SELECT * FROM bookings WHERE status = 'confirmed' AND start_time >= $1 AND start_time < $2 AND room_id = $3 ORDER BY start_time",
      [from, to, roomId]
    );
  } else {
    result = await pool.query(
      "SELECT * FROM bookings WHERE status = 'confirmed' AND start_time >= $1 AND start_time < $2 ORDER BY start_time",
      [from, to]
    );
  }

  return result.rows.map(toBooking);
}

async function lockOrganizerDay(client: PoolClient, email: string, day: string) {
  const lockName = "organizer|" + email.toLowerCase() + "|" + day;
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [lockName]);
}

async function lockRoom(client: PoolClient, roomId: number) {
  const lockName = "room|" + roomId;
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [lockName]);
}

async function getOrganizerBookings(client: PoolClient, email: string, from: Date, to: Date) {
  const result = await client.query(
    "SELECT * FROM bookings WHERE status = 'confirmed' AND lower(organizer_email) = lower($1) AND start_time >= $2 AND start_time < $3",
    [email, from, to]
  );
  return result.rows.map(toBooking);
}

async function getOverlappingBookings(client: PoolClient, roomId: number, start: Date, end: Date) {
  const result = await client.query(
    "SELECT * FROM bookings WHERE status = 'confirmed' AND room_id = $1 AND start_time < $3 AND end_time > $2",
    [roomId, start, end]
  );
  return result.rows.map(toBooking);
}

async function insertBooking(client: PoolClient, data: NewBooking) {
  const result = await client.query(
    "INSERT INTO bookings (room_id, title, organizer_email, attendees, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [data.roomId, data.title, data.organizerEmail, data.attendees, data.start, data.end]
  );
  return toBooking(result.rows[0]);
}

export async function createBooking(data: NewBooking) {
  checkTimes(data.start, data.end);
  checkNotInPast(data.start, new Date());

  const room = await getRoomById(data.roomId);
  if (!room) {
    throw createError(404, "ROOM_NOT_FOUND", `Room ${data.roomId} not found.`);
  }
  checkCapacity(data.attendees, room);

  const day = getDay(data.start);
  const dayStart = getDayStart(data.start);
  const nextDayStart = getNextDayStart(data.start);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await lockOrganizerDay(client, data.organizerEmail, day);
    await lockRoom(client, room.id);

    const organizerBookings = await getOrganizerBookings(client, data.organizerEmail, dayStart, nextDayStart);
    checkDailyLimit(organizerBookings, data.organizerEmail, data.start);

    const roomBookings = await getOverlappingBookings(client, room.id, data.start, data.end);
    checkConflict(roomBookings, room, data.start, data.end);

    const booking = await insertBooking(client, data);
    await client.query("COMMIT");
    return booking;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listBookings(dayStart: Date, roomId?: number) {
  if (roomId) {
    const room = await getRoomById(roomId);
    if (!room) {
      throw createError(404, "ROOM_NOT_FOUND", `Room ${roomId} not found.`);
    }
  }

  const nextDayStart = getNextDayStart(dayStart);
  return getConfirmedBookingsBetween(dayStart, nextDayStart, roomId);
}

export async function cancelBooking(id: number) {
  const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    throw createError(404, "BOOKING_NOT_FOUND", `Booking ${id} not found.`);
  }

  const booking = toBooking(result.rows[0]);
  if (booking.status === "cancelled") {
    return booking;
  }

  checkCanCancel(booking, new Date());

  const updated = await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *", [id]);
  return toBooking(updated.rows[0]);
}

export async function findAvailableRooms(start: Date, end: Date, minCapacity: number) {
  checkTimes(start, end);

  const bookings = await getConfirmedBookingsBetween(getDayStart(start), getNextDayStart(start));
  const rooms = await getAllRooms();

  const freeRooms = [];
  for (const room of rooms) {
    const bigEnough = room.capacity >= minCapacity;
    const isFree = !findConflict(bookings, room.id, start, end);

    if (bigEnough && isFree) {
      freeRooms.push(room);
    }
  }
  return freeRooms;
}
