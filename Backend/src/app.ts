import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import mineRoutes from "./routes/mineRoutes";
import inspectionRoutes from "./routes/inspectionRoutes";
import violationRoutes from "./routes/violationRoutes";
import correctiveActionRoutes from "./routes/correctiveActionRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import userRoutes from "./routes/userRoutes";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.get("/api/health", (_request, response) => response.json({ status: "ok", service: "mineos-backend" }));
app.use("/api/auth", authRoutes);
app.use("/api/mines", mineRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/violations", violationRoutes);
app.use("/api/corrective-actions", correctiveActionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use(errorHandler);