#!/usr/bin/env node
/**
 * ECS 直接数据库写入脚本
 * 绕过 HTTP 认证层，直接调用千问 DashScope API 生成文章并写入 website_posts 表
 * 
 * 用法：在 ECS 上 cd /opt/opc-admin && node ecs-seed-articles.mjs
 * 需要 .env.production 中配置 DATABASE_URL 和 ALIYUN_DASHSCOPE_API_KEY
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

// ── 配置 ──
const DB_URL = process.env.DATABASE_URL;
const API_KEY = process.env.ALIYUN_DASHSCOPE_API_KEY;
const API_BASE = process.env.ALIYUN_DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const MODEL = process.env.ALIYUN_DASHSCOPE_MODEL || 'qwen-max';

if (!DB_URL) { console.error('❌ DATABASE_URL 未配置'); process.exit(1); }
if (!API_KEY) { console.error('❌ ALIYUN_DASHSCOPE_API_KEY 未配置'); process.exit(1); }

// ── 板块定义 ──
const SECTIONS = [
  {
    key: 'news', label: '今日快讯',
    topics: [
      '2026年4月一人公司创业者必知的AI工具最新动态与实用场景',
      '微信生态2026年新政策对个体创业者的影响与机遇分析',
      '全球远程工作趋势下中国数字游民创业者的生存现状'
    ]
  },
  {
    key: 'thoughts', label: '思想前沿',
    topics: [
      'Naval Ravikant的杠杆理论在中国一人公司场景下的本土化实践路径',
      '从Dan Koe到小红书知识博主：中美内容创业方法论的碰撞与融合',
      '一人公司的"反规模化"哲学：为什么小而美正在成为新的竞争优势'
    ]
  },
  {
    key: 'research', label: '深度研究',
    topics: [
      'OPC方法论深度解析：一人公司从定位到变现的系统化运营框架',
      'AI原生内容生产的范式转移：从辅助工具到核心生产力的演进路径',
      '一人公司的信任资本模型：超越流量思维的价值衡量新体系'
    ]
  },
  {
    key: 'policy', label: '政策风向',
    topics: [
      '2026年个体工商户与一人公司税收优惠政策全景梳理及实操指南',
      '跨境收款合规操作手册：一人公司如何合法接收海外收入',
      '《促进个体经济发展条例》深度解读：关键条款与创业者行动清单'
    ]
  },
  {
    key: 'cases', label: '实战拆解',
    topics: [
      '从0到月入10万：一位独立开发者的SaaS产品增长全路径复盘',
      '一个人运营50万粉丝矩阵的秘密：AI+自动化工作流实战拆解',
      '知识付费到咨询服务的商业模式升级：年入30万到200万的转型路径'
    ]
  },
  {
    key: 'reports', label: '深度报告',
    topics: [
      '2026年一人公司趋势报告：从副业到主业的范式转移（基于500+创业者调研）',
      '一人公司周报Vol.16：AI Agent生态爆发与创业者的新机遇窗口',
      '2026年Q1一人公司工具生态报告：200+工具系统评测与最优组合方案'
    ]
  },
  {
    key: 'toolkit', label: '工具图谱',
    topics: [
      '2026年一人公司必备工具链：从0到1的完整配置方案（免费+付费双版本）',
      'Cursor vs Windsurf vs Copilot：三大AI编程助手深度横评',
      'Notion vs Obsidian vs Logseq：知识管理工具终极对比与选型指南'
    ]
  }
];

// ── 千问 API 调用 ──
async function callQwen(systemPrompt, userPrompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`  📡 调用千问API (attempt ${attempt + 1})...`);
      const resp = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 8192,
          temperature: 0.8,
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`API ${resp.status}: ${errText}`);
      }

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from API');

      // 提取 JSON（可能被 ```json 包裹）
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      
      // 尝试直接解析
      try {
        return JSON.parse(jsonStr.trim());
      } catch {
        // 尝试找到第一个 { 和最后一个 }
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          return JSON.parse(jsonStr.slice(start, end + 1));
        }
        throw new Error('Failed to parse JSON from response');
      }
    } catch (err) {
      console.error(`  ❌ Attempt ${attempt + 1} failed:`, err.message);
      if (attempt === retries) throw err;
      await sleep(3000);
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── 生成文章 ──
async function generateArticle(category, categoryLabel, topic, index) {
  const dateOffset = index * 2 + Math.floor(Math.random() * 2);
  const articleDate = new Date(2026, 3, 18 - dateOffset); // 2026年4月中旬往前
  const dateStr = articleDate.toISOString().split('T')[0];

  const systemPrompt = `你是深象OPCS研究院的资深内容编辑，专注于一人公司（One Person Company / OPC）创业领域的深度内容创作。你的读者是中国的独立创业者、内容创作者、数字游民和知识工作者。

写作要求（严格遵守）：
1. 文章必须用 Markdown 格式，包含一级标题(#)、二级标题(##)、三级标题(###)
2. 正文至少2500字，内容要有深度、有洞察、有实操价值
3. 必须包含至少1个 Markdown 表格（用于数据对比、工具评测、政策梳理等）
4. 使用**粗体**强调关键概念和核心观点
5. 引用真实的工具名称、平台名称、人物姓名和案例（可以是虚构但合理的案例）
6. 段落之间要有逻辑递进关系，不要堆砌信息
7. 文末加上"---\\n\\n*编辑 | 深象OPCS研究院*\\n*发布 | 上海深象科技*"
8. 写作风格要专业但不枯燥，有温度但不煽情，像一位经验丰富的创业导师在分享见解
9. 避免使用"首先/其次/最后"、"总而言之"、"综上所述"等AI痕迹明显的过渡词
10. 每篇文章的结构要有差异性，不要千篇一律
11. 日期使用 ${dateStr}`;

  const userPrompt = `请为「${categoryLabel}」板块撰写一篇高质量深度文章。

主题方向：${topic}

请直接返回一个JSON对象（不要用markdown代码块包裹），格式如下：
{
  "title": "文章标题（吸引眼球但不标题党，15-30字）",
  "excerpt": "文章摘要（80-120字，概括核心观点和价值）",
  "body": "完整的Markdown格式正文（至少2500字，含表格、粗体、小标题等）",
  "tags": ["标签1", "标签2", "标签3", "标签4"]
}`;

  const article = await callQwen(systemPrompt, userPrompt);
  
  return {
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    tags: article.tags || [],
    category,
    date: dateStr,
    featured: index === 0, // 每个板块第一篇为精选
  };
}

// ── 写入数据库 ──
async function insertArticle(conn, article, adminId) {
  const slug = article.title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 200);

  const publishedAt = new Date(article.date + 'T08:00:00+08:00');

  const [result] = await conn.execute(
    `INSERT INTO website_posts (title, slug, excerpt, body, category, tags, status, publishedAt, createdBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?, NOW(), NOW())`,
    [
      article.title,
      slug + '-' + Date.now().toString(36),
      article.excerpt,
      article.body,
      article.category,
      JSON.stringify(article.tags),
      publishedAt,
      adminId
    ]
  );

  return result.insertId;
}

// ── 主流程 ──
async function main() {
  console.log('🚀 深象OPCS - 前台文章批量生成脚本');
  console.log(`📦 数据库: ${DB_URL.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`🤖 千问模型: ${MODEL}`);
  console.log(`📝 计划生成: ${SECTIONS.length} 个板块 × 3 篇 = ${SECTIONS.length * 3} 篇文章\n`);

  // 连接数据库
  const conn = await mysql.createConnection(DB_URL);
  console.log('✅ 数据库连接成功\n');

  // 获取 admin 用户 ID
  const [users] = await conn.execute("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
  const adminId = users.length > 0 ? users[0].id : 1;
  console.log(`👤 管理员ID: ${adminId}\n`);

  // 检查现有文章数
  const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM website_posts");
  console.log(`📊 现有文章数: ${existing[0].cnt}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const section of SECTIONS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 板块: ${section.label} (${section.key})`);
    console.log(`${'='.repeat(60)}`);

    for (let i = 0; i < section.topics.length; i++) {
      const topic = section.topics[i];
      console.log(`\n  📝 [${i + 1}/${section.topics.length}] ${topic.slice(0, 50)}...`);

      try {
        const article = await generateArticle(section.key, section.label, topic, i);
        console.log(`  ✅ 生成成功: "${article.title}" (${article.body.length}字)`);

        const postId = await insertArticle(conn, article, adminId);
        console.log(`  💾 写入数据库: ID=${postId}`);

        successCount++;
      } catch (err) {
        console.error(`  ❌ 失败: ${err.message}`);
        failCount++;
      }

      // 避免 API 限流
      if (i < section.topics.length - 1) {
        console.log('  ⏳ 等待3秒...');
        await sleep(3000);
      }
    }

    // 板块间等待
    console.log(`\n  ⏳ 板块完成，等待2秒...`);
    await sleep(2000);
  }

  // 统计
  const [final] = await conn.execute("SELECT COUNT(*) as cnt FROM website_posts WHERE status = 'published'");
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 生成完成！`);
  console.log(`  ✅ 成功: ${successCount} 篇`);
  console.log(`  ❌ 失败: ${failCount} 篇`);
  console.log(`  📊 数据库已发布文章总数: ${final[0].cnt}`);
  console.log(`${'='.repeat(60)}`);

  await conn.end();
}

main().catch(err => {
  console.error('💥 脚本执行失败:', err);
  process.exit(1);
});
