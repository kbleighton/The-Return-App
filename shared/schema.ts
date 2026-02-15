export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

// Check-ins table stores the user's state and the result of the practice
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Link to auth user
  
  // Slider values (0-100)
  grounded: integer("grounded").notNull(),   // Grounded <-> Scattered
  calm: integer("calm").notNull(),           // Calm <-> Anxious
  present: integer("present").notNull(),     // Present <-> In my head
  energized: integer("energized").notNull(), // Energized <-> Exhausted (Note: logic uses 'exhausted' variable name which is right side)
  
  // Result
  recommendedPractice: text("recommended_practice").notNull(), // CALM, GROUND, ACTIVATE, DEEP_REST
  
  // Post-practice Integration
  postFeeling: text("post_feeling"), // Grounded, Clear, About the same, Still tense
  intention: text("intention"),      // The small thing to move into next
  
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"), // When they finish the flow
});

// === SCHEMAS ===
export const insertCheckinSchema = createInsertSchema(checkins).omit({ 
  id: true, 
  createdAt: true, 
  userId: true,
  postFeeling: true,
  intention: true,
  completedAt: true,
  recommendedPractice: true
});

export const updateCheckinSchema = createInsertSchema(checkins).pick({
  postFeeling: true,
  intention: true,
});

// === TYPES ===
export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;

// API Types
export type CreateCheckinRequest = InsertCheckin;
export type CompleteCheckinRequest = z.infer<typeof updateCheckinSchema>;
export type CheckinResponse = Checkin;

export type PracticeCategory = 'CALM' | 'GROUND' | 'ACTIVATE' | 'DEEP_REST';
