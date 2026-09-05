import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models/User";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: UserRole };
}

interface TokenPayload {
  sub: string;
  role: UserRole;
}

export function authenticate(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
  const token = request.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    request.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
}

export function authorize(...roles: UserRole[]) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
    if (!request.user || !roles.includes(request.user.role)) {
      response.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    next();
  };
}