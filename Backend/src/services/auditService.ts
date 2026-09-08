import { Request } from "express";
import { AuditEntityType, AuditLog } from "../models/AuditLog";

export async function recordAudit(
  request: Request & { user?: { id: string } },
  entityType: AuditEntityType,
  entityId: string,
  action: string,
  before?: unknown,
  after?: unknown
): Promise<void> {
  await AuditLog.create({
    actorId: request.user!.id,
    entityType,
    entityId,
    action,
    before,
    after,
    occurredAt: new Date(),
    requestId: request.header("X-Request-Id")
  });
}