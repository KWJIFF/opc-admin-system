// 直接测试千问 API 调用
const key = process.env.ALIYUN_DASHSCOPE_API_KEY;
console.log('=== 千问 API 直接调用测试 ===');
console.log('Key available:', !!key, key ? key.substring(0, 10) + '...' : 'N/A');

if (!key) {
  console.log('ERROR: ALIYUN_DASHSCOPE_API_KEY not found in environment');
  process.exit(1);
}

const startTime = Date.now();
console.log('\n调用千问 qwen-max 模型...');

try {
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-max',
      messages: [
        { role: 'system', content: '你是深象OPCS一人公司创业服务平台的AI内容助手。' },
        { role: 'user', content: '用50字简要介绍一人公司创业的核心优势。' }
      ]
    })
  });

  const elapsed = Date.now() - startTime;
  const data = await response.json();

  if (data.choices && data.choices[0]) {
    console.log(`\n✅ 千问 API 调用成功！`);
    console.log(`耗时: ${(elapsed / 1000).toFixed(1)} 秒`);
    console.log(`模型: ${data.model}`);
    console.log(`内容: ${data.choices[0].message.content}`);
    console.log(`Token用量: prompt=${data.usage.prompt_tokens}, completion=${data.usage.completion_tokens}, total=${data.usage.total_tokens}`);
  } else {
    console.log(`\n❌ 千问 API 调用失败`);
    console.log('响应:', JSON.stringify(data, null, 2));
  }
} catch (error) {
  console.log(`\n❌ 请求错误: ${error.message}`);
}
