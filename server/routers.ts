import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== Dashboard ====================
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return db.getDashboardStats();
    }),
    health: protectedProcedure.query(async () => {
      return db.getSystemHealth();
    }),
  }),

  // ==================== Signals ====================
  signals: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listSignals(input?.limit, input?.offset);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        source: z.string().optional(),
        sourceUrl: z.string().optional(),
        summary: z.string().optional(),
        content: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createSignal({ ...input, createdBy: ctx.user.id });
        await db.createAuditLog({ userId: ctx.user.id, userName: ctx.user.name ?? undefined, action: "create", resource: "signal", resourceId: result.id });
        return result;
      }),
  }),

  // ==================== Topics ====================
  topics: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listTopics(input?.limit, input?.offset);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        signalId: z.number().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        targetPlatforms: z.array(z.string()).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createTopic({ ...input, createdBy: ctx.user.id });
        await db.createAuditLog({ userId: ctx.user.id, userName: ctx.user.name ?? undefined, action: "create", resource: "topic", resourceId: result.id });
        return result;
      }),
  }),

  // ==================== Contents ====================
  contents: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listContents(input?.limit, input?.offset);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        topicId: z.number().optional(),
        body: z.string().optional(),
        contentType: z.enum(["article", "report", "newsletter", "social_post"]).optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createContent({ ...input, createdBy: ctx.user.id });
        await db.createAuditLog({ userId: ctx.user.id, userName: ctx.user.name ?? undefined, action: "create", resource: "content", resourceId: result.id });
        return result;
      }),
  }),

  // ==================== Reviews ====================
  reviews: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listReviewTasks(input?.limit, input?.offset);
      }),
  }),

  // ==================== Publish ====================
  publish: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listPublishTasks(input?.limit, input?.offset);
      }),
  }),

  // ==================== Media Accounts ====================
  accounts: router({
    list: protectedProcedure.query(async () => {
      return db.listMediaAccounts();
    }),
  }),

  // ==================== Content Templates ====================
  templates: router({
    list: protectedProcedure
      .input(z.object({ platform: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.listContentTemplates(input?.platform);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        platform: z.string().min(1),
        category: z.string().optional(),
        description: z.string().optional(),
        body: z.string().optional(),
        fileUrl: z.string().optional(),
        fileKey: z.string().optional(),
        thumbnail: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createContentTemplate({ ...input, createdBy: ctx.user.id });
        await db.createAuditLog({ userId: ctx.user.id, userName: ctx.user.name ?? undefined, action: "create", resource: "template", resourceId: result.id });
        return result;
      }),
  }),

  // ==================== Calendar ====================
  calendar: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listCalendarEvents(input?.limit);
      }),
  }),

  // ==================== Website Posts ====================
  website: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listWebsitePosts(input?.limit, input?.offset);
      }),
  }),

  // ==================== Reports ====================
  reports: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listReports(input?.limit, input?.offset);
      }),
  }),

  // ==================== Insights ====================
  insights: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listInsightTasks(input?.limit);
      }),
  }),

  // ==================== Workflows ====================
  workflows: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listWorkflows(input?.limit);
      }),
  }),

  // ==================== Audit Logs ====================
  audit: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listAuditLogs(input?.limit, input?.offset);
      }),
  }),

  // ==================== Sources ====================
  sources: router({
    list: protectedProcedure.query(async () => {
      return db.listSources();
    }),
  }),

  // ==================== Team ====================
  team: router({
    members: protectedProcedure.query(async () => {
      return db.listTeamMembers();
    }),
    invites: adminProcedure.query(async () => {
      return db.listTeamInvites();
    }),
  }),
});

export type AppRouter = typeof appRouter;
