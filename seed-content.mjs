import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
const DASHSCOPE_API_KEY = 'sk-ab6c113f5d98447682a86db256d9ce69';
const LLM_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

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
      temperature: 0.8,
    }),
  });
  const data = await resp.json();
  if (!data.choices?.[0]?.message?.content) {
    console.error('API Error:', JSON.stringify(data));
    return null;
  }
  return JSON.parse(data.choices[0].message.content);
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  const adminId = 750043; // admin user id

  console.log('🚀 开始通过千问 API 生成内容数据...\n');

  // ========== 1. 生成信号（情报） ==========
  console.log('📡 生成情报信号...');
  const signalsData = await callQwen(
    '你是一个专注于"一人公司"和"个人创业者"领域的内容运营专家。请生成JSON格式数据。',
    `生成8条与"一人公司创业者"相关的情报信号，涵盖：AI工具赋能个人创业、自媒体变现、知识付费、独立开发者、远程办公、个人品牌打造、小而美商业模式、创业者心理健康等方向。
    
    返回JSON格式：
    {
      "signals": [
        {
          "title": "信号标题（具体、有吸引力）",
          "source": "来源名称",
          "sourceUrl": "https://example.com",
          "summary": "100字左右的摘要",
          "content": "300字左右的详细内容",
          "category": "分类（如：AI工具/自媒体/知识付费/独立开发/商业模式/行业趋势）",
          "tags": ["标签1", "标签2", "标签3"],
          "priority": "high/medium/low"
        }
      ]
    }`
  );

  if (signalsData?.signals) {
    for (const s of signalsData.signals) {
      await conn.execute(
        'INSERT INTO signals (title, source, sourceUrl, summary, content, category, tags, priority, status, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.title, s.source, s.sourceUrl, s.summary, s.content, s.category, JSON.stringify(s.tags), s.priority || 'medium', 'new', adminId]
      );
    }
    console.log(`  ✓ 插入 ${signalsData.signals.length} 条信号`);
  }

  // ========== 2. 生成选题 ==========
  console.log('📋 生成选题...');
  const topicsData = await callQwen(
    '你是一个专注于"一人公司"和"个人创业者"领域的内容策划专家。请生成JSON格式数据。',
    `生成6个与"一人公司创业者"相关的内容选题，要求：
    - 选题要有深度，不是泛泛而谈
    - 涵盖实操指南、案例分析、工具测评、趋势洞察等不同类型
    - 目标平台包括公众号、小红书、知乎等
    
    返回JSON格式：
    {
      "topics": [
        {
          "title": "选题标题",
          "description": "200字左右的选题说明，包含角度、目标读者、核心论点",
          "category": "分类",
          "tags": ["标签1", "标签2"],
          "targetPlatforms": ["wechat_mp", "xiaohongshu"],
          "aiSuggestion": "AI对这个选题的建议和优化方向",
          "priority": "high/medium",
          "status": "approved/draft"
        }
      ]
    }`
  );

  if (topicsData?.topics) {
    for (const t of topicsData.topics) {
      await conn.execute(
        'INSERT INTO topics (title, description, category, tags, targetPlatforms, aiSuggestion, status, priority, createdBy, approvedBy, approvedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [t.title, t.description, t.category, JSON.stringify(t.tags), JSON.stringify(t.targetPlatforms), t.aiSuggestion, t.status || 'approved', t.priority || 'medium', adminId, t.status === 'approved' ? adminId : null, t.status === 'approved' ? new Date() : null]
      );
    }
    console.log(`  ✓ 插入 ${topicsData.topics.length} 个选题`);
  }

  // ========== 3. 生成内容（母稿） ==========
  console.log('📝 生成内容母稿...');
  const contentsData = await callQwen(
    '你是一个专注于"一人公司"和"个人创业者"领域的资深内容创作者。文风自然流畅，有深度，避免AI腔调。请生成JSON格式数据。',
    `生成4篇与"一人公司创业者"相关的文章内容，要求：
    - 每篇文章800-1200字
    - 文风自然、有个人观点、避免公式化表达
    - 涵盖不同主题：实操指南、行业观察、工具推荐、创业故事
    
    返回JSON格式：
    {
      "contents": [
        {
          "title": "文章标题",
          "body": "完整的文章正文（Markdown格式，800-1200字）",
          "contentType": "article",
          "tags": ["标签1", "标签2"],
          "status": "draft/review_pending/ready",
          "wordCount": 预估字数
        }
      ]
    }`
  );

  if (contentsData?.contents) {
    for (const c of contentsData.contents) {
      await conn.execute(
        'INSERT INTO contents (title, body, contentType, tags, status, wordCount, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [c.title, c.body, c.contentType || 'article', JSON.stringify(c.tags), c.status || 'draft', c.wordCount || 1000, adminId]
      );
    }
    console.log(`  ✓ 插入 ${contentsData.contents.length} 篇内容`);
  }

  // ========== 4. 生成媒体账号 ==========
  console.log('📱 生成媒体账号...');
  const accounts = [
    { platform: 'wechat_mp', accountName: '深象一人公司', accountId: 'shenxiang_opcs', description: '专注一人公司创业方法论，帮助个人创业者实现小而美的商业模式', followers: 3200, status: 'active' },
    { platform: 'xiaohongshu', accountName: '深象创业笔记', accountId: 'shenxiang_xhs', description: '分享一人公司创业干货、工具测评、效率提升技巧', followers: 8500, status: 'active' },
    { platform: 'zhihu', accountName: '深象科技', accountId: 'shenxiang_zhihu', description: '深度解析一人公司商业模式与创业策略', followers: 5600, status: 'active' },
    { platform: 'bilibili', accountName: '深象OPCS', accountId: 'shenxiang_bili', description: '一人公司创业Vlog、工具教程、商业案例', followers: 1200, status: 'pending_auth' },
    { platform: 'website', accountName: 'OPCS官网', accountId: 'opcs.vip', description: '深象OPCS一人公司创业者服务平台官方网站', followers: 0, status: 'active' },
  ];

  for (const a of accounts) {
    await conn.execute(
      'INSERT INTO media_accounts (platform, accountName, accountId, description, followers, status) VALUES (?, ?, ?, ?, ?, ?)',
      [a.platform, a.accountName, a.accountId, a.description, a.followers, a.status]
    );
  }
  console.log(`  ✓ 插入 ${accounts.length} 个媒体账号`);

  // ========== 5. 生成来源 ==========
  console.log('🔗 生成信息来源...');
  const sourcesList = [
    { name: '36氪-创业频道', sourceType: 'rss', url: 'https://36kr.com/feed', status: 'active' },
    { name: '少数派', sourceType: 'rss', url: 'https://sspai.com/feed', status: 'active' },
    { name: 'ProductHunt', sourceType: 'api', url: 'https://www.producthunt.com', status: 'active' },
    { name: '即刻-创业圈', sourceType: 'social', url: 'https://web.okjike.com', status: 'active' },
    { name: 'Hacker News', sourceType: 'api', url: 'https://news.ycombinator.com', status: 'active' },
    { name: '知识星球-生财有术', sourceType: 'manual', url: null, status: 'active' },
  ];

  for (const s of sourcesList) {
    await conn.execute(
      'INSERT INTO sources (name, sourceType, url, status) VALUES (?, ?, ?, ?)',
      [s.name, s.sourceType, s.url, s.status]
    );
  }
  console.log(`  ✓ 插入 ${sourcesList.length} 个信息来源`);

  // ========== 6. 生成内容模板 ==========
  console.log('📄 生成内容模板...');
  const templates = [
    { name: '公众号长文模板', templateType: 'article', platform: 'wechat_mp', structure: JSON.stringify({ sections: ['引言（痛点切入）', '核心观点', '案例/数据支撑', '实操步骤', '总结与行动建议'] }), promptTemplate: '请围绕"{topic}"撰写一篇公众号文章，目标读者是一人公司创业者，字数2000-3000字，文风专业但不枯燥。' },
    { name: '小红书图文模板', templateType: 'social_post', platform: 'xiaohongshu', structure: JSON.stringify({ sections: ['吸引眼球的开头', '3-5个核心要点', '个人经验分享', '互动引导'] }), promptTemplate: '请围绕"{topic}"撰写一篇小红书笔记，字数500-800字，语气亲切活泼，多用emoji，适合一人公司创业者阅读。' },
    { name: '知乎深度回答模板', templateType: 'article', platform: 'zhihu', structure: JSON.stringify({ sections: ['问题拆解', '多维度分析', '数据/案例', '个人实践', '结论'] }), promptTemplate: '请围绕"{topic}"撰写一篇知乎回答，要求有深度、有数据支撑、有个人见解，字数1500-2500字。' },
  ];

  for (const t of templates) {
    await conn.execute(
      'INSERT INTO content_templates (name, templateType, platform, structure, promptTemplate, status) VALUES (?, ?, ?, ?, ?, ?)',
      [t.name, t.templateType, t.platform, t.structure, t.promptTemplate, 'active']
    );
  }
  console.log(`  ✓ 插入 ${templates.length} 个内容模板`);

  // ========== 7. 生成日历事件 ==========
  console.log('📅 生成日历事件...');
  const now = new Date();
  const calEvents = [
    { title: '公众号周更：AI工具盘点', eventType: 'publish', platform: 'wechat_mp', daysOffset: 1 },
    { title: '小红书日更：创业效率Tips', eventType: 'publish', platform: 'xiaohongshu', daysOffset: 0 },
    { title: '知乎专栏：一人公司月度复盘', eventType: 'publish', platform: 'zhihu', daysOffset: 3 },
    { title: '内容审核会议', eventType: 'meeting', platform: null, daysOffset: 2 },
    { title: '月度数据报告截止', eventType: 'deadline', platform: null, daysOffset: 7 },
    { title: 'B站视频发布：工具教程', eventType: 'publish', platform: 'bilibili', daysOffset: 5 },
  ];

  for (const e of calEvents) {
    const startAt = new Date(now.getTime() + e.daysOffset * 86400000);
    startAt.setHours(10, 0, 0, 0);
    await conn.execute(
      'INSERT INTO calendar_events (title, eventType, platform, startAt, status, createdBy) VALUES (?, ?, ?, ?, ?, ?)',
      [e.title, e.eventType, e.platform, startAt, 'scheduled', adminId]
    );
  }
  console.log(`  ✓ 插入 ${calEvents.length} 个日历事件`);

  // ========== 8. 生成工作流 ==========
  console.log('⚙️ 生成工作流...');
  const workflowsList = [
    {
      name: '信号→选题自动转化',
      description: '当高优先级信号被标记后，自动生成选题草稿并通知审核',
      trigger: JSON.stringify({ type: 'signal_priority', condition: 'high' }),
      steps: JSON.stringify([
        { action: 'ai_generate_topic', params: { model: 'qwen-plus' } },
        { action: 'notify_reviewer', params: { channel: 'wechat' } },
      ]),
      status: 'active',
    },
    {
      name: '内容审核→发布流水线',
      description: '内容审核通过后，自动适配各平台格式并排入发布队列',
      trigger: JSON.stringify({ type: 'review_approved' }),
      steps: JSON.stringify([
        { action: 'adapt_platform_format', params: { platforms: ['wechat_mp', 'xiaohongshu'] } },
        { action: 'schedule_publish', params: { delay: '1h' } },
      ]),
      status: 'active',
    },
    {
      name: '每周数据报告自动生成',
      description: '每周一自动汇总上周各平台数据，生成周报',
      trigger: JSON.stringify({ type: 'cron', expression: '0 9 * * 1' }),
      steps: JSON.stringify([
        { action: 'collect_platform_data' },
        { action: 'ai_generate_report', params: { type: 'weekly' } },
        { action: 'notify_owner' },
      ]),
      status: 'active',
    },
  ];

  for (const w of workflowsList) {
    await conn.execute(
      'INSERT INTO workflows (name, description, `trigger`, steps, status, createdBy) VALUES (?, ?, ?, ?, ?, ?)',
      [w.name, w.description, w.trigger, w.steps, w.status, adminId]
    );
  }
  console.log(`  ✓ 插入 ${workflowsList.length} 个工作流`);

  await conn.end();
  console.log('\n✅ 所有内容数据已通过千问 API 生成并填充完成！');
}

main().catch(console.error);
