import { 
  users, 
  subscribers, 
  adminSessions,
  type User, 
  type InsertUser,
  type Subscriber,
  type InsertSubscriber,
  type AdminSession,
  type InsertAdminSession
} from "@shared/schema";
import { db } from "./db";
import { eq, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subscriber operations
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getSubscribers(): Promise<Subscriber[]>;
  getSubscriberCount(): Promise<number>;
  deleteSubscriber(id: string): Promise<void>;
  
  // Admin session operations
  createAdminSession(session: InsertAdminSession): Promise<AdminSession>;
  getAdminSession(sessionToken: string): Promise<AdminSession | undefined>;
  deleteAdminSession(sessionToken: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
}



export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Subscriber operations
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const result = await db.insert(subscribers).values(subscriber).returning();
    return result[0];
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const result = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
    return result[0];
  }

  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers).orderBy(subscribers.created_at);
  }

  async getSubscriberCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(subscribers);
    return result[0].count;
  }

  async deleteSubscriber(id: string): Promise<void> {
    await db.delete(subscribers).where(eq(subscribers.id, id));
  }

  // Admin session operations
  async createAdminSession(session: InsertAdminSession): Promise<AdminSession> {
    const result = await db.insert(adminSessions).values(session).returning();
    return result[0];
  }

  async getAdminSession(sessionToken: string): Promise<AdminSession | undefined> {
    const result = await db.select().from(adminSessions)
      .where(eq(adminSessions.session_token, sessionToken)).limit(1);
    return result[0];
  }

  async deleteAdminSession(sessionToken: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.session_token, sessionToken));
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.expires_at, new Date()));
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subscribersMap: Map<string, Subscriber>;
  private adminSessionsMap: Map<string, AdminSession>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.subscribersMap = new Map();
    this.adminSessionsMap = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const id = crypto.randomUUID();
    const newSubscriber: Subscriber = {
      id,
      email: subscriber.email,
      subscribed_at: new Date(),
      created_at: new Date(),
    };
    this.subscribersMap.set(id, newSubscriber);
    return newSubscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribersMap.values()).find(sub => sub.email === email);
  }

  async getSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribersMap.values());
  }

  async getSubscriberCount(): Promise<number> {
    return this.subscribersMap.size;
  }

  async deleteSubscriber(id: string): Promise<void> {
    this.subscribersMap.delete(id);
  }

  async createAdminSession(session: InsertAdminSession): Promise<AdminSession> {
    const id = crypto.randomUUID();
    const newSession: AdminSession = {
      id,
      session_token: session.session_token,
      username: session.username,
      created_at: new Date(),
      expires_at: session.expires_at,
    };
    this.adminSessionsMap.set(session.session_token, newSession);
    return newSession;
  }

  async getAdminSession(sessionToken: string): Promise<AdminSession | undefined> {
    const session = this.adminSessionsMap.get(sessionToken);
    if (session && session.expires_at > new Date()) {
      return session;
    }
    return undefined;
  }

  async deleteAdminSession(sessionToken: string): Promise<void> {
    this.adminSessionsMap.delete(sessionToken);
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const tokensToDelete: string[] = [];
    this.adminSessionsMap.forEach((session, token) => {
      if (session.expires_at <= now) {
        tokensToDelete.push(token);
      }
    });
    tokensToDelete.forEach(token => this.adminSessionsMap.delete(token));
  }
}

// Use DatabaseStorage by default, but keep MemStorage available
export const storage = new DatabaseStorage();
