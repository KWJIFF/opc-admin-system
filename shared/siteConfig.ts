/**
 * 深象 OPCS 官网内容板块配置
 *
 * 架构说明：
 * - 所有板块定义集中在此文件，前台展示和后台管理共享同一份配置
 * - 新增板块只需在 SITE_CATEGORIES 中追加一条记录
 * - Mock 数据后续可替换为 tRPC 接口，组件层无需改动
 * - icon 字段使用 lucide-react 图标名称字符串，前端按需映射为组件
 */

/* ── 板块定义 ── */
export interface SiteCategory {
  /** 唯一标识，用于路由和数据关联 */
  key: string;
  /** 中文名称 */
  label: string;
  /** 英文标签（大写） */
  tag: string;
  /** 前台路由路径 */
  path: string;
  /** lucide-react 图标名称 */
  iconName: string;
  /** 板块描述 */
  desc: string;
  /** 板块排序权重（越小越靠前） */
  order: number;
  /** 是否启用 */
  enabled: boolean;
}

export const SITE_CATEGORIES: SiteCategory[] = [
  { key: "news",     label: "今日快讯", tag: "NEWS",     path: "/site/news",      iconName: "Newspaper",    desc: "围绕一人公司、独立创业与内容行业的结构化快讯。",                         order: 1, enabled: true },
  { key: "thoughts", label: "思想前沿", tag: "THOUGHTS", path: "/site/thoughts",  iconName: "Brain",        desc: "汇聚全球创业先行者的前沿思考、核心观点与实践方法论。",                   order: 2, enabled: true },
  { key: "research", label: "深度研究", tag: "RESEARCH", path: "/site/research",  iconName: "BookOpen",     desc: "沉淀 OPC 方法论、概念框架、行业模型与长期研究判断。",                   order: 3, enabled: true },
  { key: "policy",   label: "政策风向", tag: "POLICY",   path: "/site/policy",    iconName: "Scale",        desc: "跟踪与一人公司、个体经营和创业相关的政策与法规动态。",                   order: 4, enabled: true },
  { key: "cases",    label: "实战拆解", tag: "CASES",    path: "/site/cases",     iconName: "Target",       desc: "拆解真实创业案例、增长路径、商业模型与可复制策略。",                     order: 5, enabled: true },
  { key: "reports",  label: "深度报告", tag: "REPORTS",  path: "/site/reports",   iconName: "FileBarChart", desc: "行业周报、月报与专题研究报告的长期资产库。",                             order: 6, enabled: true },
  { key: "toolkit",  label: "工具图谱", tag: "TOOLKIT",  path: "/site/toolkit",   iconName: "Wrench",       desc: "一人公司全链路工具链评测、组合方案与效率指南。",                         order: 7, enabled: true },
];

/** 获取已启用的板块（按 order 排序） */
export function getEnabledCategories(): SiteCategory[] {
  return SITE_CATEGORIES.filter((c) => c.enabled).sort((a, b) => a.order - b.order);
}

/** 按 key 查找板块 */
export function getCategoryByKey(key: string): SiteCategory | undefined {
  return SITE_CATEGORIES.find((c) => c.key === key);
}

/* ── 文章类型 ── */
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
}

/* ── Mock 数据（后续替换为 tRPC 接口） ── */
export const MOCK_ARTICLES: SiteArticle[] = [
  // NEWS
  { id: 101, title: "通义千问 3.0 发布：一人公司如何用好新一代 AI 能力", summary: "阿里云发布通义千问 3.0，在代码生成、长文本理解和多模态方面大幅提升。本文分析一人公司创业者可以如何利用这些新能力优化内容生产流程。", author: "深象研究院", date: "2026-04-09", readTime: "5 分钟", categoryKey: "news", tags: ["AI", "通义千问"], featured: true },
  { id: 102, title: "Stripe 推出 Solopreneur 计划：零月费开启全球收款", summary: "Stripe 宣布面向个人创业者的全新定价方案，取消月费门槛，支持 135 个国家的本地支付方式。", author: "深象研究院", date: "2026-04-08", readTime: "3 分钟", categoryKey: "news", tags: ["支付", "Stripe"] },
  { id: 103, title: "Notion 收购 Cron，日历+笔记一体化时代来临", summary: "Notion 正式完成对 Cron 日历的整合，推出 Notion Calendar 2.0，为一人公司提供更完整的工作流。", author: "深象研究院", date: "2026-04-07", readTime: "4 分钟", categoryKey: "news", tags: ["工具", "Notion"] },
  { id: 104, title: "GitHub Copilot Workspace 正式开放：从 Issue 到 PR 全自动", summary: "GitHub 宣布 Copilot Workspace 面向所有用户开放，支持从 Issue 描述自动生成完整的代码变更。", author: "深象研究院", date: "2026-04-06", readTime: "4 分钟", categoryKey: "news", tags: ["AI", "开发工具"] },

  // THOUGHTS
  { id: 201, title: "Dan Koe 的内容飞轮：如何用一套系统同时运营 5 个平台", summary: "Dan Koe 提出的「一次创作，五次分发」方法论正在被越来越多的独立创业者采用。本文深度解读他的内容飞轮模型，以及如何在中国市场落地。", author: "深象研究院", date: "2026-04-08", readTime: "12 分钟", categoryKey: "thoughts", tags: ["Dan Koe", "内容策略"], featured: true },
  { id: 202, title: "Naval Ravikant：杠杆的四种形式与一人公司的本质", summary: "Naval 关于「不需要许可的杠杆」的思考，为什么代码和媒体是一人公司最强大的武器。", author: "深象研究院", date: "2026-04-06", readTime: "10 分钟", categoryKey: "thoughts", tags: ["Naval", "杠杆理论"] },
  { id: 203, title: "Justin Welsh：从 0 到百万美元的 LinkedIn 增长公式", summary: "Justin Welsh 用 LinkedIn 单平台实现年收入超百万美元。拆解他的内容模板、发布节奏和变现路径。", author: "深象研究院", date: "2026-04-04", readTime: "8 分钟", categoryKey: "thoughts", tags: ["Justin Welsh", "LinkedIn"] },
  { id: 204, title: "Sahil Lavingia：Gumroad 创始人谈极简创业哲学", summary: "Sahil 分享了他如何将 Gumroad 从一家风投支持的初创公司转型为一家盈利的小型企业的心路历程。", author: "深象研究院", date: "2026-04-02", readTime: "9 分钟", categoryKey: "thoughts", tags: ["Sahil Lavingia", "极简创业"] },

  // RESEARCH
  { id: 301, title: "OPC 方法论 1.0：一人公司的系统化运营框架", summary: "深象科技原创研究成果。从定位、内容、分发、变现四个维度构建一人公司的完整运营方法论，附可落地的执行清单。", author: "深象研究院", date: "2026-04-09", readTime: "20 分钟", categoryKey: "research", tags: ["方法论", "框架"], featured: true },
  { id: 302, title: "内容创业者的注意力经济学：从流量思维到信任资本", summary: "为什么传统的流量漏斗模型不适用于一人公司？本文提出「信任资本」概念，重新定义内容创业的价值衡量体系。", author: "深象研究院", date: "2026-04-05", readTime: "15 分钟", categoryKey: "research", tags: ["注意力经济", "信任资本"] },
  { id: 303, title: "AI 原生内容生产：从辅助工具到核心生产力的范式转移", summary: "深度分析 AI 如何从「辅助写作」进化为「原生内容生产」，以及这对一人公司意味着什么。", author: "深象研究院", date: "2026-04-03", readTime: "18 分钟", categoryKey: "research", tags: ["AI", "内容生产"] },

  // POLICY
  { id: 401, title: "个体工商户税收优惠政策汇编（2026年Q2更新）", summary: "系统梳理 2026 年第二季度适用于个体工商户和一人公司的税收优惠政策，包括增值税减免、所得税核定征收等最新变化。", author: "深象研究院", date: "2026-04-07", readTime: "8 分钟", categoryKey: "policy", tags: ["税收", "个体工商户"], featured: true },
  { id: 402, title: "《促进个体经济发展条例》解读：利好与注意事项", summary: "国务院新出台的条例对个体经营者意味着什么？逐条解读关键条款和实操建议。", author: "深象研究院", date: "2026-04-04", readTime: "10 分钟", categoryKey: "policy", tags: ["法规", "个体经济"] },
  { id: 403, title: "跨境收款合规指南：一人公司如何合法接收海外收入", summary: "从外汇管理到税务申报，为有海外客户的一人公司提供完整的合规操作指南。", author: "深象研究院", date: "2026-04-01", readTime: "12 分钟", categoryKey: "policy", tags: ["跨境", "合规"] },

  // CASES
  { id: 501, title: "从 0 到月入 10 万：一位独立开发者的 SaaS 增长拆解", summary: "张明用 6 个月时间将一款面向设计师的 SaaS 工具从零做到月收入 10 万。完整复盘他的产品定位、获客策略和定价模型。", author: "深象研究院", date: "2026-04-06", readTime: "15 分钟", categoryKey: "cases", tags: ["SaaS", "独立开发"], featured: true },
  { id: 502, title: "一个人运营 50 万粉丝公众号的秘密：自动化工作流全揭秘", summary: "李薇分享她如何用 AI + 自动化工具链，一个人高效运营多个内容平台。", author: "深象研究院", date: "2026-04-03", readTime: "12 分钟", categoryKey: "cases", tags: ["公众号", "自动化"] },
  { id: 503, title: "知识付费转型记：从卖课到卖服务的商业模式升级", summary: "王浩从年入 30 万的课程卖家转型为年入 200 万的咨询服务商，拆解他的转型路径。", author: "深象研究院", date: "2026-03-30", readTime: "10 分钟", categoryKey: "cases", tags: ["知识付费", "商业模式"] },

  // REPORTS
  { id: 601, title: "2026年一人公司趋势报告：从副业到主业的范式转移", summary: "深象科技年度旗舰报告。基于对 500+ 一人公司创业者的调研，揭示 2026 年最重要的 10 个趋势。", author: "深象研究院", date: "2026-04-09", readTime: "30 分钟", categoryKey: "reports", tags: ["年度报告", "趋势"], featured: true },
  { id: 602, title: "一人公司周报 Vol.15：AI Agent 爆发周", summary: "本周要闻：OpenAI 发布 Agent SDK、Google 推出 Project Mariner、微软 Copilot Studio 更新。", author: "深象研究院", date: "2026-04-07", readTime: "8 分钟", categoryKey: "reports", tags: ["周报", "AI"] },
  { id: 603, title: "2026年Q1 一人公司工具生态报告", summary: "对 200+ 工具的系统评测，覆盖内容创作、项目管理、财务、营销四大类别。", author: "深象研究院", date: "2026-04-01", readTime: "25 分钟", categoryKey: "reports", tags: ["季报", "工具"] },

  // TOOLKIT
  { id: 701, title: "2026 年一人公司必备工具链：从 0 到 1 的完整配置方案", summary: "为不同阶段的一人公司创业者推荐最优工具组合，包含免费方案和付费进阶方案。", author: "深象研究院", date: "2026-04-08", readTime: "15 分钟", categoryKey: "toolkit", tags: ["工具链", "配置方案"], featured: true },
  { id: 702, title: "Cursor vs Windsurf vs Copilot：AI 编程工具横评", summary: "三大 AI 编程助手的深度对比评测，从代码补全、上下文理解、价格三个维度给出推荐。", author: "深象研究院", date: "2026-04-05", readTime: "12 分钟", categoryKey: "toolkit", tags: ["AI编程", "评测"] },
  { id: 703, title: "Notion vs Obsidian vs Logseq：知识管理工具终极对比", summary: "三款主流知识管理工具的使用场景、优劣势和适用人群分析。", author: "深象研究院", date: "2026-04-02", readTime: "10 分钟", categoryKey: "toolkit", tags: ["知识管理", "评测"] },
];

/** 按板块 key 获取文章 */
export function getArticlesByCategory(categoryKey: string): SiteArticle[] {
  return MOCK_ARTICLES.filter((a) => a.categoryKey === categoryKey);
}

/** 获取最新文章（跨板块） */
export function getLatestArticles(limit = 5): SiteArticle[] {
  return [...MOCK_ARTICLES]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/** 按 ID 获取文章 */
export function getArticleById(id: number): SiteArticle | undefined {
  return MOCK_ARTICLES.find((a) => a.id === id);
}
