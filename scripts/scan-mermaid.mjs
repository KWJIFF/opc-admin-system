import 'dotenv/config';

const DB_URL = process.env.DATABASE_URL;
const url = new URL(DB_URL);
const [user, password] = [url.username, url.password];
const host = url.hostname;
const port = url.port || '3306';
const database = url.pathname.slice(1).split('?')[0];

const { default: mysql } = await import('mysql2/promise');
const conn = await mysql.createConnection({ host, port: Number(port), user, password, database, ssl: { rejectUnauthorized: false } });

const [rows] = await conn.execute('SELECT id, title, body FROM website_posts ORDER BY id');

let totalArticles = 0;
let totalCharts = 0;
let errorArticles = [];

for (const row of rows) {
  totalArticles++;
  const mermaidBlocks = row.body.match(/```mermaid\n([\s\S]*?)```/g) || [];
  totalCharts += mermaidBlocks.length;
  
  for (const block of mermaidBlocks) {
    const code = block.replace(/```mermaid\n/, '').replace(/```$/, '').trim();
    // Check for common syntax issues
    const issues = [];
    if (code.includes('\\[') || code.includes('\\]')) issues.push('escaped brackets');
    if (code.includes('\\(') || code.includes('\\)')) issues.push('escaped parens');
    if (/\([^)]*\([^)]*\)/.test(code)) issues.push('nested parens in node');
    if (/\[[^\]]*\[[^\]]*\]/.test(code)) issues.push('nested brackets in node');
    if (/"[^"]*"[^"]*"/.test(code)) issues.push('nested quotes');
    
    if (issues.length > 0) {
      errorArticles.push({ id: row.id, title: row.title, issues: issues.join(', '), snippet: code.substring(0, 100) });
    }
  }
}

console.log(`\n=== Mermaid 全量扫描结果 ===`);
console.log(`总文章数: ${totalArticles}`);
console.log(`总图表数: ${totalCharts}`);
console.log(`有问题的图表: ${errorArticles.length}`);

if (errorArticles.length > 0) {
  console.log(`\n--- 问题详情 ---`);
  for (const e of errorArticles) {
    console.log(`  文章 ${e.id} (${e.title}): ${e.issues}`);
    console.log(`    代码片段: ${e.snippet}`);
  }
} else {
  console.log(`\n✅ 所有图表语法检查通过！`);
}

await conn.end();
