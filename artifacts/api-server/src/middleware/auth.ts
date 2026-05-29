import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.substring(7);

  if (!JWT_SECRET) {
    logger.error("JWT_SECRET is not configured");
    return res.status(500).json({ error: "Internal server error: Missing JWT configuration" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;

    if (payload.role !== "admin" || payload.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Attach payload to request for downstream use if necessary
    (req as any).user = payload;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid authentication token" });
  }
}
