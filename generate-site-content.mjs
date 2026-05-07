/**
 * 通过千问 API 生成前台官网各板块内容
 * 板块：今日快讯、思想前沿、深度研究、政策风向、实战拆解、深度报告、工具图谱
 * 播客和视频暂不填充
 */

const DASHSCOPE_API_KEY = 'sk-ab6c113f5d98447682a86db256d9ce69';
const LLM_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

async function callQwen(systemPrompt, userPrompt) {
  const resp = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.85,
      max_tokens: 4096,
    }),
  });
  const data = await resp.json();
  if (!data.choices?.[0]?.message?.content) {
    console.error('API Error:', JSON.stringify(data).slice(0, 500));
    return null;
  }
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.error('JSON parse error:', e.message);
    return null;
  }
}

const SYSTEM = `你是上海深象科技旗下"深象OPCS研究院"的资深内容策划。你专注于"一人公司"（One Person Company / Solopreneur）领域。
要求：
- 内容基于2026年4月的真实行业动态和趋势
- 文风自然专业，避免AI腔调和公式化表达
- 每篇文章的标题、结构、角度都要有差异化
- 作者统一为"深象OPCS研究院"
- 数据和案例要具体、可信
- 返回严格的JSON格式`;

async function generateCategory(categoryKey, label, prompt) {
  console.log(`\n📝 生成 ${label} (${categoryKey})...`);
  const result = await callQwen(SYSTEM, prompt);
  if (result?.articles) {
    console.log(`  ✓ 获得 ${result.articles.length} 篇文章`);
    return result.articles;
  }
  console.log(`  ✗ 生成失败`);
  return [];
}

async function main() {
  const allArticles = [];
  let idCounter = 100;

  // ========== 1. 今日快讯 ==========
  const news = await generateCategory('news', '今日快讯', `生成4篇"今日快讯"类文章，围绕一人公司、独立创业与内容行业的最新动态。
时间设定为2026年4月中旬。要求新闻感强、信息密度高、有行业洞察。

参考方向：
- AI工具最新发布对创业者的影响
- 海外Solopreneur生态新动向
- 国内创业政策或平台变化
- 知名创业者/KOL的最新动态

返回JSON：{"articles":[{"title":"标题","summary":"80-120字摘要","date":"2026-04-XX","readTime":"X 分钟","tags":["标签1","标签2"],"featured":true/false,"viewCount":数字,"likeCount":数字,"commentCount":数字}]}`);

  for (const a of news) {
    allArticles.push({ ...a, id: idCounter++, categoryKey: 'news', mediaType: 'article', author: '深象OPCS研究院' });
  }

  // ========== 2. 思想前沿 ==========
  const thoughts = await generateCategory('thoughts', '思想前沿', `生成4篇"思想前沿"类文章，汇聚全球创业先行者的前沿思考、核心观点与实践方法论。
时间设定为2026年4月。要求有思想深度，引用真实人物的理念。

参考方向（每篇选不同人物/理念）：
- Paul Graham 的最新创业思考
- 李笑来/刘润等国内商业思想家的观点
- 海外Solopreneur领域的新理论（如Creator Economy 3.0）
- 关于AI时代个人价值重塑的深度思考

返回JSON：{"articles":[{"title":"标题","summary":"80-120字摘要","date":"2026-04-XX","readTime":"X 分钟","tags":["标签1","标签2"],"featured":true/false,"viewCount":数字,"likeCount":数字,"commentCount":数字}]}`);

  for (const a of thoughts) {
    allArticles.push({ ...a, id: idCounter++, categoryKey: 'thoughts', mediaType: 'article', author: '深象OPCS研究院' });
  }

  // ========== 3. 深度研究 ==========
  const research = await generateCategory('research', '深度研究', `生成3篇"深度研究"类文章，沉淀OPC方法论、概念框架、行业模型与长期研究判断。
时间设定为2026年4月。要求学术级深度，有原创框架和模型。

参考方向：
- 深象OPCS研究院原创的方法论框架
- 一人公司的商业模式分类学
- AI原生内容生产的范式研究

返回JSON：{"articles":[{"title":"标题","summary":"100-150字摘要","date":"2026-04-XX","readTime":"X 分钟","tags":["标签1","标签2"],"featured":true/false,"viewCount":数字,"likeCount":数字,"commentCount":数字}]}`);

  for (const a of research) {
    allArticles.push({ ...a, id: idCounter++, categoryKey: 'research', mediaType: 'article', author: '深象OPCS研究院' });
  }

  // ========== 4. 政策风向 ==========
  const policy = await generateCategory('policy', '政策风向', `生成3篇"政策风向"类文章，跟踪与一人公司、个体经营和创业相关的政策与法规动态。
时间设定为2026年4月。要求政策解读专业准确，有实操建议。

参考方向：
- 2026年个体工商户/小微企业税收优惠政策
- 数字经济相关法规对创业者的影响
- 跨境经营合规要点

返回JSON：{"articles":[{"title":"标题","summary":"80-120字摘要","date":"2026-04-XX","readTime":"X 分钟","tags":["标签1","标签2"],"featured":true/false,"viewCount":数字,"likeCount":数字,"commentCount":数字}]}`);

  for (const a of policy) {
    allArticles.push({ ...a, id: idCounter++, categoryKey: 'policy', mediaType: 'article', author: '深象OPCS研究院' });
  }

  // ========== 5. 实战拆解 ==========
  const cases = await generateCategory('cases', '实战拆解', `生成3篇"实战拆解"类文章，拆解真实创业案例、增长路径、商业模型与可复制策略。
时间设定为2026年4月。要求案例具体、数据翔实、可复制。

参考方向（每篇不同类型的创业者）：
- 独立开发者的SaaS产品增长案例
- 内容创作者的多平台变现路径
- 知识付费/咨询服务的商业模式升级

返回JSON：{"articles":[{"title":"标题","summary":"80-120字摘要","date":"2026-04-XX","readTime":"X 分钟","tags":["标签1","标签2"],"featured":true/false,"viewCount":数字,"likeCount":数字,"commentCount":数字}]}`);

  for (const a of cases) {
    allArticles.push({ ...a, id: idCounter++, categoryKey: 'cases', mediaType: 'article', author: '深象OPCS研究院' });
  }

  // ========== 6. 深度报告 ==========
  const reports = await generateCategory('reports', '深度报告', `生成3篇"深度报告"类文章，行业周报、月报与专题研究报告。
时间设定为2026年4月。要求数据驱动，有图表描述。

参考方向：
- 2026年一人公司年度趋势报告
- 一人公司周报（最新一期）
- 2026年Q1工具生态报告

返回JSON：{"articles":[{"title":"标题","summary":"80-120字摘要","date":"2026-04-XX","readTime":"X 分钟","tags":["标签1","标签2"],"featured":true/false,"viewCount":数字,"likeCount":数字,"commentCount":数字,"downloadUrl":"#"}]}`);

  for (const a of reports) {
    allArticles.push({ ...a, id: idCounter++, categoryKey: 'reports', mediaType: 'report', author: '深象OPCS研究院', downloadUrl: a.downloadUrl || '#' });
  }

  // ========== 7. 工具图谱 ==========
  const toolkit = await generateCategory('toolkit', '工具图谱', `生成3篇"工具图谱"类文章，一人公司全链路工具链评测、组合方案与效率指南。
时间设定为2026年4月。要求实操性强，有对比评测。

参考方向：
- 2026年一人公司必备工具链完整配置
- AI编程工具横评（Cursor/Windsurf/Copilot等）
- 内容创作全链路工具组合方案

返回JSON：{"articles":[{"title":"标题","summary":"80-120字摘要","date":"2026-04-XX","readTime":"X 分钟","tags":["标签1","标签2"],"featured":true/false,"viewCount":数字,"likeCount":数字,"commentCount":数字}]}`);

  for (const a of toolkit) {
    allArticles.push({ ...a, id: idCounter++, categoryKey: 'toolkit', mediaType: 'tool_review', author: '深象OPCS研究院' });
  }

  // ========== 8. 生成趋势数据 ==========
  console.log('\n📊 生成趋势数据...');
  const trendData = await callQwen(SYSTEM, `生成2026年4月最新的一人公司行业趋势数据，用于官网数据看板展示。

返回JSON：{
  "hotKeywords": [{"text":"关键词","weight":权重(40-95)}] (15个热词),
  "industryMetrics": [{"label":"指标名","value":数值,"change":同比变化百分比}] (4个核心指标),
  "weeklyGrowth": [{"week":"W1","articles":数字,"views":数字}] (6周数据)
}`);

  // ========== 输出结果 ==========
  console.log(`\n✅ 共生成 ${allArticles.length} 篇文章`);
  
  // 写入JSON文件
  const output = {
    articles: allArticles,
    trendData: trendData || null,
  };
  
  const fs = await import('fs');
  fs.writeFileSync('/home/ubuntu/opc-admin/generated-content.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log('📁 已保存到 generated-content.json');
}

main().catch(console.error);
