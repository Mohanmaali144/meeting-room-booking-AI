import type { Request, Response, NextFunction } from "express";
import { getAllRooms } from "../services/room.service";
import { findAvailableRooms } from "../services/booking.service";
import { validateAvailabilityQuery } from "../validators/booking.validator";

export async function getRoomsController(req: Request, res: Response, next: NextFunction) {
  try {
    const rooms = await getAllRooms();
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
}

export async function getAvailabilityController(req: Request, res: Response, next: NextFunction) {
  try {
    const { start, end, minCapacity } = validateAvailabilityQuery(req.query);
    const rooms = await findAvailableRooms(start, end, minCapacity);
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
}
