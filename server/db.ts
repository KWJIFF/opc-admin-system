import { eq, desc, sql, and, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, signals, topics, contents, reviewTasks, publishTasks,
  mediaAccounts, calendarEvents, websitePosts, reports, insightTasks,
  workflows, auditLogs, sources, teamInvites, contentTemplates,
  comments, bookmarks, likes, subscribers, articleViews, aiInteractions, dataLoopSuggestions
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
    await db.execute(sql`SELECT 1`);
    return { database: "healthy", tables: 16 };
  } catch {
    return { database: "error", tables: 0 };
  }
}


// ==================== Comments ====================
export async function listComments(articleId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(comments).where(and(eq(comments.articleId, articleId), eq(comments.status, status as any))).orderBy(desc(comments.createdAt));
  }
  return db.select().from(comments).where(eq(comments.articleId, articleId)).orderBy(desc(comments.createdAt));
}

export async function createComment(data: { articleId: number; authorName: string; authorEmail?: string; content: string; parentId?: number; userId?: number; ipAddress?: string }) {
  const db = await getDb();
  if (!db) return { id: 0 };
  const result = await db.insert(comments).values(data);
  return { id: result[0].insertId };
}

export async function updateCommentStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(comments).set({ status: status as any }).where(eq(comments.id, id));
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(comments).where(eq(comments.id, id));
}

export async function listAllComments(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comments).orderBy(desc(comments.createdAt)).limit(limit).offset(offset);
}

// ==================== Bookmarks & Likes ====================
export async function toggleBookmark(articleId: number, sessionId: string) {
  const db = await getDb();
  if (!db) return { bookmarked: false };
  const existing = await db.select().from(bookmarks).where(and(eq(bookmarks.articleId, articleId), eq(bookmarks.sessionId, sessionId)));
  if (existing.length > 0) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
    return { bookmarked: false };
  }
  await db.insert(bookmarks).values({ articleId, sessionId });
  return { bookmarked: true };
}

export async function toggleLike(articleId: number, sessionId: string) {
  const db = await getDb();
  if (!db) return { liked: false };
  const existing = await db.select().from(likes).where(and(eq(likes.articleId, articleId), eq(likes.sessionId, sessionId)));
  if (existing.length > 0) {
    await db.delete(likes).where(eq(likes.id, existing[0].id));
    return { liked: false };
  }
  await db.insert(likes).values({ articleId, sessionId });
  return { liked: true };
}

// ==================== Subscribers ====================
export async function createSubscriber(email: string, name?: string, source?: string) {
  const db = await getDb();
  if (!db) return { id: 0 };
  const existing = await db.select().from(subscribers).where(eq(subscribers.email, email));
  if (existing.length > 0) {
    if (existing[0].status === "unsubscribed") {
      await db.update(subscribers).set({ status: "active" as any }).where(eq(subscribers.id, existing[0].id));
    }
    return { id: existing[0].id };
  }
  const result = await db.insert(subscribers).values({ email, name, source });
  return { id: result[0].insertId };
}

export async function listSubscribers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt)).limit(limit).offset(offset);
}

export async function unsubscribe(email: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscribers).set({ status: "unsubscribed" as any, unsubscribedAt: new Date() }).where(eq(subscribers.email, email));
}

// ==================== Article Views ====================
export async function recordView(articleId: number, sessionId?: string, ipAddress?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(articleViews).values({ articleId, sessionId, ipAddress });
}

export async function getViewCount(articleId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ cnt: count() }).from(articleViews).where(eq(articleViews.articleId, articleId));
  return result[0]?.cnt ?? 0;
}

// ==================== AI Interactions ====================
export async function listAiInteractions(accountId?: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  if (accountId) {
    return db.select().from(aiInteractions).where(eq(aiInteractions.accountId, accountId)).orderBy(desc(aiInteractions.createdAt)).limit(limit);
  }
  return db.select().from(aiInteractions).orderBy(desc(aiInteractions.createdAt)).limit(limit);
}

export async function createAiInteraction(data: { accountId: number; platform: string; interactionType: string; triggerContent?: string; aiResponse?: string }) {
  const db = await getDb();
  if (!db) return { id: 0 };
  const result = await db.insert(aiInteractions).values(data as any);
  return { id: result[0].insertId };
}

export async function updateAiInteractionStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(aiInteractions).set({ status: status as any, sentAt: status === "sent" ? new Date() : undefined }).where(eq(aiInteractions.id, id));
}

// ==================== Data Loop Suggestions ====================
export async function listDataLoopSuggestions(status?: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(dataLoopSuggestions).where(eq(dataLoopSuggestions.status, status as any)).orderBy(desc(dataLoopSuggestions.createdAt)).limit(limit);
  }
  return db.select().from(dataLoopSuggestions).orderBy(desc(dataLoopSuggestions.createdAt)).limit(limit);
}

export async function createDataLoopSuggestion(data: { suggestionType: string; title: string; description?: string; dataSource?: Record<string, unknown>; confidence?: number }) {
  const db = await getDb();
  if (!db) return { id: 0 };
  const result = await db.insert(dataLoopSuggestions).values(data as any);
  return { id: result[0].insertId };
}

export async function updateSuggestionStatus(id: number, status: string, convertedToTopicId?: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(dataLoopSuggestions).set({ status: status as any, convertedToTopicId }).where(eq(dataLoopSuggestions.id, id));
}
