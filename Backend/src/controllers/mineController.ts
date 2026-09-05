import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Mine } from "../models/Mine";

export async function listMines(_request: AuthenticatedRequest, response: Response): Promise<void> {
  response.json(await Mine.find().sort({ createdAt: -1 }));
}

export async function getMine(request: AuthenticatedRequest, response: Response): Promise<void> {
  const mine = await Mine.findById(request.params.id);
  if (!mine) {
    response.status(404).json({ message: "Mine not found" });
    return;
  }
  response.json(mine);
}

export async function createMine(request: AuthenticatedRequest, response: Response): Promise<void> {
  const { name, code, location, operator } = request.body as Record<string, string>;
  if (!name || !code || !location || !operator) {
    response.status(400).json({ message: "name, code, location and operator are required" });
    return;
  }
  try {
    const mine = await Mine.create({ name, code, location, operator, createdBy: request.user!.id });
    response.status(201).json(mine);
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      response.status(409).json({ message: "Mine code is already registered" });
      return;
    }
    throw error;
  }
}

export async function updateMine(request: AuthenticatedRequest, response: Response): Promise<void> {
  const mine = await Mine.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
  if (!mine) {
    response.status(404).json({ message: "Mine not found" });
    return;
  }
  response.json(mine);
}

export async function deleteMine(request: AuthenticatedRequest, response: Response): Promise<void> {
  const mine = await Mine.findByIdAndDelete(request.params.id);
  if (!mine) {
    response.status(404).json({ message: "Mine not found" });
    return;
  }
  response.status(204).send();
}