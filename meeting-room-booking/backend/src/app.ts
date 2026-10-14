import express from "express";
import roomRoutes from "./routes/room.routes";
import bookingRoutes from "./routes/booking.routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

const app = express();

app.use(express.json());

app.use("/api", roomRoutes);
app.use("/api", bookingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
