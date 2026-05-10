import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcryptjs";
import { sdk } from "./_core/sdk";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    /** 本地登录（自托管模式） */
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1, "用户名不能为空"),
        password: z.string().min(1, "密码不能为空"),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });
        }
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });
        }
        // 更新最后登录时间
        await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
        // 签发 JWT session
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || input.username,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return {
          success: true,
          user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role },
        };
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
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        excerpt: z.string().optional(),
        body: z.string().optional(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const publishedAt = input.status === "published" ? new Date() : undefined;
        const result = await db.createWebsitePost({ ...input, publishedAt, createdBy: ctx.user.id });
        await db.createAuditLog({ userId: ctx.user.id, userName: ctx.user.name ?? undefined, action: "create", resource: "website_post", resourceId: result.id });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        body: z.string().optional(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        if (data.status === "published") {
          (data as any).publishedAt = new Date();
        }
        await db.updateWebsitePost(id, data);
        await db.createAuditLog({ userId: ctx.user.id, userName: ctx.user.name ?? undefined, action: "update", resource: "website_post", resourceId: id });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteWebsitePost(input.id);
        await db.createAuditLog({ userId: ctx.user.id, userName: ctx.user.name ?? undefined, action: "delete", resource: "website_post", resourceId: input.id });
        return { success: true };
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getWebsitePostById(input.id);
      }),
    // --- 前台公开接口 ---
    published: publicProcedure
      .input(z.object({ category: z.string().optional(), limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listPublishedPosts(input?.category, input?.limit, input?.offset);
      }),
    featured: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getFeaturedPosts(input?.limit);
      }),
  }),

  // ==================== AI Content Generation ====================
  ai: router({
    generateArticle: protectedProcedure
      .input(z.object({
        category: z.string(),
        topic: z.string().optional(),
        style: z.string().optional(),
        length: z.enum(["short", "medium", "long"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const categoryLabels: Record<string, string> = {
          news: "今日快讯", thoughts: "思想前沿", research: "深度研究",
          policy: "政策风向", cases: "实战拆解", reports: "深度报告", toolkit: "工具图谱",
        };
        const catLabel = categoryLabels[input.category] || input.category;
        const lengthGuide = input.length === "long" ? "3000-5000字" : input.length === "short" ? "800-1200字" : "1500-2500字";
        const topicHint = input.topic ? `围绕主题：${input.topic}` : "选择当下最热门、最有价值的话题";
        const styleHint = input.style || "专业、深入、有洞察力，适合一人公司创业者阅读";

        const result = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `你是深象OPCS研究院的资深内容编辑，专注于一人公司（One Person Company）创业领域。你的文章面向中国的独立创业者、内容创作者和数字游民。

写作要求：
1. 文章用 Markdown 格式，包含标题、小标题、正文段落
2. 适当使用 Markdown 表格来对比数据或工具
3. 使用粗体强调关键概念
4. 文章要有深度和洞察力，不要泛泛而谈
5. 引用真实的工具、平台、人物和案例
6. 文末加上"深象OPCS研究院"的编辑点评
7. 文章长度：${lengthGuide}
8. 写作风格：${styleHint}
9. 日期使用2026年4月的日期`,
            },
            {
              role: "user",
              content: `请为「${catLabel}」板块撰写一篇高质量文章。${topicHint}。

请返回JSON格式：
{
  "title": "文章标题",
  "excerpt": "100字以内的摘要",
  "body": "完整的Markdown格式正文",
  "tags": ["标签1", "标签2", "标签3"],
  "readTime": "X 分钟"
}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "article",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  excerpt: { type: "string" },
                  body: { type: "string" },
                  tags: { type: "array", items: { type: "string" } },
                  readTime: { type: "string" },
                },
                required: ["title", "excerpt", "body", "tags", "readTime"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = result.choices[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI 生成失败" });
        }
        return JSON.parse(content) as { title: string; excerpt: string; body: string; tags: string[]; readTime: string };
      }),

    generateAndPublish: protectedProcedure
      .input(z.object({
        category: z.string(),
        topic: z.string().optional(),
        style: z.string().optional(),
        length: z.enum(["short", "medium", "long"]).optional(),
        autoPublish: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const categoryLabels: Record<string, string> = {
          news: "今日快讯", thoughts: "思想前沿", research: "深度研究",
          policy: "政策风向", cases: "实战拆解", reports: "深度报告", toolkit: "工具图谱",
        };
        const catLabel = categoryLabels[input.category] || input.category;
        const lengthGuide = input.length === "long" ? "3000-5000字" : input.length === "short" ? "800-1200字" : "1500-2500字";
        const topicHint = input.topic ? `围绕主题：${input.topic}` : "选择当下最热门、最有价值的话题";
        const styleHint = input.style || "专业、深入、有洞察力";

        const result = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `你是深象OPCS研究院的资深内容编辑。为「${catLabel}」板块撰写一篇高质量文章。
写作要求：
1. 正文使用Markdown格式，含表格和数据对比
2. 篇幅：${lengthGuide}
3. 风格：${styleHint}
4. 引用真实案例和工具
5. 必须返回严格的JSON格式，包含title、excerpt、body、tags四个字段
6. body字段中的换行用\n表示`,
            },
            {
              role: "user",
              content: `${topicHint}。\n\n请严格按以下JSON格式返回（不要添加任何其他文字）：\n{"title":"文章标题","excerpt":"100字以内摘要","body":"完整Markdown正文","tags":["标签1","标签2","标签3"]}`,
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = result.choices[0]?.message?.content;
        if (!content || typeof content !== "string") {
          console.error('[AI] 千问返回内容为空:', JSON.stringify(result));
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI 生成失败：模型未返回内容" });
        }
        console.log(`[AI] 千问返回内容长度: ${content.length} 字符`);
        let article: { title: string; excerpt: string; body: string; tags: string[] };
        try {
          // 清理可能的控制字符
          const cleaned = content.replace(/[\x00-\x1f\x7f]/g, (ch) => ch === '\n' || ch === '\t' ? ch : '');
          article = JSON.parse(cleaned);
        } catch (parseErr: any) {
          console.error('[AI] JSON解析失败:', parseErr.message, '\n原始内容前200字:', content.substring(0, 200));
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `AI 生成的内容格式错误: ${parseErr.message}` });
        }
        if (!article.title || !article.body) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI 生成的文章缺少必要字段" });
        }

        // 保存到数据库
        const status = input.autoPublish ? "published" : "draft";
        const post = await db.createWebsitePost({
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          category: input.category,
          tags: article.tags,
          status,
          publishedAt: input.autoPublish ? new Date() : undefined,
          createdBy: ctx.user.id,
        });

        await db.createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? undefined,
          action: "ai_generate",
          resource: "website_post",
          resourceId: post.id,
          details: { category: input.category, topic: input.topic, autoPublish: input.autoPublish },
        });

        return { ...article, postId: post.id, status };
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

  // ==================== Comments ====================
  comments: router({
    list: publicProcedure
      .input(z.object({ articleId: z.number(), status: z.string().optional() }))
      .query(async ({ input }) => {
        return db.listComments(input.articleId, input.status);
      }),
    create: publicProcedure
      .input(z.object({
        articleId: z.number(),
        authorName: z.string().min(1),
        authorEmail: z.string().optional(),
        content: z.string().min(1),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createComment(input);
      }),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ input }) => {
        await db.updateCommentStatus(input.id, input.status);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteComment(input.id);
        return { success: true };
      }),
    listAll: adminProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listAllComments(input?.limit, input?.offset);
      }),
  }),

  // ==================== Subscribers ====================
  subscribers: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().optional(), source: z.string().optional() }))
      .mutation(async ({ input }) => {
        return db.createSubscriber(input.email, input.name, input.source);
      }),
    list: adminProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listSubscribers(input?.limit, input?.offset);
      }),
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await db.unsubscribe(input.email);
        return { success: true };
      }),
  }),

  // ==================== Interactions ====================
  interactions: router({
    bookmark: publicProcedure
      .input(z.object({ articleId: z.number(), sessionId: z.string() }))
      .mutation(async ({ input }) => {
        return db.toggleBookmark(input.articleId, input.sessionId);
      }),
    like: publicProcedure
      .input(z.object({ articleId: z.number(), sessionId: z.string() }))
      .mutation(async ({ input }) => {
        return db.toggleLike(input.articleId, input.sessionId);
      }),
    recordView: publicProcedure
      .input(z.object({ articleId: z.number(), sessionId: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.recordView(input.articleId, input.sessionId);
        return { success: true };
      }),
  }),

  // ==================== AI Interactions ====================
  aiInteractions: router({
    list: protectedProcedure
      .input(z.object({ accountId: z.number().optional(), limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listAiInteractions(input?.accountId, input?.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        accountId: z.number(),
        platform: z.string(),
        interactionType: z.string(),
        triggerContent: z.string().optional(),
        aiResponse: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createAiInteraction(input);
      }),
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ input }) => {
        await db.updateAiInteractionStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ==================== Data Loop Suggestions ====================
  dataLoop: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional(), limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listDataLoopSuggestions(input?.status, input?.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        suggestionType: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        dataSource: z.record(z.string(), z.unknown()).optional(),
        confidence: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createDataLoopSuggestion(input);
      }),
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.string(), convertedToTopicId: z.number().optional() }))
      .mutation(async ({ input }) => {
        await db.updateSuggestionStatus(input.id, input.status, input.convertedToTopicId);
        return { success: true };
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
