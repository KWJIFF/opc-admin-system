import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

// ==================== 用户与团队 ====================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "invited"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const teamInvites = mysqlTable("team_invites", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  invitedBy: int("invitedBy").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "accepted", "expired"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

// ==================== 情报中心（信号采集） ====================

export const signals = mysqlTable("signals", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  source: varchar("source", { length: 200 }),
  sourceUrl: text("sourceUrl"),
  summary: text("summary"),
  content: text("content"),
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["new", "processing", "archived", "converted"]).default("new").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 选题中心 ====================

export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  signalId: int("signalId"),
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>(),
  targetPlatforms: json("targetPlatforms").$type<string[]>(),
  aiSuggestion: text("aiSuggestion"),
  status: mysqlEnum("status", ["draft", "approved", "rejected", "in_production"]).default("draft").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  assignedTo: int("assignedTo"),
  createdBy: int("createdBy"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 内容工厂（母稿） ====================

export const contents = mysqlTable("contents", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId"),
  title: varchar("title", { length: 500 }).notNull(),
  body: text("body"),
  contentType: mysqlEnum("contentType", ["article", "report", "newsletter", "social_post"]).default("article").notNull(),
  wordCount: int("wordCount").default(0),
  tags: json("tags").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["draft", "writing", "review_pending", "review_passed", "review_rejected", "ready", "published"]).default("draft").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 审核台 ====================

export const reviewTasks = mysqlTable("review_tasks", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  reviewerId: int("reviewerId"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "revision_needed"]).default("pending").notNull(),
  comments: text("comments"),
  score: int("score"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

// ==================== 发布台 ====================

export const publishTasks = mysqlTable("publish_tasks", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  accountId: int("accountId"),
  status: mysqlEnum("status", ["queued", "scheduled", "publishing", "published", "failed"]).default("queued").notNull(),
  publishedUrl: text("publishedUrl"),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  errorMessage: text("errorMessage"),
  publishMode: mysqlEnum("publishMode", ["manual", "semi_auto", "auto"]).default("manual").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 多媒体账号托管 ====================

export const mediaAccounts = mysqlTable("media_accounts", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["wechat_mp", "xiaohongshu", "douyin", "bilibili", "weibo", "zhihu", "website"]).notNull(),
  accountName: varchar("accountName", { length: 200 }).notNull(),
  accountId: varchar("accountId", { length: 200 }),
  avatar: text("avatar"),
  description: text("description"),
  followers: int("followers").default(0),
  status: mysqlEnum("status", ["active", "inactive", "pending_auth"]).default("active").notNull(),
  credentials: json("credentials").$type<Record<string, unknown>>(),
  autoPublish: int("autoPublish").default(0),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 内容日历 ====================

export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  eventType: mysqlEnum("eventType", ["publish", "review", "meeting", "deadline", "other"]).default("publish").notNull(),
  contentId: int("contentId"),
  accountId: int("accountId"),
  platform: varchar("platform", { length: 100 }),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt"),
  allDay: int("allDay").default(0),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== 网站文章 ====================

export const websitePosts = mysqlTable("website_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 300 }).unique(),
  excerpt: text("excerpt"),
  body: text("body"),
  coverImage: text("coverImage"),
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  contentId: int("contentId"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 报告中心 ====================

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  reportType: mysqlEnum("reportType", ["weekly", "monthly", "quarterly", "special"]).default("weekly").notNull(),
  summary: text("summary"),
  body: text("body"),
  coverImage: text("coverImage"),
  period: varchar("period", { length: 100 }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  downloadUrl: text("downloadUrl"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 数据洞察 ====================

export const insightTasks = mysqlTable("insight_tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  taskType: mysqlEnum("taskType", ["trend_analysis", "competitor_monitor", "keyword_tracking", "custom"]).default("custom").notNull(),
  config: json("config").$type<Record<string, unknown>>(),
  result: json("result").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  scheduleCron: varchar("scheduleCron", { length: 100 }),
  lastRunAt: timestamp("lastRunAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 工作流自动化 ====================

export const workflows = mysqlTable("workflows", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  description: text("description"),
  trigger: json("trigger").$type<Record<string, unknown>>(),
  steps: json("steps").$type<Record<string, unknown>[]>(),
  status: mysqlEnum("status", ["active", "inactive", "draft"]).default("draft").notNull(),
  lastRunAt: timestamp("lastRunAt"),
  runCount: int("runCount").default(0),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 操作日志（审计） ====================

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 200 }),
  action: varchar("action", { length: 200 }).notNull(),
  resource: varchar("resource", { length: 200 }).notNull(),
  resourceId: int("resourceId"),
  details: json("details").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== 来源管理 ====================

export const sources = mysqlTable("sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["rss", "api", "website", "manual", "social"]).default("manual").notNull(),
  url: text("url"),
  config: json("config").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["active", "inactive", "error"]).default("active").notNull(),
  lastFetchAt: timestamp("lastFetchAt"),
  fetchCount: int("fetchCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 内容模板 ====================

export const contentTemplates = mysqlTable("content_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  body: text("body"),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  thumbnail: text("thumbnail"),
  usageCount: int("usageCount").default(0),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 评论系统 ====================

export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  parentId: int("parentId"),
  authorName: varchar("authorName", { length: 200 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }),
  authorAvatar: text("authorAvatar"),
  userId: int("userId"),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "spam"]).default("pending").notNull(),
  likeCount: int("likeCount").default(0),
  aiGenerated: boolean("aiGenerated").default(false),
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== 收藏与点赞 ====================

export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  articleId: int("articleId").notNull(),
  sessionId: varchar("sessionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const likes = mysqlTable("likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  articleId: int("articleId").notNull(),
  sessionId: varchar("sessionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== 邮件订阅 ====================

export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 200 }),
  status: mysqlEnum("status", ["active", "unsubscribed", "bounced"]).default("active").notNull(),
  source: varchar("source", { length: 100 }),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
});

// ==================== 阅读量统计 ====================

export const articleViews = mysqlTable("article_views", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  sessionId: varchar("sessionId", { length: 128 }),
  userId: int("userId"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

// ==================== AI 互动管理 ====================

export const aiInteractions = mysqlTable("ai_interactions", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  interactionType: mysqlEnum("interactionType", ["reply_comment", "reply_dm", "auto_like", "auto_follow", "content_suggest"]).default("reply_comment").notNull(),
  triggerContent: text("triggerContent"),
  aiResponse: text("aiResponse"),
  status: mysqlEnum("status", ["pending", "approved", "sent", "failed", "rejected"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== 数据循环建议 ====================

export const dataLoopSuggestions = mysqlTable("data_loop_suggestions", {
  id: int("id").autoincrement().primaryKey(),
  suggestionType: mysqlEnum("suggestionType", ["content_topic", "publish_time", "platform_strategy", "audience_insight", "trend_alert"]).default("content_topic").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  dataSource: json("dataSource").$type<Record<string, unknown>>(),
  confidence: int("confidence").default(50),
  status: mysqlEnum("status", ["new", "accepted", "dismissed", "converted"]).default("new").notNull(),
  convertedToTopicId: int("convertedToTopicId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
