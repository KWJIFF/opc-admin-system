/**
 * 深象 × OPCS 官网内容板块配置
 */

/* ── 板块定义 ── */
export interface SiteCategory {
  key: string;
  label: string;
  tag: string;
  path: string;
  iconName: string;
  desc: string;
  order: number;
  enabled: boolean;
}

export const SITE_CATEGORIES: SiteCategory[] = [
  { key: "news",     label: "今日快讯", tag: "NEWS",     path: "/site/news",      iconName: "Newspaper",    desc: "围绕一人公司、独立创业与内容行业的结构化快讯。",           order: 1, enabled: true },
  { key: "thoughts", label: "思想前沿", tag: "THOUGHTS", path: "/site/thoughts",  iconName: "Brain",        desc: "汇聚全球创业先行者的前沿思考、核心观点与实践方法论。",     order: 2, enabled: true },
  { key: "research", label: "深度研究", tag: "RESEARCH", path: "/site/research",  iconName: "BookOpen",     desc: "沉淀 OPC 方法论、概念框架、行业模型与长期研究判断。",     order: 3, enabled: true },
  { key: "policy",   label: "政策风向", tag: "POLICY",   path: "/site/policy",    iconName: "Scale",        desc: "跟踪与一人公司、个体经营和创业相关的政策与法规动态。",     order: 4, enabled: true },
  { key: "cases",    label: "实战拆解", tag: "CASES",    path: "/site/cases",     iconName: "Target",       desc: "拆解真实创业案例、增长路径、商业模型与可复制策略。",       order: 5, enabled: true },
  { key: "reports",  label: "深度报告", tag: "REPORTS",  path: "/site/reports",   iconName: "FileBarChart", desc: "行业周报、月报与专题研究报告的长期资产库。",               order: 6, enabled: true },
  { key: "videos",   label: "视频专区", tag: "VIDEOS",   path: "/site/videos",    iconName: "Play",         desc: "创业实战视频、工具演示、深度访谈与短视频精选。",           order: 7, enabled: true },
  { key: "podcasts", label: "播客频道", tag: "PODCASTS", path: "/site/podcasts",  iconName: "Headphones",   desc: "一人公司创业者的深度对话、行业洞察与经验分享。",           order: 8, enabled: true },
  { key: "toolkit",  label: "工具图谱", tag: "TOOLKIT",  path: "/site/toolkit",   iconName: "Wrench",       desc: "一人公司全链路工具链评测、组合方案与效率指南。",           order: 9, enabled: true },
];

export function getEnabledCategories(): SiteCategory[] {
  return SITE_CATEGORIES.filter((c) => c.enabled).sort((a, b) => a.order - b.order);
}

export function getCategoryByKey(key: string): SiteCategory | undefined {
  return SITE_CATEGORIES.find((c) => c.key === key);
}

/* ── 内容类型 ── */
export type ContentMediaType = "article" | "video" | "podcast" | "report" | "tool_review" | "short_post";

/* ── 文章类型（扩展支持多媒体） ── */
export interface SiteArticle {
  id: number;
  title: string;
  summary: string;
  content?: string;
  author: string;
  date: string;
  readTime: string;
  categoryKey: string;
  tags: string[];
  featured?: boolean;
  mediaType?: ContentMediaType;
  videoUrl?: string;
  audioUrl?: string;
  coverImage?: string;
  downloadUrl?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  duration?: number;
}

/* ── Mock 数据 ── */
export const MOCK_ARTICLES: SiteArticle[] = [
  // NEWS
  { id: 101, title: "通义千问 3.0 发布：一人公司如何用好新一代 AI 能力", summary: "阿里云发布通义千问 3.0，在代码生成、长文本理解和多模态方面大幅提升。本文分析一人公司创业者可以如何利用这些新能力优化内容生产流程。", author: "深象研究院", date: "2026-04-09", readTime: "5 分钟", categoryKey: "news", tags: ["AI", "通义千问"], featured: true, mediaType: "article", viewCount: 3420, likeCount: 128, commentCount: 23 },
  { id: 102, title: "Stripe 推出 Solopreneur 计划：零月费开启全球收款", summary: "Stripe 宣布面向个人创业者的全新定价方案，取消月费门槛，支持 135 个国家的本地支付方式。", author: "深象研究院", date: "2026-04-08", readTime: "3 分钟", categoryKey: "news", tags: ["支付", "Stripe"], mediaType: "article", viewCount: 2180, likeCount: 89, commentCount: 15 },
  { id: 103, title: "Notion 收购 Cron，日历+笔记一体化时代来临", summary: "Notion 正式完成对 Cron 日历的整合，推出 Notion Calendar 2.0，为一人公司提供更完整的工作流。", author: "深象研究院", date: "2026-04-07", readTime: "4 分钟", categoryKey: "news", tags: ["工具", "Notion"], mediaType: "article", viewCount: 1850, likeCount: 67, commentCount: 11 },
  { id: 104, title: "GitHub Copilot Workspace 正式开放：从 Issue 到 PR 全自动", summary: "GitHub 宣布 Copilot Workspace 面向所有用户开放，支持从 Issue 描述自动生成完整的代码变更。", author: "深象研究院", date: "2026-04-06", readTime: "4 分钟", categoryKey: "news", tags: ["AI", "开发工具"], mediaType: "article", viewCount: 2650, likeCount: 112, commentCount: 19 },

  // THOUGHTS
  { id: 201, title: "Dan Koe 的内容飞轮：如何用一套系统同时运营 5 个平台", summary: "Dan Koe 提出的一次创作五次分发方法论正在被越来越多的独立创业者采用。本文深度解读他的内容飞轮模型，以及如何在中国市场落地。", author: "深象研究院", date: "2026-04-08", readTime: "12 分钟", categoryKey: "thoughts", tags: ["Dan Koe", "内容策略"], featured: true, mediaType: "article", viewCount: 5680, likeCount: 342, commentCount: 56 },
  { id: 202, title: "Naval Ravikant：杠杆的四种形式与一人公司的本质", summary: "Naval 关于不需要许可的杠杆的思考，为什么代码和媒体是一人公司最强大的武器。", author: "深象研究院", date: "2026-04-06", readTime: "10 分钟", categoryKey: "thoughts", tags: ["Naval", "杠杆理论"], mediaType: "article", viewCount: 4120, likeCount: 256, commentCount: 38 },
  { id: 203, title: "Justin Welsh：从 0 到百万美元的 LinkedIn 增长公式", summary: "Justin Welsh 用 LinkedIn 单平台实现年收入超百万美元。拆解他的内容模板、发布节奏和变现路径。", author: "深象研究院", date: "2026-04-04", readTime: "8 分钟", categoryKey: "thoughts", tags: ["Justin Welsh", "LinkedIn"], mediaType: "article", viewCount: 3890, likeCount: 198, commentCount: 31 },
  { id: 204, title: "Sahil Lavingia：Gumroad 创始人谈极简创业哲学", summary: "Sahil 分享了他如何将 Gumroad 从一家风投支持的初创公司转型为一家盈利的小型企业的心路历程。", author: "深象研究院", date: "2026-04-02", readTime: "9 分钟", categoryKey: "thoughts", tags: ["Sahil Lavingia", "极简创业"], mediaType: "article", viewCount: 2780, likeCount: 167, commentCount: 24 },

  // RESEARCH
  { id: 301, title: "OPC 方法论 1.0：一人公司的系统化运营框架", summary: "深象科技原创研究成果。从定位、内容、分发、变现四个维度构建一人公司的完整运营方法论，附可落地的执行清单。", author: "深象研究院", date: "2026-04-09", readTime: "20 分钟", categoryKey: "research", tags: ["方法论", "框架"], featured: true, mediaType: "article", viewCount: 8920, likeCount: 567, commentCount: 89 },
  { id: 302, title: "内容创业者的注意力经济学：从流量思维到信任资本", summary: "为什么传统的流量漏斗模型不适用于一人公司？本文提出信任资本概念，重新定义内容创业的价值衡量体系。", author: "深象研究院", date: "2026-04-05", readTime: "15 分钟", categoryKey: "research", tags: ["注意力经济", "信任资本"], mediaType: "article", viewCount: 4560, likeCount: 289, commentCount: 42 },
  { id: 303, title: "AI 原生内容生产：从辅助工具到核心生产力的范式转移", summary: "深度分析 AI 如何从辅助写作进化为原生内容生产，以及这对一人公司意味着什么。", author: "深象研究院", date: "2026-04-03", readTime: "18 分钟", categoryKey: "research", tags: ["AI", "内容生产"], mediaType: "article", viewCount: 6340, likeCount: 412, commentCount: 67 },

  // POLICY
  { id: 401, title: "个体工商户税收优惠政策汇编（2026年Q2更新）", summary: "系统梳理 2026 年第二季度适用于个体工商户和一人公司的税收优惠政策，包括增值税减免、所得税核定征收等最新变化。", author: "深象研究院", date: "2026-04-07", readTime: "8 分钟", categoryKey: "policy", tags: ["税收", "个体工商户"], featured: true, mediaType: "article", viewCount: 3210, likeCount: 145, commentCount: 28 },
  { id: 402, title: "《促进个体经济发展条例》解读：利好与注意事项", summary: "国务院新出台的条例对个体经营者意味着什么？逐条解读关键条款和实操建议。", author: "深象研究院", date: "2026-04-04", readTime: "10 分钟", categoryKey: "policy", tags: ["法规", "个体经济"], mediaType: "article", viewCount: 2450, likeCount: 98, commentCount: 17 },
  { id: 403, title: "跨境收款合规指南：一人公司如何合法接收海外收入", summary: "从外汇管理到税务申报，为有海外客户的一人公司提供完整的合规操作指南。", author: "深象研究院", date: "2026-04-01", readTime: "12 分钟", categoryKey: "policy", tags: ["跨境", "合规"], mediaType: "article", viewCount: 4890, likeCount: 234, commentCount: 45 },

  // CASES
  { id: 501, title: "从 0 到月入 10 万：一位独立开发者的 SaaS 增长拆解", summary: "张明用 6 个月时间将一款面向设计师的 SaaS 工具从零做到月收入 10 万。完整复盘他的产品定位、获客策略和定价模型。", author: "深象研究院", date: "2026-04-06", readTime: "15 分钟", categoryKey: "cases", tags: ["SaaS", "独立开发"], featured: true, mediaType: "article", viewCount: 7230, likeCount: 456, commentCount: 78 },
  { id: 502, title: "一个人运营 50 万粉丝公众号的秘密：自动化工作流全揭秘", summary: "李薇分享她如何用 AI + 自动化工具链，一个人高效运营多个内容平台。", author: "深象研究院", date: "2026-04-03", readTime: "12 分钟", categoryKey: "cases", tags: ["公众号", "自动化"], mediaType: "article", viewCount: 5670, likeCount: 345, commentCount: 56 },
  { id: 503, title: "知识付费转型记：从卖课到卖服务的商业模式升级", summary: "王浩从年入 30 万的课程卖家转型为年入 200 万的咨询服务商，拆解他的转型路径。", author: "深象研究院", date: "2026-03-30", readTime: "10 分钟", categoryKey: "cases", tags: ["知识付费", "商业模式"], mediaType: "article", viewCount: 4120, likeCount: 267, commentCount: 41 },

  // REPORTS
  { id: 601, title: "2026年一人公司趋势报告：从副业到主业的范式转移", summary: "深象科技年度旗舰报告。基于对 500+ 一人公司创业者的调研，揭示 2026 年最重要的 10 个趋势。", author: "深象研究院", date: "2026-04-09", readTime: "30 分钟", categoryKey: "reports", tags: ["年度报告", "趋势"], featured: true, mediaType: "report", downloadUrl: "#", viewCount: 12450, likeCount: 890, commentCount: 134 },
  { id: 602, title: "一人公司周报 Vol.15：AI Agent 爆发周", summary: "本周要闻：OpenAI 发布 Agent SDK、Google 推出 Project Mariner、微软 Copilot Studio 更新。", author: "深象研究院", date: "2026-04-07", readTime: "8 分钟", categoryKey: "reports", tags: ["周报", "AI"], mediaType: "report", viewCount: 3560, likeCount: 178, commentCount: 29 },
  { id: 603, title: "2026年Q1 一人公司工具生态报告", summary: "对 200+ 工具的系统评测，覆盖内容创作、项目管理、财务、营销四大类别。", author: "深象研究院", date: "2026-04-01", readTime: "25 分钟", categoryKey: "reports", tags: ["季报", "工具"], mediaType: "report", downloadUrl: "#", viewCount: 6780, likeCount: 423, commentCount: 67 },

  // VIDEOS
  { id: 801, title: "一人公司工具链实战演示：从 0 搭建自动化内容工作流", summary: "手把手演示如何用 Notion + Zapier + ChatGPT 搭建一套自动化内容生产和分发工作流，全程实操录屏。", author: "深象研究院", date: "2026-04-09", readTime: "18 分钟", categoryKey: "videos", tags: ["工具链", "自动化", "实操"], featured: true, mediaType: "video", videoUrl: "https://www.bilibili.com/video/demo1", duration: 1080, viewCount: 15600, likeCount: 1230, commentCount: 189 },
  { id: 802, title: "Cursor AI 编程实战：30 分钟开发一个 SaaS 产品原型", summary: "用 Cursor 从零开始开发一个完整的 SaaS 产品原型，展示 AI 辅助编程的真实效率。", author: "深象研究院", date: "2026-04-07", readTime: "32 分钟", categoryKey: "videos", tags: ["Cursor", "AI编程", "SaaS"], mediaType: "video", videoUrl: "https://www.bilibili.com/video/demo2", duration: 1920, viewCount: 23400, likeCount: 2100, commentCount: 345 },
  { id: 803, title: "独立创业者的一天：时间管理与深度工作实录", summary: "跟拍一位年收入百万的独立创业者的真实工作日，看他如何分配时间、管理精力和保持高产出。", author: "深象研究院", date: "2026-04-05", readTime: "15 分钟", categoryKey: "videos", tags: ["时间管理", "深度工作", "Vlog"], mediaType: "video", videoUrl: "https://www.bilibili.com/video/demo3", duration: 900, viewCount: 18900, likeCount: 1560, commentCount: 267 },
  { id: 804, title: "小红书爆款笔记拆解：3 个月涨粉 10 万的方法论", summary: "深度拆解 3 个小红书账号从 0 到 10 万粉丝的增长路径，总结可复制的内容策略和运营技巧。", author: "深象研究院", date: "2026-04-03", readTime: "22 分钟", categoryKey: "videos", tags: ["小红书", "增长", "运营"], mediaType: "video", videoUrl: "https://www.bilibili.com/video/demo4", duration: 1320, viewCount: 28700, likeCount: 2890, commentCount: 456 },

  // PODCASTS
  { id: 901, title: "EP.12 对话独立开发者张明：从大厂离职到月入 10 万的 SaaS 之路", summary: "本期嘉宾张明分享了他离开大厂后，如何用 6 个月时间从零打造一款盈利的 SaaS 产品。", author: "深象研究院", date: "2026-04-08", readTime: "45 分钟", categoryKey: "podcasts", tags: ["独立开发", "SaaS", "创业故事"], featured: true, mediaType: "podcast", audioUrl: "#podcast-ep12", duration: 2700, viewCount: 8900, likeCount: 567, commentCount: 89 },
  { id: 902, title: "EP.11 AI 时代的内容创业：机会、陷阱与方法论", summary: "深象研究院团队内部圆桌讨论：AI 到底是内容创业者的朋友还是敌人？", author: "深象研究院", date: "2026-04-04", readTime: "38 分钟", categoryKey: "podcasts", tags: ["AI", "内容创业", "圆桌"], mediaType: "podcast", audioUrl: "#podcast-ep11", duration: 2280, viewCount: 6700, likeCount: 423, commentCount: 67 },
  { id: 903, title: "EP.10 一人公司的财务自由之路：从记账到资产配置", summary: "邀请理财规划师李明聊一人公司创业者的财务管理。", author: "深象研究院", date: "2026-03-28", readTime: "52 分钟", categoryKey: "podcasts", tags: ["财务", "理财", "税务"], mediaType: "podcast", audioUrl: "#podcast-ep10", duration: 3120, viewCount: 5400, likeCount: 345, commentCount: 56 },

  // TOOLKIT
  { id: 701, title: "2026 年一人公司必备工具链：从 0 到 1 的完整配置方案", summary: "为不同阶段的一人公司创业者推荐最优工具组合，包含免费方案和付费进阶方案。", author: "深象研究院", date: "2026-04-08", readTime: "15 分钟", categoryKey: "toolkit", tags: ["工具链", "配置方案"], featured: true, mediaType: "tool_review", viewCount: 9870, likeCount: 678, commentCount: 112 },
  { id: 702, title: "Cursor vs Windsurf vs Copilot：AI 编程工具横评", summary: "三大 AI 编程助手的深度对比评测，从代码补全、上下文理解、价格三个维度给出推荐。", author: "深象研究院", date: "2026-04-05", readTime: "12 分钟", categoryKey: "toolkit", tags: ["AI编程", "评测"], mediaType: "tool_review", viewCount: 7650, likeCount: 534, commentCount: 89 },
  { id: 703, title: "Notion vs Obsidian vs Logseq：知识管理工具终极对比", summary: "三款主流知识管理工具的使用场景、优劣势和适用人群分析。", author: "深象研究院", date: "2026-04-02", readTime: "10 分钟", categoryKey: "toolkit", tags: ["知识管理", "评测"], mediaType: "tool_review", viewCount: 6230, likeCount: 412, commentCount: 67 },
];

export function getArticlesByCategory(categoryKey: string): SiteArticle[] {
  return MOCK_ARTICLES.filter((a) => a.categoryKey === categoryKey);
}

export function getLatestArticles(limit = 5): SiteArticle[] {
  return [...MOCK_ARTICLES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
}

export function getArticleById(id: number): SiteArticle | undefined {
  return MOCK_ARTICLES.find((a) => a.id === id);
}

export function getTrendingArticles(limit = 5): SiteArticle[] {
  return [...MOCK_ARTICLES].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, limit);
}

export function getFeaturedArticles(limit = 5): SiteArticle[] {
  return MOCK_ARTICLES.filter((a) => a.featured).slice(0, limit);
}

export function getArticlesByMediaType(mediaType: ContentMediaType, limit?: number): SiteArticle[] {
  const filtered = MOCK_ARTICLES.filter((a) => a.mediaType === mediaType);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getRelatedArticles(articleId: number, limit = 4): SiteArticle[] {
  const article = getArticleById(articleId);
  if (!article) return [];
  const sameCat = MOCK_ARTICLES.filter((a) => a.id !== articleId && a.categoryKey === article.categoryKey);
  const tagSet = new Set(article.tags);
  const crossCat = MOCK_ARTICLES.filter((a) => a.id !== articleId && a.categoryKey !== article.categoryKey && a.tags.some((t) => tagSet.has(t)));
  return [...sameCat, ...crossCat].slice(0, limit);
}

/* ── 行业趋势数据 ── */
export interface TrendDataPoint { label: string; value: number; change: number; }

export const TREND_DATA = {
  hotKeywords: [
    { text: "AI Agent", weight: 95 }, { text: "一人公司", weight: 88 }, { text: "内容飞轮", weight: 82 },
    { text: "独立开发", weight: 78 }, { text: "SaaS", weight: 75 }, { text: "自动化", weight: 72 },
    { text: "知识付费", weight: 68 }, { text: "个人品牌", weight: 65 }, { text: "远程办公", weight: 62 },
    { text: "被动收入", weight: 58 }, { text: "Solopreneur", weight: 55 }, { text: "数字游民", weight: 52 },
    { text: "副业变现", weight: 48 }, { text: "Cursor", weight: 45 }, { text: "内容创业", weight: 42 },
  ],
  industryMetrics: [
    { label: "全球一人公司数量", value: 3800, change: 23.5 },
    { label: "AI 工具采用率", value: 78, change: 15.2 },
    { label: "平均月收入(万元)", value: 4.2, change: 8.7 },
    { label: "内容创业者增长率", value: 34, change: 12.1 },
  ] as TrendDataPoint[],
  weeklyGrowth: [
    { week: "W1", articles: 12, views: 45000 }, { week: "W2", articles: 15, views: 52000 },
    { week: "W3", articles: 18, views: 61000 }, { week: "W4", articles: 14, views: 58000 },
    { week: "W5", articles: 20, views: 72000 }, { week: "W6", articles: 22, views: 85000 },
  ],
};

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}W`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
