/**
 * 深象OPCS - 批量生成高质量文章（每篇含3-5张Mermaid可视化图表）
 * 2026年5月10日基准
 */
import 'dotenv/config';

// 优先使用 BUILT_IN_FORGE API（支持更长输出）
const API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const API_URL = `${process.env.BUILT_IN_FORGE_API_URL?.replace(/\/$/, "")}/v1/chat/completions`;
const MODEL = "gemini-2.5-flash";
const DB_URL = process.env.DATABASE_URL;

if (!API_KEY) { console.error("❌ 未找到 API KEY"); process.exit(1); }
if (!DB_URL) { console.error("❌ 未找到 DATABASE_URL"); process.exit(1); }

console.log(`🔗 API: ${API_URL}`);
console.log(`🤖 模型: ${MODEL}`);

import mysql from 'mysql2/promise';
const pool = mysql.createPool(DB_URL);

async function callLLM(messages, maxTokens = 8000) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens, temperature: 0.8, response_format: { type: "json_object" } }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API错误 ${res.status}: ${err.slice(0, 300)}`);
  }
  const data = await res.json();
  if (data.usage) console.log(`   📊 Token: in=${data.usage.prompt_tokens}, out=${data.usage.completion_tokens}`);
  return data.choices[0]?.message?.content;
}

// 带重试的生成函数，确保图表数量达标
async function generateWithRetry(messages, maxTokens, minCharts = 3, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const content = await callLLM(messages, maxTokens);
    if (!content) throw new Error("未返回内容");
    const article = JSON.parse(content);
    if (!article.title || !article.body) throw new Error("缺少必要字段");
    const chartCount = (article.body.match(/```mermaid/g) || []).length;
    if (chartCount >= minCharts || attempt === maxRetries) {
      return article;
    }
    console.log(`   ⚠️ 图表仅${chartCount}个（需≥${minCharts}），重试第${attempt+1}次...`);
    await new Promise(r => setTimeout(r, 1500));
  }
}

async function insertArticle(article, category) {
  const slug = article.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 200);
  const [result] = await pool.execute(
    `INSERT INTO website_posts (title, slug, excerpt, body, category, tags, status, publishedAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 'published', NOW(), NOW(), NOW())`,
    [article.title, slug, article.excerpt, article.body, category, JSON.stringify(article.tags || [])]
  );
  return result.insertId;
}

// ═══════════════════════════════════════════════════════════════
// 可视化图表标准 prompt（所有文章标配）
// ═══════════════════════════════════════════════════════════════
const CHART_RULES = `
【核心要求 - 可视化图表】每篇文章必须嵌入3-5个Mermaid可视化图表，这是标配。

可选图表类型（每篇至少使用3种不同类型，不可重复）：
- pie title 标题名：饼图，用于占比分析、市场份额、收入结构
- xychart-beta：柱状图或折线图，用于趋势变化、数据对比、时间序列
- flowchart TD 或 flowchart LR：流程图/架构图，用于系统架构、决策流程、操作步骤
- quadrantChart：象限图/矩阵图，用于二维对比分析、工具定位
- mindmap：思维导图，用于知识体系、分类框架
- graph TD 或 graph LR：关系图/网络图，用于要素关联、生态图谱
- gantt：甘特图，用于时间规划、项目进度
- journey：用户旅程图，用于体验分析、流程评分

图表规范：
1. 每个图表用 \`\`\`mermaid 和 \`\`\` 包裹
2. 图表前必须有一段引导文字说明该图表展示什么
3. 图表数据必须与文章论述内容强关联，是信息增量而非装饰
4. 统一使用中文标注，标题清晰
5. 同一篇文章中图表类型必须多样化
6. 数据要合理有说服力
7. xychart-beta 的 x-axis 标签用方括号包裹如 x-axis ["Q1", "Q2", "Q3", "Q4"]
8. pie 图直接写 pie title 标题 然后每行 "标签" : 数值
9. mindmap 用缩进表示层级
10. quadrantChart 需要设置 x-axis, y-axis 标签和四个象限标签
`;

// ═══════════════════════════════════════════════════════════════
// 20篇文章配置
// ═══════════════════════════════════════════════════════════════
const ARTICLES = [
  // ── news × 4 ──
  { cat: "news", tokens: 8000, sys: "你是「深象OPCS」资深科技记者。今天是2026年5月10日。", prompt: `撰写一篇关于「2026年5月AI创业工具生态最新格局变化」的快讯。800-1200字，报道口吻，引用Cursor、Claude、Midjourney V7、Notion AI等真实工具，分析对一人公司创业者的影响。${CHART_RULES}` },
  { cat: "news", tokens: 8000, sys: "你是「深象OPCS」资深科技记者。今天是2026年5月10日。", prompt: `撰写一篇关于「独立开发者与创作者经济2026年春季融资并购盘点」的快讯。1500-2000字，盘点Gumroad、Lemon Squeezy、Paddle、Cal.com等平台动态，分析资本对独立创业生态的影响趋势。${CHART_RULES}` },
  { cat: "news", tokens: 8000, sys: "你是「深象OPCS」资深科技记者。今天是2026年5月10日。", prompt: `撰写一篇关于「内容平台算法2026年重大调整：微信、小红书、抖音、B站最新规则解读」的快讯。1500-2000字，对比各平台变化对内容创业者的实际影响。${CHART_RULES}` },
  { cat: "news", tokens: 8000, sys: "你是「深象OPCS」资深科技记者。今天是2026年5月10日。", prompt: `撰写一篇关于「远程办公与数字游民2026年全球政策新动向」的快讯。1500-2000字，报道各国数字游民签证政策趋势，对中国一人公司创业者的跨境工作影响。${CHART_RULES}` },

  // ── thoughts × 3 ──
  { cat: "thoughts", tokens: 8192, sys: "你是「深象OPCS研究院」首席思想研究员。今天是2026年5月10日。", prompt: `撰写一篇关于「一人公司的反脆弱性：在不确定时代构建韧性商业体」的深度思想文章。2500-3500字，引用塔勒布反脆弱理论，从收入结构杠铃策略、技能组合、客户分散化、知识资产复利四个维度展开。语言有思想家质感，避免鸡汤。${CHART_RULES}` },
  { cat: "thoughts", tokens: 8192, sys: "你是「深象OPCS研究院」首席思想研究员。今天是2026年5月10日。", prompt: `撰写一篇关于「AI时代的认知杠杆：一人公司如何用智能工具放大个体价值边界」的深度思想文章。2500-3500字，从认知科学角度（卡尼曼系统1/2理论）分析AI如何重塑创业者的决策、创作、运营能力，讨论人机协作新范式和AI杠杆的局限性。${CHART_RULES}` },
  { cat: "thoughts", tokens: 8192, sys: "你是「深象OPCS研究院」首席思想研究员，具有心理学背景。今天是2026年5月10日。", prompt: `撰写一篇关于「从副业到主业的心理拓扑学：创业者身份转换的深层机制与应对框架」的深度思想文章。2500-3500字，引用自我决定理论SDT、心流理论，分析安全感缺失、身份认同危机、社交压力、决策疲劳等心理障碍，提供基于心理学的应对框架。${CHART_RULES}` },

  // ── research × 2 ──
  { cat: "research", tokens: 8192, sys: "你是「深象OPCS研究院」高级研究员。今天是2026年5月10日。", prompt: `撰写一篇「中国一人公司生态全景研究报告（2026年春季）」白皮书级深度研究。4000-6000字。结构：摘要→研究背景→分类框架（至少4种类型）→行业分布分析→收入结构模型→成功因素→挑战与风险矩阵→趋势预测→结论。引用微信生态、小红书、抖音、独立站等真实平台。不编造具体百分比。${CHART_RULES}` },
  { cat: "research", tokens: 8192, sys: "你是「深象OPCS研究院」高级研究员。今天是2026年5月10日。", prompt: `撰写一篇「AI对独立创业者生产力影响的多维度评估研究」深度研究。4000-6000字。结构：研究概述→理论框架→AI工具分类评估矩阵→生产力影响分析（时间/质量/成本三维度）→AI依赖风险→人机协作最佳实践→结论。引用ChatGPT、Claude、Cursor、Midjourney等真实工具。${CHART_RULES}` },

  // ── policy × 3 ──
  { cat: "policy", tokens: 8000, sys: "你是「深象OPCS」政策研究专家，精通中国税法。今天是2026年5月10日。", prompt: `撰写一篇「2026年个体工商户与自由职业者税收政策全解读」。2000-3000字，系统梳理增值税、个人所得税、社保缴纳、税收优惠，对比个体户vs个人独资企业vs自然人税负差异，提供合法税务筹划建议。不编造具体政策文号。${CHART_RULES}` },
  { cat: "policy", tokens: 8000, sys: "你是「深象OPCS」法律政策研究专家。今天是2026年5月10日。", prompt: `撰写一篇「知识产权保护实操指南：一人公司的品牌与内容资产守护」。2000-3000字，覆盖商标注册、版权保护、专利申请、商业秘密，重点分析AI生成内容版权归属问题，对比不同保护方式的成本/周期/范围。${CHART_RULES}` },
  { cat: "policy", tokens: 8000, sys: "你是「深象OPCS」国际税务研究专家。今天是2026年5月10日。", prompt: `撰写一篇「跨境收入税务合规：中国一人公司的全球化经营指南」。2000-3000字，针对通过Gumroad、Stripe、App Store等海外平台获取收入的税务合规，覆盖外汇申报、跨境电商税务、数字服务税、双重征税协定。${CHART_RULES}` },

  // ── cases × 3 ──
  { cat: "cases", tokens: 8000, sys: "你是「深象OPCS」实战案例研究员。今天是2026年5月10日。", prompt: `撰写一篇「从0到月入10万：技术博主的知识变现全路径拆解」。2000-3000字，构建典型技术博主变现案例，详细拆解：技术博客→付费教程→咨询服务→SaaS产品四阶段，每阶段含策略、时间线、关键指标、踩坑经验。语言实战感强。${CHART_RULES}` },
  { cat: "cases", tokens: 8000, sys: "你是「深象OPCS」实战案例研究员。今天是2026年5月10日。", prompt: `撰写一篇「公众号矩阵运营：一人如何同时管理多个垂直账号并实现规模化变现」。2000-3000字，拆解一人运营3-5个垂直公众号的选题策略、AI辅助内容生产流程、排期管理、粉丝运营、变现模式和时间管理方案。${CHART_RULES}` },
  { cat: "cases", tokens: 8000, sys: "你是「深象OPCS」实战案例研究员。今天是2026年5月10日。", prompt: `撰写一篇「独立开发者出海实录：一款效率小工具如何在全球市场实现持续收入」。2000-3000字，拆解全过程：需求发现→产品开发→国际化→定价策略→推广获客→持续运营，包含技术栈选择、Stripe/Paddle支付集成、多语言方案、法律合规。${CHART_RULES}` },

  // ── reports × 2 ──
  { cat: "reports", tokens: 8192, sys: "你是「深象OPCS研究院」行业分析师。今天是2026年5月10日。", prompt: `撰写「2026年一人公司创业者工具链生态报告」。4000-5000字，报告体裁。结构：执行摘要→工具链全景图→分类评测（内容创作/产品开发/营销推广/运营管理/AI增强）→每类对比3-5个主流工具→趋势分析→建议。引用真实工具和平台。${CHART_RULES}` },
  { cat: "reports", tokens: 8192, sys: "你是「深象OPCS研究院」行业分析师。今天是2026年5月10日。", prompt: `撰写「中国内容创业市场2026年春季深度分析报告」。4000-5000字，报告体裁。结构：市场概览→平台格局（微信/小红书/抖音/B站/知乎/播客）→创作者经济分析→变现模式演变→AI双刃剑效应→内容同质化与差异化→展望。${CHART_RULES}` },

  // ── toolkit × 3 ──
  { cat: "toolkit", tokens: 8000, sys: "你是「深象OPCS」工具评测专家。今天是2026年5月10日。", prompt: `撰写「2026年AI写作工具深度横评：6款主流工具的中文写作能力实测」。2000-3000字，横向对比ChatGPT、Claude、文心一言、通义千问、Jasper、Copy.ai，评测维度：中文写作质量、长文能力、创意性、准确性、价格、API可用性。针对不同场景推荐最佳工具。${CHART_RULES}` },
  { cat: "toolkit", tokens: 8000, sys: "你是「深象OPCS」工具评测专家。今天是2026年5月10日。", prompt: `撰写「一人公司财务管理工具全指南：从记账到税务的一站式解决方案」。2000-3000字，覆盖记账、发票管理、税务申报、财务分析、预算管理，对比随手记、金蝶、用友、QuickBooks、FreshBooks等工具的功能/价格/适用规模。${CHART_RULES}` },
  { cat: "toolkit", tokens: 8000, sys: "你是「深象OPCS」工具评测专家。今天是2026年5月10日。", prompt: `撰写「无代码建站工具2026年终极对比：8款工具助你独立站搭建不求人」。2000-3000字，对比WordPress、Webflow、Framer、Notion Sites、Carrd、Typedream、Super.so、Shopify，评测易用性、设计自由度、SEO能力、性能、价格、中文支持。针对不同需求推荐。${CHART_RULES}` },
];

// ═══════════════════════════════════════════════════════════════
// 执行
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log(`\n🚀 开始为7个板块生成 ${ARTICLES.length} 篇高质量文章（每篇含3-5张可视化图表）...\n`);
  console.log("═".repeat(60));

  let success = 0, failed = 0;

  for (let i = 0; i < ARTICLES.length; i++) {
    const cfg = ARTICLES[i];
    console.log(`\n[${i+1}/${ARTICLES.length}] 📝 板块: ${cfg.cat}`);

    try {
      const messages = [
        { role: "system", content: `${cfg.sys}\n\n你是深象OPCS研究院的资深编辑。严格按要求返回JSON。body字段使用Markdown格式。\n\n【最重要的要求】文章中必须包含至少3个mermaid代码块作为可视化图表。如果你的输出中mermaid图表少于3个，这篇文章将被判定为不合格。图表类型必须多样化（不能全是同一种），数据与内容强关联。` },
        { role: "user", content: `${cfg.prompt}\n\n【再次强调】文章正文中必须包含至少3个 \`\`\`mermaid 代码块，每个图表类型不同。这是硬性要求。\n\n严格返回JSON格式（不要添加任何其他文字）：\n{"title":"文章标题（吸引人、具体、不超30字）","excerpt":"100字以内摘要","body":"完整Markdown正文（必须含3-5个mermaid图表代码块）","tags":["标签1","标签2","标签3"]}` },
      ];

      const article = await generateWithRetry(messages, cfg.tokens, 3);

      // 统计 mermaid 图表数量
      const mermaidCount = (article.body.match(/```mermaid/g) || []).length;
      console.log(`   📈 Mermaid图表数量: ${mermaidCount}`);

      const id = await insertArticle(article, cfg.cat);
      console.log(`   ✅ ID=${id} "${article.title}" (${article.body.length}字符)`);
      success++;
    } catch (err) {
      console.error(`   ❌ 失败: ${err.message}`);
      failed++;
    }

    // 避免API限流
    if (i < ARTICLES.length - 1) {
      await new Promise(r => setTimeout(r, 2500));
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log(`🏁 完成! 成功: ${success}, 失败: ${failed}`);
  await pool.end();
  process.exit(0);
}

main().catch(err => { console.error("致命错误:", err); process.exit(1); });
