import { Router } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    logger.error("Missing auth configuration in environment variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    return res.json({ token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

export default router;
