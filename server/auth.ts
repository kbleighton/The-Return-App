import { requireAuth as clerkRequireAuth } from "@clerk/express";
import type { RequestHandler } from "express";
import { db } from "./db";
import { users } from "@shared/models/auth";

/**
 * Clerk authentication middleware
 * Verifies JWT token and ensures user exists in database (MVP: minimal sync)
 */
export const requireAuth: RequestHandler = async (req, res, next) => {
  await clerkRequireAuth()(req, res, async (err) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const auth = (req as any).auth;

    if (!auth?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // MVP: Minimal user sync - only ensure user ID exists in database
    // Email, firstName, lastName, profileImageUrl will be null initially
    // Can be populated later via Clerk webhooks or profile update flow
    try {
      await db
        .insert(users)
        .values({
          id: auth.userId,
        })
        .onConflictDoNothing();

      next();
    } catch (error) {
      console.error("Error syncing user:", error);
      return res.status(500).json({ message: "Failed to sync user" });
    }
  });
};

/**
 * Extract current user ID from Clerk auth
 */
export function getCurrentUserId(req: any): string {
  return req.auth.userId;
}
