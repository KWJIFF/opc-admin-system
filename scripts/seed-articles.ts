/**
 * 本地文章生成脚本 v2
 * 修复 JSON 解析问题：清理 LLM 返回中的控制字符
 * 
 * 用法：cd /home/ubuntu/opc-admin && npx tsx scripts/seed-articles.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, sql } from "drizzle-orm";
import { websitePosts } from "../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;
const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL || process.env.VITE_FRONTEND_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY || process.env.VITE_FRONTEND_FORGE_API_KEY;
const DASHSCOPE_API_KEY = process.env.ALIYUN_DASHSCOPE_API_KEY;
const DASHSCOPE_BASE_URL = process.env.ALIYUN_DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
const DASHSCOPE_MODEL = process.env.ALIYUN_DASHSCOPE_MODEL || "qwen-max";

if (!DATABASE_URL) { console.error("❌ DATABASE_URL 未配置"); process.exit(1); }

let LLM_URL: string;
let LLM_KEY: string;
let LLM_MODEL: string;

if (DASHSCOPE_API_KEY) {
  LLM_URL = `${DASHSCOPE_BASE_URL}/chat/completions`;
  LLM_KEY = DASHSCOPE_API_KEY;
  LLM_MODEL = DASHSCOPE_MODEL;
  console.log("🤖 使用千问 DashScope API");
} else if (FORGE_API_URL && FORGE_API_KEY) {
  LLM_URL = `${FORGE_API_URL.replace(/\/$/, "")}/v1/chat/completions`;
  LLM_KEY = FORGE_API_KEY;
  LLM_MODEL = "gemini-2.5-flash";
  console.log("🤖 使用 Manus Forge API");
} else {
  console.error("❌ 未配置 LLM API");
  process.exit(1);
}

console.log(`📡 LLM URL: ${LLM_URL}`);
console.log(`🧠 Model: ${LLM_MODEL}`);

const db = drizzle(DATABASE_URL);

const SECTIONS = [
  {
    key: "news", label: "今日快讯",
    topics: [
      "2026年4月一人公司创业者必知的AI工具最新动态与实用场景分析",
      "微信生态2026年新政策对个体创业者的影响与机遇深度分析",
      "全球远程工作趋势下中国数字游民创业者的生存现状与机会"
    ]
  },
  {
    key: "thoughts", label: "思想前沿",
    topics: [
      "Naval Ravikant的杠杆理论在中国一人公司场景下的本土化实践路径",
      "从Dan Koe到小红书知识博主：中美内容创业方法论的碰撞与融合",
      "一人公司的反规模化哲学：为什么小而美正在成为新的竞争优势"
    ]
  },
  {
    key: "research", label: "深度研究",
    topics: [
      "OPC方法论深度解析：一人公司从定位到变现的系统化运营框架",
      "AI原生内容生产的范式转移：从辅助工具到核心生产力的演进路径",
      "一人公司的信任资本模型：超越流量思维的价值衡量新体系"
    ]
  },
  {
    key: "policy", label: "政策风向",
    topics: [
      "2026年个体工商户与一人公司税收优惠政策全景梳理及实操指南",
      "跨境收款合规操作手册：一人公司如何合法接收海外收入",
      "促进个体经济发展条例深度解读：关键条款与创业者行动清单"
    ]
  },
  {
    key: "cases", label: "实战拆解",
    topics: [
      "从0到月入10万：一位独立开发者的SaaS产品增长全路径复盘",
      "一个人运营50万粉丝矩阵的秘密：AI加自动化工作流实战拆解",
      "知识付费到咨询服务的商业模式升级：年入30万到200万的转型路径"
    ]
  },
  {
    key: "reports", label: "深度报告",
    topics: [
      "2026年一人公司趋势报告：从副业到主业的范式转移",
      "一人公司周报Vol.16：AI Agent生态爆发与创业者的新机遇窗口",
      "2026年Q1一人公司工具生态报告：200+工具系统评测与最优组合方案"
    ]
  },
  {
    key: "toolkit", label: "工具图谱",
    topics: [
      "2026年一人公司必备工具链：从0到1的完整配置方案",
      "Cursor vs Windsurf vs Copilot：三大AI编程助手深度横评与选型建议",
      "Notion vs Obsidian vs Logseq：知识管理工具终极对比与选型指南"
    ]
  }
];

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/**
 * 清理 JSON 字符串中的控制字符（保留 \n \r \t）
 */
function sanitizeJsonString(str: string): string {
  // 移除所有 ASCII 控制字符（0x00-0x1F），但保留已转义的 \n \r \t
  // 先将实际的换行/制表符替换为转义序列
  let result = str
    .replace(/\t/g, "\\t")
    .replace(/\r\n/g, "\\n")
    .replace(/\r/g, "\\n")
    .replace(/\n/g, "\\n");
  
  // 移除其他控制字符
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  
  return result;
}

async function callLLM(systemPrompt: string, userPrompt: string, retries = 3): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`  📡 调用LLM (attempt ${attempt + 1})...`);
      const resp = await fetch(LLM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LLM_KEY}`
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 8192,
          temperature: 0.7,
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`API ${resp.status}: ${errText.slice(0, 200)}`);
      }

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from API");

      // 提取 JSON 块
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      
      // 找到 JSON 对象的边界
      const start = jsonStr.indexOf("{");
      const end = jsonStr.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON object found in response");
      
      jsonStr = jsonStr.slice(start, end + 1);
      
      // 清理控制字符
      jsonStr = sanitizeJsonString(jsonStr);
      
      try {
        return JSON.parse(jsonStr);
      } catch (parseErr: any) {
        // 最后手段：逐字段提取
        console.log(`  ⚠️ JSON解析失败，尝试字段提取...`);
        const titleMatch = content.match(/"title"\s*:\s*"([^"]+)"/);
        const excerptMatch = content.match(/"excerpt"\s*:\s*"([^"]+)"/);
        const tagsMatch = content.match(/"tags"\s*:\s*\[([^\]]+)\]/);
        
        // 提取 body - 从 "body": " 到下一个 ", "tags" 或 "}\n
        const bodyStart = content.indexOf('"body"');
        if (bodyStart === -1) throw new Error("Cannot extract body field");
        
        const bodyValueStart = content.indexOf('"', bodyStart + 6) + 1;
        // 找到 body 值的结束位置 - 寻找 ", 后跟 "tags" 或结尾的 }
        let bodyEnd = -1;
        const tagsPos = content.indexOf('"tags"', bodyValueStart);
        if (tagsPos !== -1) {
          // 向前找到 body 值结束的引号
          bodyEnd = content.lastIndexOf('"', tagsPos - 1);
        } else {
          bodyEnd = content.lastIndexOf('"', content.lastIndexOf("}"));
        }
        
        if (bodyEnd <= bodyValueStart) throw parseErr;
        
        let body = content.slice(bodyValueStart, bodyEnd);
        // 清理 body 中的转义
        body = body.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"');
        
        const tags = tagsMatch 
          ? tagsMatch[1].split(",").map((t: string) => t.trim().replace(/"/g, ""))
          : ["一人公司"];
        
        return {
          title: titleMatch?.[1] || "未命名文章",
          excerpt: excerptMatch?.[1] || "",
          body,
          tags
        };
      }
    } catch (err: any) {
      console.error(`  ❌ Attempt ${attempt + 1} failed:`, err.message?.slice(0, 100));
      if (attempt === retries) throw err;
      await sleep(2000);
    }
  }
}

async function generateArticle(category: string, categoryLabel: string, topic: string, index: number) {
  const dateOffset = index * 3 + Math.floor(Math.random() * 2);
  const articleDate = new Date(2026, 3, 18 - dateOffset);
  const dateStr = articleDate.toISOString().split("T")[0];

  const systemPrompt = `你是深象OPCS研究院的资深内容编辑，专注于一人公司（OPC）创业领域的深度内容创作。读者是中国的独立创业者、内容创作者、数字游民。

写作要求：
1. Markdown格式，含##和###标题
2. 正文至少2000字，有深度和实操价值
3. 包含至少1个Markdown表格
4. 用**粗体**强调关键概念
5. 引用真实工具名称和平台名称
6. 段落间有逻辑递进
7. 文末加"---\\n\\n*编辑 | 深象OPCS研究院*\\n*发布 | 上海深象科技*"
8. 专业但不枯燥，避免AI痕迹明显的过渡词
9. 日期: ${dateStr}

重要：返回的JSON中，body字段的换行请用实际的\\n表示，不要用真实换行符。`;

  const userPrompt = `为「${categoryLabel}」板块撰写深度文章。主题：${topic}

返回JSON格式（注意body中用\\n表示换行）：
{"title":"标题15-30字","excerpt":"摘要80-120字","body":"Markdown正文至少2000字","tags":["标签1","标签2","标签3"]}`;

  const article = await callLLM(systemPrompt, userPrompt);
  
  return {
    title: article.title,
    excerpt: article.excerpt,
    body: typeof article.body === "string" ? article.body.replace(/\\n/g, "\n") : article.body,
    tags: article.tags || [],
    category,
    date: dateStr,
  };
}

async function main() {
  console.log("\n🚀 深象OPCS - 前台文章批量生成脚本 v2");
  console.log(`📦 数据库: ${DATABASE_URL!.replace(/:[^:@]+@/, ":***@")}`);

  // Step 1: 修复 category
  console.log("\n🔧 修复 category 值...");
  await db.execute(sql`UPDATE website_posts SET category = 'thoughts' WHERE category = 'thought'`);
  console.log("  ✅ done");

  // Step 2: 检查现有文章
  const [existing] = await db.execute(sql`SELECT category, COUNT(*) as cnt FROM website_posts WHERE status = 'published' GROUP BY category`);
  console.log("\n📊 现有已发布文章:");
  const existingMap = new Map<string, number>();
  if (Array.isArray(existing)) {
    for (const row of existing as any[]) {
      existingMap.set(row.category, Number(row.cnt));
      console.log(`  ${row.category}: ${row.cnt} 篇`);
    }
  }

  // Step 3: 生成缺少的文章
  let successCount = 0;
  let failCount = 0;

  for (const section of SECTIONS) {
    const count = existingMap.get(section.key) || 0;
    if (count >= 3) {
      console.log(`\n✓ ${section.label}(${section.key}): 已有 ${count} 篇，跳过`);
      continue;
    }

    const needed = 3 - count;
    const topicsToGen = section.topics.slice(count, count + needed);

    console.log(`\n${"─".repeat(50)}`);
    console.log(`📂 ${section.label} (${section.key}) - 需生成 ${needed} 篇`);

    for (let i = 0; i < topicsToGen.length; i++) {
      const topic = topicsToGen[i];
      console.log(`\n  📝 [${i + 1}/${topicsToGen.length}] ${topic.slice(0, 45)}...`);

      try {
        const article = await generateArticle(section.key, section.label, topic, i + count);
        const bodyLen = article.body?.length || 0;
        console.log(`  ✅ "${article.title}" (${bodyLen}字)`);

        const slug = article.title
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .slice(0, 150) + "-" + Date.now().toString(36);

        await db.insert(websitePosts).values({
          title: article.title,
          slug,
          excerpt: article.excerpt || null,
          body: article.body || null,
          category: article.category,
          tags: article.tags,
          status: "published",
          publishedAt: new Date(article.date + "T08:00:00+08:00"),
          createdBy: 1,
        });

        console.log(`  💾 已写入数据库`);
        successCount++;
      } catch (err: any) {
        console.error(`  ❌ 失败: ${err.message?.slice(0, 80)}`);
        failCount++;
      }

      await sleep(2500);
    }
  }

  // 最终统计
  const [final] = await db.execute(sql`SELECT category, COUNT(*) as cnt FROM website_posts WHERE status = 'published' GROUP BY category ORDER BY category`);
  console.log(`\n${"═".repeat(50)}`);
  console.log(`🎉 完成！成功: ${successCount}, 失败: ${failCount}`);
  console.log("📊 最终分布:", final);

  process.exit(0);
}

main().catch(err => {
  console.error("💥 脚本失败:", err);
  process.exit(1);
});
