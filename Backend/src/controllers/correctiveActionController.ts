import { Response } from "express";
import { Schema } from "mongoose";
import { AuthenticatedRequest } from "../middleware/auth";
import { CorrectiveAction } from "../models/CorrectiveAction";
import { Violation } from "../models/Violation";
import { normaliseEvidence } from "../models/workflowTypes";
import { recordAudit } from "../services/auditService";
import { actionTransitions, asErrorMessage, assertTransition, effectiveActionStatus, parseDate, validId } from "../services/workflowService";

export async function createCorrectiveAction(request: AuthenticatedRequest, response: Response): Promise<void> {
  const body = request.body as Record<string, unknown>;
  if (!validId(body.violationId) || !validId(body.responsiblePersonId) || typeof body.title !== "string") { response.status(400).json({ message: "violationId, title and responsiblePersonId are required" }); return; }
  try {
    const violation = await Violation.findById(body.violationId); if (!violation) { response.status(404).json({ message: "Violation not found" }); return; }
    if (request.user!.role === "inspector" && body.responsiblePersonId !== request.user!.id) { response.status(403).json({ message: "Inspectors may create only actions assigned to themselves" }); return; }
    const action = await CorrectiveAction.create({ violationId: violation.id, inspectionId: violation.inspectionId, mineId: violation.mineId, title: body.title, description: body.description, responsiblePersonId: body.responsiblePersonId, deadline: parseDate(body.deadline, "deadline"), evidence: normaliseEvidence(body.evidence, request.user!.id), createdBy: request.user!.id });
    await recordAudit(request, "corrective_action", action.id, "created", undefined, action.toObject()); response.status(201).json(action);
  } catch (error) { response.status(400).json({ message: asErrorMessage(error) }); }
}

export async function listCorrectiveActions(request: AuthenticatedRequest, response: Response): Promise<void> {
  const page = Math.max(Number(request.query.page) || 1, 1); const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100); const filter: Record<string, unknown> = {};
  for (const key of ["mineId", "violationId", "status", "responsiblePersonId"]) if (request.query[key]) filter[key] = request.query[key];
  const actions = await CorrectiveAction.find(filter).populate("violationId", "title severity").populate("inspectionId", "type").populate("responsiblePersonId", "name email").sort({ deadline: 1 }).skip((page - 1) * limit).limit(limit).lean();
  const data = actions.map((item) => ({ ...item, status: effectiveActionStatus(item.status, item.deadline), evidenceCount: item.evidence.length })).filter((item) => request.query.overdue === "true" ? item.status === "overdue" : true);
  response.json({ data, page, limit, total: await CorrectiveAction.countDocuments(filter) });
}

export async function updateCorrectiveAction(request: AuthenticatedRequest, response: Response): Promise<void> {
  if (!validId(request.params.id)) { response.status(404).json({ message: "Corrective action not found" }); return; }
  const action = await CorrectiveAction.findById(request.params.id); if (!action) { response.status(404).json({ message: "Corrective action not found" }); return; }
  if (request.user!.role === "inspector" && String(action.responsiblePersonId) !== request.user!.id) { response.status(403).json({ message: "Inspectors may update only assigned actions" }); return; }
  const before = action.toObject(); const body = request.body as Record<string, unknown>;
  try {
    if (body.status === "verified") throw new Error("Use the verification endpoint to verify an action");
    if (body.status) assertTransition(action.status, body.status as typeof action.status, actionTransitions, "action status");
    for (const key of ["title", "description", "responsiblePersonId", "status"] as const) if (key in body) (action as unknown as Record<string, unknown>)[key] = body[key];
    if (body.deadline) action.deadline = parseDate(body.deadline, "deadline");
    if (body.status === "completed") action.completedAt = new Date();
    if ("evidence" in body) action.evidence = normaliseEvidence(body.evidence, request.user!.id);
    await action.save(); await recordAudit(request, "corrective_action", action.id, "updated", before, action.toObject()); response.json(action);
  } catch (error) { response.status(400).json({ message: asErrorMessage(error) }); }
}

export async function verifyCorrectiveAction(request: AuthenticatedRequest, response: Response): Promise<void> {
  if (!validId(request.params.id)) { response.status(404).json({ message: "Corrective action not found" }); return; }
  const action = await CorrectiveAction.findById(request.params.id); if (!action) { response.status(404).json({ message: "Corrective action not found" }); return; }
  if (action.status !== "completed") { response.status(400).json({ message: "Only completed actions can be verified" }); return; }
  const before = action.toObject(); action.status = "verified"; action.verification = { verifiedBy: request.user!.id as unknown as Schema.Types.ObjectId, verifiedAt: new Date(), note: typeof request.body?.note === "string" ? request.body.note : undefined }; await action.save();
  await recordAudit(request, "corrective_action", action.id, "verified", before, action.toObject()); response.json(action);
}