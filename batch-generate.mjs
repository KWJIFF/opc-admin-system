/**
 * 批量通过后台 tRPC API 调用千问生成文章并发布
 * 每个板块 3 篇文章，共 7 个板块 = 21 篇
 */

const BASE = "http://localhost:3000";

// 板块和对应的选题
const SECTIONS = [
  {
    category: "news",
    label: "今日快讯",
    topics: [
      "2026年4月全球AI创业融资动态：一人公司模式获资本青睐",
      "苹果发布AI开发者工具包：个人开发者迎来黄金时代",
      "中国数字游民签证政策更新：海南自贸港推出创业者专属通道"
    ]
  },
  {
    category: "thought",
    label: "思想前沿",
    topics: [
      "从「规模化」到「精致化」：2026年一人公司的商业哲学转向",
      "Naval Ravikant最新访谈：AI时代个体创业者的杠杆方程式",
      "知识工作者的终局：当AI能做80%的工作，人类该专注什么"
    ]
  },
  {
    category: "research",
    label: "深度研究",
    topics: [
      "一人公司收入结构研究：2026年最赚钱的5种商业模式深度拆解",
      "AI内容创作效率报告：千问vs GPT-5 vs Claude在中文场景的实测对比",
      "全球远程工作趋势白皮书：数据驱动的一人公司选址策略"
    ]
  },
  {
    category: "policy",
    label: "政策风向",
    topics: [
      "2026年个体工商户税收优惠政策全解读：一人公司如何合规节税",
      "《人工智能生成内容管理办法》正式实施：创作者必知的合规要点",
      "跨境电商新政策解读：一人公司出海的税务与合规指南"
    ]
  },
  {
    category: "case",
    label: "实战拆解",
    topics: [
      "月入30万的Notion模板创业者：从0到1的完整复盘",
      "一个人如何运营10万粉丝的垂直社群：工具链与自动化全流程",
      "从副业到全职：一位AI提示词工程师的年收入百万之路"
    ]
  },
  {
    category: "tools",
    label: "工具图谱",
    topics: [
      "2026年一人公司必备AI工具栈：从内容创作到财务管理的完整方案",
      "Cursor vs Windsurf vs Bolt：AI编程工具深度横评，谁最适合非技术创业者",
      "自动化工作流搭建指南：用n8n+千问打造你的24小时数字员工"
    ]
  },
  {
    category: "report",
    label: "深度报告",
    topics: [
      "《2026中国一人公司生态报告》：市场规模、增长趋势与机会地图",
      "AI赋能内容创业深度报告：技术路线、变现模式与未来三年预测",
      "全球数字游民经济报告：一人公司的地理套利策略与最佳实践城市TOP20"
    ]
  }
];

async function login() {
  const res = await fetch(`${BASE}/api/trpc/auth.login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: { username: "admin", password: "Kwjiff-5240501" } })
  });
  const cookies = res.headers.getSetCookie?.() || [];
  const sessionCookie = cookies.find(c => c.startsWith("app_session_id="));
  if (!sessionCookie) throw new Error("Login failed - no session cookie");
  return sessionCookie.split(";")[0];
}

async function generateAndPublish(cookie, category, topic, length = "medium") {
  const res = await fetch(`${BASE}/api/trpc/ai.generateAndPublish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookie
    },
    body: JSON.stringify({
      json: { category, topic, length, autoPublish: true }
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result?.data?.json;
}

async function main() {
  console.log("🔐 登录中...");
  const cookie = await login();
  console.log("✅ 登录成功\n");

  let total = 0;
  let success = 0;
  let failed = 0;

  for (const section of SECTIONS) {
    console.log(`\n📂 板块: ${section.label} (${section.category})`);
    console.log("─".repeat(50));

    for (const topic of section.topics) {
      total++;
      console.log(`  📝 生成中: ${topic.slice(0, 40)}...`);
      try {
        const result = await generateAndPublish(
          cookie,
          section.category,
          topic,
          section.category === "report" ? "long" : "medium"
        );
        success++;
        console.log(`  ✅ 已发布: postId=${result.postId}, "${result.title?.slice(0, 30)}..."`);
      } catch (err) {
        failed++;
        console.log(`  ❌ 失败: ${err.message?.slice(0, 80)}`);
      }
      // 间隔 2 秒避免 API 限流
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`📊 生成完成: 总计 ${total}, 成功 ${success}, 失败 ${failed}`);
}

main().catch(console.error);
