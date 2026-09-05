import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import mineRoutes from "./routes/mineRoutes";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.get("/api/health", (_request, response) => response.json({ status: "ok", service: "mineos-backend" }));
app.use("/api/auth", authRoutes);
app.use("/api/mines", mineRoutes);
app.use(errorHandler);