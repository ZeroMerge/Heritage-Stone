import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../lib/logger.js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function requireSupabaseAuth(req: Request, res: Response, next: NextFunction) {
  // 1. Get token from authorization header or cookie
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : (req.cookies?.["sb-access-token"] || null);

  if (!token) {
    logger.info(`[auth] No token found for ${req.path}, redirecting to login`);
    return res.redirect(`/auth/login-account?redirect=${encodeURIComponent(req.originalUrl)}`);
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.warn(`[auth] Invalid token for ${req.path}`);
      return res.redirect(`/auth/login-account?redirect=${encodeURIComponent(req.originalUrl)}`);
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (err) {
    logger.error(`[auth] Supabase verify error: ${String(err)}`);
    res.status(500).send("Authentication service error");
  }
}
