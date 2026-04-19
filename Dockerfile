# ============================================
# 深象 OPCS - 多阶段 Docker 构建
# 适用于阿里云 ECS 部署
# ============================================

# --- 阶段 1: 依赖安装 ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Copy patches directory if it exists
COPY patches/ ./patches/
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm install --frozen-lockfile --prod=false

# --- 阶段 2: 构建 ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm run build

# --- 阶段 3: 生产运行 ---
FROM node:22-alpine AS runner
WORKDIR /app

# 安装生产依赖
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/shared ./shared

# 环境变量（运行时通过 docker-compose 或 .env 注入）
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

EXPOSE 3000

CMD ["node", "dist/index.js"]
