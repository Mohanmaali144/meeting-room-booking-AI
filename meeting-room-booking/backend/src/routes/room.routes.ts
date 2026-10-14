import { Router } from "express";
import { getAvailabilityController, getRoomsController } from "../controllers/room.controller";

const router = Router();

router.get("/rooms", getRoomsController);
router.get("/availability", getAvailabilityController);

export default router;
