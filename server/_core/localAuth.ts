/**
 * 本地认证路由（自托管模式）
 * 
 * 登录通过 tRPC auth.login mutation 实现（统一入口）。
 * 此文件仅提供注册和修改密码的 REST 路由。
 * 
 * 当 OAUTH_SERVER_URL 未配置时，系统自动启用本地用户名密码登录。
 * 与 OAuth 路由并存，不冲突。
 */
import bcrypt from "bcryptjs";
import type { Express, Request, Response } from "express";
import * as db from "../db";

export function registerLocalAuthRoutes(app: Express) {
  /**
   * POST /api/auth/register
   * Body: { username: string, password: string, name?: string, email?: string, phone?: string }
   * 
   * 安全策略：
   * - 第一个注册的用户自动成为 admin
   * - 后续用户默认为 user 角色
   * - admin 提权只能通过数据库直接操作
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, name, email, phone } = req.body ?? {};

      if (!username || !password) {
        res.status(400).json({ error: "用户名和密码不能为空" });
        return;
      }

      if (typeof username !== "string" || username.length < 2 || username.length > 50) {
        res.status(400).json({ error: "用户名长度应在 2-50 个字符之间" });
        return;
      }

      if (typeof password !== "string" || password.length < 6) {
        res.status(400).json({ error: "密码长度至少 6 位" });
        return;
      }

      // 检查用户名是否已存在
      const existing = await db.getUserByUsername(username);
      if (existing) {
        res.status(409).json({ error: "用户名已存在" });
        return;
      }

      // 判断是否为首个用户（自动设为 admin）
      const dbInstance = await db.getDb();
      let isFirstUser = false;
      if (dbInstance) {
        const { users: usersTable } = await import("../../drizzle/schema");
        const { count } = await import("drizzle-orm");
        const [result] = await dbInstance.select({ c: count() }).from(usersTable);
        isFirstUser = result.c === 0;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await db.createLocalUser({
        username,
        passwordHash,
        name: name || username,
        email: email || undefined,
        phone: phone || undefined,
        role: isFirstUser ? "admin" : "user",
      });

      res.json({
        success: true,
        user: { id: result.id, username, role: isFirstUser ? "admin" : "user" },
        isFirstUser,
      });
    } catch (error) {
      console.error("[LocalAuth] Register failed:", error);
      res.status(500).json({ error: "注册失败，请稍后重试" });
    }
  });

  console.log("[LocalAuth] Local authentication routes registered");
}
