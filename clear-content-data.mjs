import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // 需要清除的内容数据表（按依赖顺序，先清子表再清父表）
  const contentTables = [
    'audit_logs',
    'comments',
    'bookmarks',
    'likes',
    'article_views',
    'ai_interactions',
    'data_loop_suggestions',
    'review_tasks',
    'publish_tasks',
    'calendar_events',
    'website_posts',
    'reports',
    'insight_tasks',
    'workflows',
    'contents',
    'topics',
    'signals',
    'sources',
    'media_accounts',
    'content_templates',
    'subscribers',
  ];

  // 保留的表：users, team_invites
  
  for (const table of contentTables) {
    try {
      const [result] = await conn.execute(`DELETE FROM \`${table}\``);
      console.log(`✓ ${table}: deleted ${result.affectedRows} rows`);
    } catch (err) {
      console.log(`⚠ ${table}: ${err.message}`);
    }
  }
  
  // 验证 users 表未被影响
  const [users] = await conn.execute('SELECT id, username, name, role FROM users');
  console.log('\n保留的用户:');
  users.forEach(u => console.log(`  - ${u.username || u.name} (${u.role})`));
  
  await conn.end();
  console.log('\n✅ 所有内容数据已清除，用户数据已保留');
}

main().catch(console.error);
