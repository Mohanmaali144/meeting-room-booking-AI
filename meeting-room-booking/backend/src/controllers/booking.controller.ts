import type { Request, Response, NextFunction } from "express";
import { cancelBooking, createBooking, listBookings } from "../services/booking.service";
import { validateBookingsQuery, validateId, validateNewBooking } from "../validators/booking.validator";

export async function createBookingController(req: Request, res: Response, next: NextFunction) {
  try {
    const data = validateNewBooking(req.body);
    const booking = await createBooking(data);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

export async function getBookingsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { dayStart, roomId } = validateBookingsQuery(req.query);
    const bookings = await listBookings(dayStart, roomId);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function cancelBookingController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateId(req.params.id, "id");
    const booking = await cancelBooking(id);
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
}
