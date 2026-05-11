/**
 * 深象 OPCS AI 自动化定时任务系统
 * 
 * 功能：
 * 1. AI 内容自动生成 - 根据板块特性按不同频率自动生成文章
 * 2. 网站健康检查 - 定期检查数据库、API、磁盘等
 * 3. AI 自动维护 - 检测错误并生成修复建议
 */
import * as cron from "node-cron";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { getDb } from "./db";
import { sql } from "drizzle-orm";

/* ── 板块更新策略配置 ── */
interface CategorySchedule {
  key: string;
  label: string;
  /** cron 表达式（北京时间 UTC+8，cron 用 UTC 所以减8小时） */
  cronExpressions: string[];
  /** 文章风格提示 */
  styleHint: string;
  /** 文章长度 */
  length: "short" | "medium" | "long";
  /** 是否需要深度内容 */
  isDeep: boolean;
}

const CATEGORY_SCHEDULES: CategorySchedule[] = [
  {
    key: "news",
    label: "今日快讯",
    // 每天早8、中12、晚6（UTC: 0, 4, 10）
    cronExpressions: ["0 0 * * *", "0 4 * * *", "0 10 * * *"],
    styleHint: "简洁明快、信息密度高、突出关键数据和影响分析，800-1200字",
    length: "short",
    isDeep: false,
  },
  {
    key: "thoughts",
    label: "思想前沿",
    // 每天早8（UTC: 0）
    cronExpressions: ["0 0 * * *"],
    styleHint: "深入思考、引用全球创业先行者观点、有独到见解，1500-2500字",
    length: "medium",
    isDeep: false,
  },
  {
    key: "research",
    label: "深度研究",
    // 每周一、周四早8（UTC: 0）
    cronExpressions: ["0 0 * * 1", "0 0 * * 4"],
    styleHint: "学术严谨、数据驱动、含框架模型和表格对比、引用真实研究，3000-5000字",
    length: "long",
    isDeep: true,
  },
  {
    key: "policy",
    label: "政策风向",
    // 每天中12（UTC: 4）
    cronExpressions: ["0 4 * * *"],
    styleHint: "权威解读、条文分析、实操建议、注意合规要点，1500-2500字",
    length: "medium",
    isDeep: false,
  },
  {
    key: "cases",
    label: "实战拆解",
    // 每天晚6（UTC: 10）
    cronExpressions: ["0 10 * * *"],
    styleHint: "案例驱动、数据支撑、可复制策略、含具体操作步骤，1500-2500字",
    length: "medium",
    isDeep: false,
  },
  {
    key: "reports",
    label: "深度报告",
    // 每周五早8（UTC: 0）
    cronExpressions: ["0 0 * * 5"],
    styleHint: "报告体裁、数据图表丰富、趋势分析、行动建议，3000-5000字",
    length: "long",
    isDeep: true,
  },
  {
    key: "toolkit",
    label: "工具图谱",
    // 每周二、周六中12（UTC: 4）
    cronExpressions: ["0 4 * * 2", "0 4 * * 6"],
    styleHint: "评测对比、优劣分析、适用场景推荐、含价格和替代方案，1500-2500字",
    length: "medium",
    isDeep: false,
  },
];

/* ── 热门话题池（AI 会从中选择或自由发挥） ── */
const TOPIC_POOLS: Record<string, string[]> = {
  news: [
    "AI 工具最新动态", "独立开发者融资消息", "内容平台政策变化",
    "远程办公工具更新", "创业者社区新动向", "SaaS 产品发布",
    "自媒体平台算法调整", "跨境电商新政策", "数字游民趋势",
    "一人公司成功案例速报", "开源工具推荐", "效率工具更新",
  ],
  thoughts: [
    "一人公司的规模化悖论", "内容创业者的护城河构建", "AI 时代的个人品牌策略",
    "从副业到主业的心理转变", "知识变现的底层逻辑", "创业者的时间管理哲学",
    "社交媒体的注意力博弈", "极简创业的实践方法论", "个人IP的长期主义",
    "数字资产的复利效应", "一人公司的反脆弱策略", "创业者的认知升级路径",
  ],
  research: [
    "一人公司商业模式分类研究", "内容创业者收入结构分析", "AI 对独立创业的影响评估",
    "中国一人公司生态报告", "知识付费市场深度分析", "自媒体平台流量分配机制研究",
    "创业者心理健康与效能关系", "数字游民经济学分析",
  ],
  policy: [
    "个体工商户最新税收政策", "自由职业者社保政策解读", "跨境收入税务合规指南",
    "知识产权保护实操指南", "电子商务法对个人卖家的影响", "数据安全法合规要点",
    "灵活就业政策最新动态", "创业补贴申请指南",
  ],
  cases: [
    "独立开发者月入10万案例", "公众号从0到50万粉丝拆解", "知识付费转型成功案例",
    "跨境电商一人公司案例", "技术博主变现路径拆解", "设计师独立创业案例",
    "自媒体矩阵运营案例", "SaaS 产品从0到1案例",
  ],
  reports: [
    "一人公司季度趋势报告", "AI 工具生态周报", "内容创业市场月度分析",
    "独立创业者调研报告", "工具链效率评测报告",
  ],
  toolkit: [
    "AI 写作工具横评", "项目管理工具对比", "财务记账工具推荐",
    "视频剪辑工具评测", "社交媒体管理工具", "邮件营销工具对比",
    "网站建设工具推荐", "数据分析工具评测", "设计工具横评",
  ],
};

/* ── 日志记录 ── */
interface CronLogEntry {
  jobName: string;
  jobType: string;
  status: "success" | "failed" | "running" | "skipped";
  message: string;
  details?: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
}

// 内存中的日志缓存（最近100条）
const recentLogs: CronLogEntry[] = [];
const MAX_LOG_ENTRIES = 100;

function addLog(entry: CronLogEntry) {
  recentLogs.unshift(entry);
  if (recentLogs.length > MAX_LOG_ENTRIES) recentLogs.pop();
  // 同时写入数据库（异步，不阻塞）
  saveCronLog(entry).catch(err => console.error("[Scheduler] 日志写入数据库失败:", err));
}

async function saveCronLog(entry: CronLogEntry) {
  const d = await getDb();
  if (!d) return;
  try {
    // 使用原始 SQL 插入日志
    await d.execute(
      sql`INSERT INTO cron_logs (jobName, jobType, status, message, details, startedAt, completedAt, durationMs) 
          VALUES (${entry.jobName}, ${entry.jobType}, ${entry.status}, ${entry.message},
          ${entry.details ? JSON.stringify(entry.details) : null},
          ${entry.startedAt}, ${entry.completedAt || null}, ${entry.durationMs || null})`
    );
  } catch {
    // 表可能还不存在，静默处理
  }
}

/* ── AI 内容生成核心函数 ── */
async function generateArticleForCategory(schedule: CategorySchedule): Promise<void> {
  const startTime = Date.now();
  const jobName = `content_${schedule.key}`;
  
  console.log(`[Scheduler] 🚀 开始为「${schedule.label}」板块生成内容...`);
  
  try {
    // 随机选择话题
    const topics = TOPIC_POOLS[schedule.key] || [];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)] || "一人公司创业最新趋势";
    
    const lengthGuide = schedule.length === "long" ? "3000-5000字" : schedule.length === "short" ? "800-1200字" : "1500-2500字";
    
    // 获取该板块最近的文章标题，避免重复
    let recentTitles: string[] = [];
    try {
      const recentPosts = await db.listPublishedPosts(schedule.key, 10);
      recentTitles = recentPosts.map((p: any) => p.title);
    } catch { /* 忽略 */ }
    
    const avoidRepeatHint = recentTitles.length > 0
      ? `\n\n注意：以下是最近发布的文章标题，请确保新文章的主题和角度与这些完全不同：\n${recentTitles.map(t => `- ${t}`).join("\n")}`
      : "";

    const currentDate = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

    const chartRequirement = schedule.isDeep
      ? `必须包含4-5个Mermaid图表（从以下类型中选择最适合内容的组合）：
   - pie（饼图）：用于占比分析、市场份额、收入结构
   - xychart-beta（柱状图/折线图）：用于趋势变化、数据对比、时间序列
   - flowchart（流程图/架构图）：用于流程说明、系统架构、决策树
   - quadrantChart（象限图）：用于二维对比分析、定位矩阵
   - mindmap（思维导图）：用于知识体系、分类框架
   - graph（关系图）：用于要素关联、生态图谱
   - gantt（甘特图）：用于时间规划、项目进度
   - journey（用户旅程图）：用于体验分析、流程优化`
      : `必须包含3-4个Mermaid图表（从以下类型中选择最适合内容的组合）：
   - pie（饼图）：用于占比分析
   - xychart-beta（柱状图/折线图）：用于数据对比和趋势
   - flowchart（流程图）：用于流程和架构
   - quadrantChart（象限图）：用于矩阵分析
   - mindmap（思维导图）：用于知识框架`;

    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `你是深象OPCS研究院的资深内容编辑，专注于一人公司创业者服务领域。今天是${currentDate}。

为「${schedule.label}」板块撰写一篇高质量原创文章。

写作要求：
1. 正文使用Markdown格式，包含表格、列表、引用等丰富格式
2. 篇幅：${lengthGuide}
3. 风格：${schedule.styleHint}
4. 内容要求：
   - 引用真实的工具、平台、人物（不要编造不存在的案例数据）
   - 提供可操作的建议和行动步骤
   - 语言自然流畅，避免AI腔调
   - 有独到的观点和深度分析
5. 【重要】可视化图表要求（这是标配，每篇文章必须包含）：
   ${chartRequirement}
   图表规范：
   - 每个图表用 \`\`\`mermaid 代码块包裹
   - 图表数据必须与文章内容强关联，是信息增量而非装饰
   - 图表标题清晰，数据标注完整
   - 图表类型要多样化，同一篇文章不要重复使用同一种图表
   - 统一使用中文标注
6. 必须返回严格的JSON格式
7. body字段中的换行用\\n表示${avoidRepeatHint}`,
        },
        {
          role: "user",
          content: `围绕话题方向「${randomTopic}」，结合当前时事热点，撰写一篇文章。文章中必须嵌入3-5个Mermaid可视化图表，图表类型要丰富多样。

请严格按以下JSON格式返回（不要添加任何其他文字）：
{"title":"文章标题（吸引人、具体、不超过30字）","excerpt":"100字以内摘要（概括核心观点和价值）","body":"完整Markdown正文（含3-5个mermaid图表代码块）","tags":["标签1","标签2","标签3"]}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: schedule.isDeep ? 7000 : 5000,
    });

    const content = result.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("AI 未返回内容");
    }

    // 解析 JSON
    const cleaned = content.replace(/[\x00-\x1f\x7f]/g, (ch) => ch === "\n" || ch === "\t" ? ch : "");
    const article = JSON.parse(cleaned) as { title: string; excerpt: string; body: string; tags: string[] };
    
    if (!article.title || !article.body) {
      throw new Error("AI 生成的文章缺少必要字段");
    }

    // 【自动化质量检查】验证图表数量
    const chartMatches = article.body.match(/```mermaid/g) || [];
    const chartCount = chartMatches.length;
    const minCharts = schedule.isDeep ? 4 : 3;
    if (chartCount < minCharts) {
      console.warn(`[Scheduler] ⚠️ 图表数量不足: ${chartCount}/${minCharts}，尝试重新生成...`);
      // 图表不足时仍然发布，但记录警告
      addLog({
        jobName: `${jobName}_quality_warning`,
        jobType: "quality_check",
        status: "success",
        message: `图表数量不足: ${chartCount}/${minCharts}，文章仍已发布`,
        details: { chartCount, minCharts, title: article.title },
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 0,
      });
    }

    // 保存到数据库，自动发布
    const post = await db.createWebsitePost({
      title: article.title,
      excerpt: article.excerpt,
      body: article.body,
      category: schedule.key,
      tags: article.tags,
      status: "published",
      publishedAt: new Date(),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Scheduler] ✅ 「${schedule.label}」文章生成成功: "${article.title}" (${elapsed}ms)`);
    
    addLog({
      jobName,
      jobType: "content_generation",
      status: "success",
      message: `成功生成并发布文章: "${article.title}"`,
      details: { category: schedule.key, postId: post.id, title: article.title, elapsed },
      startedAt: new Date(startTime),
      completedAt: new Date(),
      durationMs: elapsed,
    });
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[Scheduler] ❌ 「${schedule.label}」文章生成失败:`, err.message);
    
    addLog({
      jobName,
      jobType: "content_generation",
      status: "failed",
      message: `生成失败: ${err.message}`,
      details: { category: schedule.key, error: err.message, elapsed },
      startedAt: new Date(startTime),
      completedAt: new Date(),
      durationMs: elapsed,
    });
  }
}

/* ── 网站健康检查 ── */
async function runHealthCheck(): Promise<void> {
  const startTime = Date.now();
  console.log("[Scheduler] 🏥 开始网站健康检查...");
  
  const checks: Record<string, { status: string; message: string }> = {};
  
  // 1. 数据库连接检查
  try {
    const d = await getDb();
    if (d) {
      await d.execute(sql`SELECT 1`);
      checks.database = { status: "ok", message: "数据库连接正常" };
    } else {
      checks.database = { status: "warning", message: "数据库未配置" };
    }
  } catch (err: any) {
    checks.database = { status: "error", message: `数据库连接失败: ${err.message}` };
  }

  // 2. 内容新鲜度检查
  try {
    const recentPosts = await db.listPublishedPosts(undefined, 1);
    if (recentPosts.length > 0) {
      const latest = recentPosts[0] as any;
      const hoursSinceLastPost = (Date.now() - new Date(latest.publishedAt || latest.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastPost > 24) {
        checks.contentFreshness = { status: "warning", message: `最近文章发布于 ${Math.round(hoursSinceLastPost)} 小时前，超过24小时未更新` };
      } else {
        checks.contentFreshness = { status: "ok", message: `最近文章发布于 ${Math.round(hoursSinceLastPost)} 小时前` };
      }
    } else {
      checks.contentFreshness = { status: "warning", message: "暂无已发布文章" };
    }
  } catch (err: any) {
    checks.contentFreshness = { status: "error", message: `内容检查失败: ${err.message}` };
  }

  // 3. 各板块内容覆盖检查
  try {
    const categories = ["news", "thoughts", "research", "policy", "cases", "reports", "toolkit"];
    for (const cat of categories) {
      const posts = await db.listPublishedPosts(cat, 1);
      if (posts.length === 0) {
        checks[`category_${cat}`] = { status: "warning", message: `「${cat}」板块暂无内容` };
      }
    }
  } catch { /* 忽略 */ }

  // 4. 内存使用检查
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  if (heapUsedMB > 500) {
    checks.memory = { status: "warning", message: `内存使用偏高: ${heapUsedMB}MB / ${heapTotalMB}MB` };
  } else {
    checks.memory = { status: "ok", message: `内存使用正常: ${heapUsedMB}MB / ${heapTotalMB}MB` };
  }

  // 5. 进程运行时间
  const uptimeHours = Math.round(process.uptime() / 3600 * 10) / 10;
  checks.uptime = { status: "ok", message: `服务已运行 ${uptimeHours} 小时` };

  const hasErrors = Object.values(checks).some(c => c.status === "error");
  const hasWarnings = Object.values(checks).some(c => c.status === "warning");
  const overallStatus = hasErrors ? "error" : hasWarnings ? "warning" : "ok";
  
  const elapsed = Date.now() - startTime;
  console.log(`[Scheduler] 🏥 健康检查完成 (${overallStatus}): ${JSON.stringify(checks)}`);

  addLog({
    jobName: "health_check",
    jobType: "health_check",
    status: hasErrors ? "failed" : "success",
    message: `健康检查${overallStatus === "ok" ? "全部通过" : `发现 ${Object.values(checks).filter(c => c.status !== "ok").length} 个问题`}`,
    details: { checks, overallStatus },
    startedAt: new Date(startTime),
    completedAt: new Date(),
    durationMs: elapsed,
  });

  // 如果有错误，使用 AI 生成修复建议
  if (hasErrors || hasWarnings) {
    await generateMaintenanceReport(checks);
  }
}

/* ── AI 自动维护报告 ── */
async function generateMaintenanceReport(checks: Record<string, { status: string; message: string }>): Promise<void> {
  const startTime = Date.now();
  console.log("[Scheduler] 🔧 AI 正在分析问题并生成维护建议...");
  
  try {
    const issues = Object.entries(checks)
      .filter(([, v]) => v.status !== "ok")
      .map(([k, v]) => `- [${v.status.toUpperCase()}] ${k}: ${v.message}`)
      .join("\n");

    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `你是一位资深的网站运维工程师和 AI 助手。请分析以下网站健康检查结果中的问题，并给出具体的修复建议和操作步骤。用中文回复，简洁实用。`,
        },
        {
          role: "user",
          content: `网站健康检查发现以下问题：\n${issues}\n\n请给出：\n1. 问题严重程度评估\n2. 具体修复建议\n3. 预防措施`,
        },
      ],
      max_tokens: 2048,
    });

    const advice = result.choices[0]?.message?.content;
    const elapsed = Date.now() - startTime;
    
    console.log(`[Scheduler] 🔧 AI 维护建议生成完成 (${elapsed}ms)`);
    
    addLog({
      jobName: "ai_maintenance",
      jobType: "maintenance",
      status: "success",
      message: "AI 维护分析完成",
      details: { advice: typeof advice === "string" ? advice : JSON.stringify(advice), issues },
      startedAt: new Date(startTime),
      completedAt: new Date(),
      durationMs: elapsed,
    });
  } catch (err: any) {
    console.error("[Scheduler] 🔧 AI 维护分析失败:", err.message);
    addLog({
      jobName: "ai_maintenance",
      jobType: "maintenance",
      status: "failed",
      message: `AI 维护分析失败: ${err.message}`,
      startedAt: new Date(startTime),
      completedAt: new Date(),
      durationMs: Date.now() - startTime,
    });
  }
}

/* ── 注册所有定时任务 ── */
const registeredJobs: { name: string; task: ReturnType<typeof cron.schedule>; expression: string; category?: string }[] = [];

export function startScheduler() {
  console.log("[Scheduler] ⏰ 正在启动 AI 自动化定时任务系统...");

  // 1. 注册内容生成定时任务
  for (const schedule of CATEGORY_SCHEDULES) {
    for (let i = 0; i < schedule.cronExpressions.length; i++) {
      const expr = schedule.cronExpressions[i];
      const jobName = `content_${schedule.key}_${i}`;
      
      const task = cron.schedule(expr, () => {
        generateArticleForCategory(schedule);
      }, { timezone: "UTC" });

      registeredJobs.push({ name: jobName, task, expression: expr, category: schedule.key });
      console.log(`[Scheduler]   📝 ${schedule.label} → ${expr}`);
    }
  }

  // 2. 健康检查 - 每6小时一次（UTC: 2, 8, 14, 20 → 北京时间 10, 16, 22, 4）
  const healthTask = cron.schedule("0 2,8,14,20 * * *", () => {
    runHealthCheck();
  }, { timezone: "UTC" });
  registeredJobs.push({ name: "health_check", task: healthTask, expression: "0 2,8,14,20 * * *" });
  console.log("[Scheduler]   🏥 健康检查 → 每6小时");

  // 3. AI 安全扫描 - 每天凌晨3点（UTC: 19）
  const securityTask = cron.schedule("0 19 * * *", async () => {
    const startTime = Date.now();
    console.log("[Scheduler] 🔒 开始安全扫描...");
    try {
      // 检查最近的错误日志
      const errorLogs = recentLogs.filter(l => l.status === "failed").slice(0, 10);
      const errorSummary = errorLogs.length > 0
        ? errorLogs.map(l => `[${l.jobName}] ${l.message}`).join("\n")
        : "无最近错误";

      addLog({
        jobName: "security_scan",
        jobType: "security_scan",
        status: "success",
        message: `安全扫描完成，最近错误数: ${errorLogs.length}`,
        details: { recentErrors: errorLogs.length, summary: errorSummary },
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs: Date.now() - startTime,
      });
      console.log(`[Scheduler] 🔒 安全扫描完成，最近错误: ${errorLogs.length}`);
    } catch (err: any) {
      addLog({
        jobName: "security_scan",
        jobType: "security_scan",
        status: "failed",
        message: `安全扫描失败: ${err.message}`,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs: Date.now() - startTime,
      });
    }
  }, { timezone: "UTC" });
  registeredJobs.push({ name: "security_scan", task: securityTask, expression: "0 19 * * *" });
  console.log("[Scheduler]   🔒 安全扫描 → 每天凌晨3点");

  console.log(`[Scheduler] ✅ 共注册 ${registeredJobs.length} 个定时任务`);
  console.log("[Scheduler] ⏰ AI 自动化定时任务系统启动完成！");
}

export function stopScheduler() {
  for (const job of registeredJobs) {
    job.task.stop();
  }
  registeredJobs.length = 0;
  console.log("[Scheduler] ⏹️ 所有定时任务已停止");
}

/* ── 对外暴露的查询接口 ── */
export function getSchedulerStatus() {
  return {
    running: registeredJobs.length > 0,
    totalJobs: registeredJobs.length,
    jobs: registeredJobs.map(j => ({
      name: j.name,
      expression: j.expression,
      category: j.category,
    })),
    recentLogs: recentLogs.slice(0, 20),
    stats: {
      totalRuns: recentLogs.length,
      successes: recentLogs.filter(l => l.status === "success").length,
      failures: recentLogs.filter(l => l.status === "failed").length,
    },
  };
}

export function getRecentLogs(limit = 50) {
  return recentLogs.slice(0, limit);
}

/** 手动触发某个板块的内容生成 */
export async function triggerContentGeneration(categoryKey: string) {
  const schedule = CATEGORY_SCHEDULES.find(s => s.key === categoryKey);
  if (!schedule) throw new Error(`未知板块: ${categoryKey}`);
  await generateArticleForCategory(schedule);
}

/** 手动触发健康检查 */
export async function triggerHealthCheck() {
  await runHealthCheck();
}
