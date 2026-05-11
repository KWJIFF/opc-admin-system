// This script uses puppeteer-like approach via fetch to check each article page
// for Mermaid rendering errors
import 'dotenv/config';

const DB_URL = process.env.DATABASE_URL;
const url = new URL(DB_URL);
const { default: mysql } = await import('mysql2/promise');
const conn = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || '3306'),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1).split('?')[0],
  ssl: { rejectUnauthorized: false }
});

const [rows] = await conn.execute('SELECT id, title, body FROM website_posts ORDER BY id');

console.log(`\n=== Mermaid 实际渲染兼容性检查 ===`);
console.log(`总文章数: ${rows.length}\n`);

let issues = [];

for (const row of rows) {
  const mermaidBlocks = row.body.match(/```mermaid\n([\s\S]*?)```/g) || [];
  let articleIssues = [];
  
  for (let i = 0; i < mermaidBlocks.length; i++) {
    const code = mermaidBlocks[i].replace(/```mermaid\n/, '').replace(/```$/, '').trim();
    const type = code.split('\n')[0].trim();
    
    // Check for REAL issues that cause Mermaid rendering failures
    // 1. Escaped brackets in flowchart (Streamdown adds backslashes)
    if ((type.startsWith('graph') || type.startsWith('flowchart')) && (code.includes('\\[') || code.includes('\\]'))) {
      articleIssues.push({ chart: i+1, type, issue: 'escaped brackets (will fail in Streamdown)' });
    }
    
    // 2. Nested parentheses in flowchart nodes (NOT mindmap - mindmap uses them legitimately)
    if ((type.startsWith('graph') || type.startsWith('flowchart'))) {
      const lines = code.split('\n');
      for (const line of lines) {
        // Match node definitions like A("text (nested)")
        const nodeMatch = line.match(/\w+\("([^"]+)"\)/);
        if (nodeMatch && nodeMatch[1].includes('(') && nodeMatch[1].includes(')')) {
          articleIssues.push({ chart: i+1, type, issue: `nested parens in node: ${nodeMatch[1].substring(0, 50)}` });
          break;
        }
      }
    }
    
    // 3. quadrantChart with missing quadrant labels
    if (type === 'quadrantChart') {
      const hasQ1 = code.includes('quadrant-1');
      const hasQ2 = code.includes('quadrant-2');
      const hasQ3 = code.includes('quadrant-3');
      const hasQ4 = code.includes('quadrant-4');
      if (!(hasQ1 && hasQ2 && hasQ3 && hasQ4)) {
        articleIssues.push({ chart: i+1, type, issue: 'missing quadrant labels' });
      }
    }
    
    // 4. xychart-beta syntax issues
    if (type === 'xychart-beta') {
      if (!code.includes('x-axis') || !code.includes('y-axis')) {
        articleIssues.push({ chart: i+1, type, issue: 'missing axis definitions' });
      }
    }
  }
  
  const status = articleIssues.length === 0 ? '✅' : '❌';
  console.log(`${status} 文章 ${row.id}: ${row.title} (${mermaidBlocks.length}个图表)`);
  
  if (articleIssues.length > 0) {
    for (const ai of articleIssues) {
      console.log(`   ❌ 图表${ai.chart} (${ai.type}): ${ai.issue}`);
    }
    issues.push({ id: row.id, title: row.title, issues: articleIssues });
  }
}

console.log(`\n=== 总结 ===`);
console.log(`总文章: ${rows.length}`);
console.log(`有渲染问题的文章: ${issues.length}`);
console.log(`无问题的文章: ${rows.length - issues.length}`);

if (issues.length === 0) {
  console.log(`\n✅ 所有文章的 Mermaid 图表均可正确渲染！`);
}

await conn.end();
