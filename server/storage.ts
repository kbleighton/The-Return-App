import { db } from "./db";
import { checkins, type Checkin, type InsertCheckin, type CompleteCheckinRequest } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth";

export interface IStorage extends IAuthStorage {
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  completeCheckin(id: number, updates: CompleteCheckinRequest): Promise<Checkin>;
  getCheckins(userId: string): Promise<Checkin[]>;
  getLastCheckin(userId: string): Promise<Checkin | undefined>;
  getCheckin(id: number): Promise<Checkin | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to authStorage
  getUser = authStorage.getUser.bind(authStorage);
  upsertUser = authStorage.upsertUser.bind(authStorage);

  async createCheckin(checkin: InsertCheckin): Promise<Checkin> {
    const [newCheckin] = await db
      .insert(checkins)
      .values(checkin)
      .returning();
    return newCheckin;
  }

  async completeCheckin(id: number, updates: CompleteCheckinRequest): Promise<Checkin> {
    const [updated] = await db
      .update(checkins)
      .set({
        ...updates,
        completedAt: new Date(),
      })
      .where(eq(checkins.id, id))
      .returning();
    return updated;
  }

  async getCheckins(userId: string): Promise<Checkin[]> {
    return await db
      .select()
      .from(checkins)
      .where(eq(checkins.userId, userId))
      .orderBy(desc(checkins.createdAt));
  }
  
  async getLastCheckin(userId: string): Promise<Checkin | undefined> {
    const [checkin] = await db
      .select()
      .from(checkins)
      .where(eq(checkins.userId, userId))
      .orderBy(desc(checkins.createdAt))
      .limit(1);
    return checkin;
  }

  async getCheckin(id: number): Promise<Checkin | undefined> {
    const [checkin] = await db
      .select()
      .from(checkins)
      .where(eq(checkins.id, id));
    return checkin;
  }
}

export const storage = new DatabaseStorage();
