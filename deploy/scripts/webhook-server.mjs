/**
 * 深象 OPCS - GitHub Webhook 自动部署服务
 * 
 * 功能：监听 GitHub push 事件，自动拉取代码并重新部署
 * 运行：node webhook-server.mjs
 * 
 * 环境变量：
 *   WEBHOOK_SECRET - GitHub Webhook 密钥（在 GitHub 仓库设置中配置的同一个值）
 *   WEBHOOK_PORT   - 监听端口（默认 9000）
 *   DEPLOY_PATH    - 项目部署路径（默认 /opt/opcs）
 */

import http from "http";
import crypto from "crypto";
import { execSync } from "child_process";

const SECRET = process.env.WEBHOOK_SECRET || "your-webhook-secret-change-me";
const PORT = parseInt(process.env.WEBHOOK_PORT || "9000");
const DEPLOY_PATH = process.env.DEPLOY_PATH || "/opt/opcs";

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function verifySignature(payload, signature) {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(payload);
  const digest = `sha256=${hmac.digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

function deploy() {
  log("开始自动部署...");
  try {
    // 拉取最新代码
    log("步骤 1/3: 拉取最新代码...");
    execSync(`cd ${DEPLOY_PATH} && git pull origin main`, {
      stdio: "inherit",
      timeout: 60000,
    });

    // 重新构建并启动容器
    log("步骤 2/3: 重新构建 Docker 镜像...");
    execSync(`cd ${DEPLOY_PATH} && docker compose up -d --build`, {
      stdio: "inherit",
      timeout: 300000,
    });

    // 清理旧镜像
    log("步骤 3/3: 清理旧镜像...");
    execSync("docker image prune -f", { stdio: "inherit", timeout: 30000 });

    log("部署成功！");
    return true;
  } catch (err) {
    log(`部署失败: ${err.message}`);
    return false;
  }
}

const server = http.createServer((req, res) => {
  // 健康检查
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", time: new Date().toISOString() }));
    return;
  }

  // 只接受 POST /webhook
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    // 验证签名
    const signature = req.headers["x-hub-signature-256"];
    if (!verifySignature(body, signature)) {
      log("签名验证失败，拒绝请求");
      res.writeHead(401);
      res.end("Unauthorized");
      return;
    }

    // 解析事件
    const event = req.headers["x-github-event"];
    if (event !== "push") {
      log(`忽略非 push 事件: ${event}`);
      res.writeHead(200);
      res.end("OK - ignored");
      return;
    }

    try {
      const payload = JSON.parse(body);
      const branch = payload.ref?.replace("refs/heads/", "");
      if (branch !== "main") {
        log(`忽略非 main 分支: ${branch}`);
        res.writeHead(200);
        res.end("OK - ignored branch");
        return;
      }

      log(`收到 push 事件 - 提交者: ${payload.pusher?.name}, 消息: ${payload.head_commit?.message}`);
      
      // 异步执行部署（不阻塞响应）
      res.writeHead(200);
      res.end("OK - deploying");
      
      // 延迟 2 秒执行，避免 GitHub 超时
      setTimeout(() => deploy(), 2000);
    } catch (err) {
      log(`解析失败: ${err.message}`);
      res.writeHead(400);
      res.end("Bad Request");
    }
  });
});

server.listen(PORT, () => {
  log(`========================================`);
  log(`  深象 OPCS Webhook 自动部署服务`);
  log(`  监听端口: ${PORT}`);
  log(`  部署路径: ${DEPLOY_PATH}`);
  log(`  Webhook 地址: http://YOUR_ECS_IP:${PORT}/webhook`);
  log(`  健康检查: http://YOUR_ECS_IP:${PORT}/health`);
  log(`========================================`);
});
