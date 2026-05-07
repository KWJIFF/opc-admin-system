import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // Hash the new password
  const newPassword = 'Kwjiff-5240501';
  const hash = await bcrypt.hash(newPassword, 12);
  
  // Update admin user: set password and role
  const [result] = await conn.execute(
    'UPDATE users SET passwordHash = ?, role = ? WHERE username = ?',
    [hash, 'admin', 'admin']
  );
  
  console.log('Updated rows:', result.affectedRows);
  
  // Verify
  const [rows] = await conn.execute(
    'SELECT id, openId, username, name, role, status FROM users WHERE username = ?',
    ['admin']
  );
  console.log('Admin user:', rows[0]);
  
  await conn.end();
}

main().catch(console.error);
