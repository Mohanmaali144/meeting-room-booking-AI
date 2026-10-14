import { Router } from "express";
import {
  cancelBookingController,
  createBookingController,
  getBookingsController,
} from "../controllers/booking.controller";

const router = Router();

router.get("/bookings", getBookingsController);
router.post("/bookings", createBookingController);
router.delete("/bookings/:id", cancelBookingController);

export default router;
