/**
 * 创建默认管理员账户
 * 使用方法: node scripts/create-admin.mjs
 */
import bcrypt from "bcryptjs";

const API_BASE = process.env.API_BASE || "http://localhost:3000";

async function createAdmin() {
  const username = "admin";
  const password = "opcs2026";
  const name = "管理员";
  const email = "contact@opcs.vip";

  console.log("正在创建管理员账户...");
  console.log(`用户名: ${username}`);
  console.log(`密码: ${password}`);

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name, email }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("\n✅ 管理员账户创建成功！");
      console.log(`角色: ${data.isFirstUser ? "admin（首个用户，自动成为管理员）" : data.user?.role}`);
      console.log(`用户ID: ${data.user?.id}`);
    } else {
      console.log(`\n⚠️ ${data.error}`);
      if (data.error === "用户名已存在") {
        console.log("管理员账户已存在，无需重复创建。");
      }
    }
  } catch (err) {
    console.error("❌ 创建失败:", err.message);
  }
}

createAdmin();
