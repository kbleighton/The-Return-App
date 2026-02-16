import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { type InsertCheckin } from "@shared/schema";

// Helper for Practice Routing Logic
function calculatePractice(
  groundedVal: number, // Left(0) - Right(100) -> Grounded - Scattered
  calmVal: number,     // Left(0) - Right(100) -> Calm - Anxious
  presentVal: number,  // Left(0) - Right(100) -> Present - In my head
  energizedVal: number // Left(0) - Right(100) -> Energized - Exhausted
): 'CALM' | 'GROUND' | 'ACTIVATE' | 'DEEP_REST' {
  
  // Map UI values to internal variable names from spec
  const scattered = groundedVal;
  const anxious = calmVal;
  const inHead = presentVal;
  const exhausted = energizedVal;

  // 3. Overrides (evaluated first)
  
  // Override A — High Anxiety
  // If: anxious ≥ 75 → Serve CALM
  if (anxious >= 75) return 'CALM';

  // Override B — Tired but Wired (Deep Rest)
  // If: exhausted ≥ 75 AND anxious ≤ 60 → Serve DEEP REST
  if (exhausted >= 75 && anxious <= 60) return 'DEEP_REST';

  // Override C — Strong Rumination
  // If: inHead ≥ 80 AND anxious ≤ 65 → Serve GROUND
  if (inHead >= 80 && anxious <= 65) return 'GROUND';

  // 4. Scoring (used if no override triggered)
  
  // Calm Score: calm = 0.50*anxious + 0.25*scattered + 0.15*inHead + 0.10*exhausted
  const calmScore = (0.50 * anxious) + (0.25 * scattered) + (0.15 * inHead) + (0.10 * exhausted);

  // Ground Score: ground = 0.55*inHead + 0.25*scattered + 0.10*anxious + 0.10*exhausted
  const groundScore = (0.55 * inHead) + (0.25 * scattered) + (0.10 * anxious) + (0.10 * exhausted);

  // Activate Score: activate = 0.70*exhausted + 0.20*scattered - 0.30*anxious + 0.10*(100 - inHead)
  const activateScore = (0.70 * exhausted) + (0.20 * scattered) - (0.30 * anxious) + (0.10 * (100 - inHead));

  // Deep Rest Score: deepRest = 0.75*exhausted + 0.25*(100 - anxious)
  const deepRestScore = (0.75 * exhausted) + (0.25 * (100 - anxious));

  // 5. Final Selection
  const scores = {
    'CALM': calmScore,
    'GROUND': groundScore,
    'ACTIVATE': activateScore,
    'DEEP_REST': deepRestScore
  };

  // Find max score
  let maxScore = -Infinity;
  let selectedPractice: 'CALM' | 'GROUND' | 'ACTIVATE' | 'DEEP_REST' = 'CALM'; // Default

  for (const [key, value] of Object.entries(scores)) {
    if (value > maxScore) {
      maxScore = value;
      selectedPractice = key as any;
    }
  }

  return selectedPractice;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  // await setupAuth(app);
  registerAuthRoutes(app);

  // API Routes
  
  // POST /api/checkins - Create check-in and get recommendation
  app.post(api.checkins.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.checkins.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub; // From Replit Auth
      
      // Calculate practice
      const recommendedPractice = calculatePractice(
        input.grounded,
        input.calm,
        input.present,
        input.energized
      );

      const checkinData: InsertCheckin = {
        ...input,
        userId,
        recommendedPractice
      };

      const checkin = await storage.createCheckin(checkinData);
      res.status(201).json(checkin);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // PATCH /api/checkins/:id/complete - Update with post-practice integration
  app.patch(api.checkins.complete.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.checkins.complete.input.parse(req.body);
      const userId = (req.user as any).claims.sub;

      const existing = await storage.getCheckin(id);
      if (!existing) {
        return res.status(404).json({ message: "Check-in not found" });
      }
      
      if (existing.userId !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updated = await storage.completeCheckin(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // GET /api/checkins - List user check-ins
  app.get(api.checkins.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const checkins = await storage.getCheckins(userId);
    res.json(checkins);
  });
  
  // GET /api/checkins/last - Get last checkin
  app.get(api.checkins.getLast.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const checkin = await storage.getLastCheckin(userId);
    res.json(checkin || null);
  });

  return httpServer;
}
