import { db } from "./db";
import { checkins, type Checkin, type InsertCheckin, type CompleteCheckinRequest } from "@shared/schema";
import { users, type User, type UpsertUser } from "@shared/models/auth";
import { eq, desc } from "drizzle-orm";

// User storage operations (moved from Replit auth)
class UserStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

const userStorage = new UserStorage();

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  completeCheckin(id: number, updates: CompleteCheckinRequest): Promise<Checkin>;
  getCheckins(userId: string): Promise<Checkin[]>;
  getLastCheckin(userId: string): Promise<Checkin | undefined>;
  getCheckin(id: number): Promise<Checkin | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Delegate auth methods
  getUser = userStorage.getUser.bind(userStorage);
  upsertUser = userStorage.upsertUser.bind(userStorage);

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
export const authStorage = userStorage;
