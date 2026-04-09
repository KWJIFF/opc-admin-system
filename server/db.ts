import { eq, desc, sql, and, like, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, signals, topics, contents, reviewTasks, publishTasks,
  mediaAccounts, calendarEvents, websitePosts, reports, insightTasks,
  workflows, auditLogs, sources, teamInvites, contentTemplates
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== Dashboard Stats ====================
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { signals: 0, topics: 0, contents: 0, published: 0 };
  const [signalCount] = await db.select({ c: count() }).from(signals);
  const [topicCount] = await db.select({ c: count() }).from(topics);
  const [contentCount] = await db.select({ c: count() }).from(contents);
  const [publishedCount] = await db.select({ c: count() }).from(publishTasks).where(eq(publishTasks.status, "published"));
  return { signals: signalCount.c, topics: topicCount.c, contents: contentCount.c, published: publishedCount.c };
}

// ==================== Signals ====================
export async function listSignals(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(signals).orderBy(desc(signals.createdAt)).limit(limit).offset(offset);
}

export async function createSignal(data: { title: string; source?: string; sourceUrl?: string; summary?: string; content?: string; category?: string; tags?: string[]; priority?: "low" | "medium" | "high" | "urgent"; createdBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(signals).values(data);
  return { id: result[0].insertId };
}

// ==================== Topics ====================
export async function listTopics(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topics).orderBy(desc(topics.createdAt)).limit(limit).offset(offset);
}

export async function createTopic(data: { title: string; description?: string; signalId?: number; category?: string; tags?: string[]; targetPlatforms?: string[]; status?: "draft" | "approved" | "rejected" | "in_production"; priority?: "low" | "medium" | "high" | "urgent"; createdBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(topics).values(data);
  return { id: result[0].insertId };
}

// ==================== Contents ====================
export async function listContents(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contents).orderBy(desc(contents.createdAt)).limit(limit).offset(offset);
}

export async function createContent(data: { title: string; topicId?: number; body?: string; contentType?: "article" | "report" | "newsletter" | "social_post"; tags?: string[]; createdBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contents).values(data);
  return { id: result[0].insertId };
}

// ==================== Review Tasks ====================
export async function listReviewTasks(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviewTasks).orderBy(desc(reviewTasks.createdAt)).limit(limit).offset(offset);
}

// ==================== Publish Tasks ====================
export async function listPublishTasks(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publishTasks).orderBy(desc(publishTasks.createdAt)).limit(limit).offset(offset);
}

// ==================== Media Accounts ====================
export async function listMediaAccounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaAccounts).orderBy(desc(mediaAccounts.createdAt));
}

// ==================== Content Templates ====================
export async function listContentTemplates(platform?: string) {
  const db = await getDb();
  if (!db) return [];
  if (platform) {
    return db.select().from(contentTemplates).where(eq(contentTemplates.platform, platform)).orderBy(desc(contentTemplates.createdAt));
  }
  return db.select().from(contentTemplates).orderBy(desc(contentTemplates.createdAt));
}

export async function createContentTemplate(data: { name: string; platform: string; category?: string; description?: string; body?: string; fileUrl?: string; fileKey?: string; thumbnail?: string; createdBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contentTemplates).values(data);
  return { id: result[0].insertId };
}

// ==================== Calendar Events ====================
export async function listCalendarEvents(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(calendarEvents).orderBy(desc(calendarEvents.startAt)).limit(limit);
}

// ==================== Website Posts ====================
export async function listWebsitePosts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(websitePosts).orderBy(desc(websitePosts.createdAt)).limit(limit).offset(offset);
}

// ==================== Reports ====================
export async function listReports(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).orderBy(desc(reports.createdAt)).limit(limit).offset(offset);
}

// ==================== Insight Tasks ====================
export async function listInsightTasks(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(insightTasks).orderBy(desc(insightTasks.createdAt)).limit(limit);
}

// ==================== Workflows ====================
export async function listWorkflows(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workflows).orderBy(desc(workflows.createdAt)).limit(limit);
}

// ==================== Audit Logs ====================
export async function listAuditLogs(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
}

export async function createAuditLog(data: { userId?: number; userName?: string; action: string; resource: string; resourceId?: number; details?: Record<string, unknown>; ipAddress?: string; userAgent?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(data);
}

// ==================== Sources ====================
export async function listSources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sources).orderBy(desc(sources.createdAt));
}

// ==================== Team ====================
export async function listTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function listTeamInvites() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamInvites).orderBy(desc(teamInvites.createdAt));
}

// ==================== System Health ====================
export async function getSystemHealth() {
  const db = await getDb();
  if (!db) return { database: "disconnected", tables: 0 };
  try {
    const result = await db.execute(sql`SELECT 1`);
    return { database: "healthy", tables: 16 };
  } catch {
    return { database: "error", tables: 0 };
  }
}
