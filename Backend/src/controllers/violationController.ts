import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Inspection } from "../models/Inspection";
import { Violation } from "../models/Violation";
import { CorrectiveAction } from "../models/CorrectiveAction";
import { Mine } from "../models/Mine";
import { User } from "../models/User";
import { normaliseEvidence, SEVERITIES } from "../models/workflowTypes";
import { recordAudit } from "../services/auditService";
import { asErrorMessage, assertTransition, parseDate, validId, violationTransitions } from "../services/workflowService";

export async function createViolation(request: AuthenticatedRequest, response: Response): Promise<void> {
  const body = request.body as Record<string, unknown>;
  if (!validId(body.inspectionId) || !validId(body.assignedTo) || typeof body.title !== "string" || typeof body.description !== "string" || typeof body.category !== "string" || !SEVERITIES.includes(body.severity as never)) { response.status(400).json({ message: "inspectionId, title, description, category, severity and assignedTo are required" }); return; }
  try {
    const inspection = await Inspection.findById(body.inspectionId); if (!inspection) { response.status(404).json({ message: "Inspection not found" }); return; }
    if (!(await Mine.exists({ _id: inspection.mineId })) || !(await User.exists({ _id: body.assignedTo }))) { response.status(404).json({ message: "Mine or assignee not found" }); return; }
    const violation = await Violation.create({ inspectionId: inspection.id, mineId: inspection.mineId, title: body.title, description: body.description, category: body.category, severity: body.severity, assignedTo: body.assignedTo, deadline: parseDate(body.deadline, "deadline"), evidence: normaliseEvidence(body.evidence, request.user!.id), createdBy: request.user!.id });
    await recordAudit(request, "violation", violation.id, "created", undefined, violation.toObject()); response.status(201).json(violation);
  } catch (error) { response.status(400).json({ message: asErrorMessage(error) }); }
}

export async function listViolations(request: AuthenticatedRequest, response: Response): Promise<void> {
  const page = Math.max(Number(request.query.page) || 1, 1); const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100); const filter: Record<string, unknown> = {};
  for (const key of ["mineId", "inspectionId", "status", "severity", "assignedTo"]) if (request.query[key]) filter[key] = request.query[key];
  const [data, total] = await Promise.all([Violation.find(filter).populate("inspectionId", "type scheduledFor").populate("mineId", "name code").populate("assignedTo", "name email").sort({ deadline: 1 }).skip((page - 1) * limit).limit(limit).lean(), Violation.countDocuments(filter)]);
  response.json({ data: data.map((item) => ({ ...item, evidenceCount: item.evidence.length })), page, limit, total });
}

export async function updateViolation(request: AuthenticatedRequest, response: Response): Promise<void> {
  if (!validId(request.params.id)) { response.status(404).json({ message: "Violation not found" }); return; }
  const violation = await Violation.findById(request.params.id); if (!violation) { response.status(404).json({ message: "Violation not found" }); return; }
  const before = violation.toObject(); const body = request.body as Record<string, unknown>;
  try {
    if (body.status) assertTransition(violation.status, body.status as typeof violation.status, violationTransitions, "violation status");
    if (body.status === "resolved") {
      const incomplete = await CorrectiveAction.exists({ violationId: violation.id, status: { $nin: ["completed", "verified"] } });
      if (incomplete && !body.closureReason) throw new Error("All corrective actions must be complete or a closure reason supplied");
      violation.resolvedAt = new Date();
    }
    for (const key of ["title", "description", "category", "severity", "assignedTo", "status", "closureReason"] as const) if (key in body) (violation as unknown as Record<string, unknown>)[key] = body[key];
    if (body.deadline) violation.deadline = parseDate(body.deadline, "deadline");
    if ("evidence" in body) violation.evidence = normaliseEvidence(body.evidence, request.user!.id);
    await violation.save(); await recordAudit(request, "violation", violation.id, "updated", before, violation.toObject()); response.json(violation);
  } catch (error) { response.status(400).json({ message: asErrorMessage(error) }); }
}