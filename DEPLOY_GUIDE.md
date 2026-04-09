# 深象 OPCS - 阿里云部署指南

本文档详细说明如何将深象 OPCS 内容运营管理平台从 Vercel 完整迁移到阿里云，并配置所有必要的云服务。

---

## 一、阿里云服务总览

深象 OPCS 作为一个可持续运营的内容管理平台，需要以下阿里云服务协同工作：

| 服务类别 | 阿里云产品 | 用途 | 推荐规格 | 预估月费 |
|---------|-----------|------|---------|---------|
| 计算 | ECS 云服务器 | 运行应用和 Docker 容器 | 2核4G（ecs.c7.large） | 约 150 元 |
| 数据库 | RDS MySQL | 业务数据存储 | 2核4G 基础版 | 约 80 元 |
| 缓存 | 云数据库 Redis | 会话缓存、任务队列 | 1G 标准版 | 约 30 元 |
| 对象存储 | OSS | 图片、文件、模板存储 | 标准存储 | 按量（约 5 元） |
| CDN | CDN 全站加速 | 静态资源加速 | 100GB 流量包 | 约 20 元 |
| 域名 | 域名服务 | opcs.vip（已购买） | - | 已购买 |
| SSL | 数字证书管理 | HTTPS 加密 | 免费 DV 证书 | 免费 |
| AI 大模型 | 百炼平台（通义千问） | AI 内容生成 | 按量付费 | 按用量 |
| 短信 | 短信服务 | 登录验证码 | 按量付费 | 约 5 元 |
| 邮件 | 邮件推送 | 系统通知邮件 | 免费额度 | 免费 |
| 日志 | SLS 日志服务 | 系统监控与日志分析 | 免费额度 | 免费 |
| 安全 | WAF 防火墙 | Web 应用防护 | 基础版 | 约 30 元 |
| 容器 | ACR 容器镜像 | Docker 镜像托管 | 个人版 | 免费 |

**预估总月费：约 320-400 元**（不含 AI 大模型按量费用）

---

## 二、ECS 云服务器购买与配置

### 2.1 推荐配置

对于初期运营阶段，推荐以下配置：

| 配置项 | 推荐值 | 说明 |
|-------|-------|------|
| 实例规格 | ecs.c7.large（2核4G） | 计算优化型，适合 Web 应用 |
| 操作系统 | Ubuntu 22.04 LTS | 长期支持版本，稳定可靠 |
| 系统盘 | ESSD 云盘 40GB | 高性能 SSD |
| 数据盘 | ESSD 云盘 100GB | 存放 Docker 数据和日志 |
| 带宽 | 5Mbps 固定带宽 | 配合 CDN 使用足够 |
| 地域 | 华东2（上海） | 国内访问延迟低 |
| 安全组 | 开放 22/80/443 端口 | SSH + HTTP + HTTPS |

当数据量增大后，可平滑升级到 4核8G 或更高配置。

### 2.2 购买步骤

1. 登录阿里云控制台，进入 **ECS 云服务器** 页面
2. 点击 **创建实例**，选择 **华东2（上海）** 地域
3. 选择实例规格 **ecs.c7.large**，操作系统 **Ubuntu 22.04 64位**
4. 配置系统盘 40GB ESSD + 数据盘 100GB ESSD
5. 选择 5Mbps 固定带宽
6. 设置安全组：开放 TCP 22、80、443 端口
7. 设置 root 密码或 SSH 密钥对
8. 确认购买

### 2.3 初始化服务器

SSH 登录后执行一键部署脚本：

```bash
# SSH 登录
ssh root@你的ECS公网IP

# 克隆项目代码
git clone https://github.com/KWJIFF/opc-admin-system.git /opt/opcs

# 运行一键部署脚本
cd /opt/opcs
sudo bash deploy/scripts/deploy.sh
```

---

## 三、RDS MySQL 数据库配置

### 3.1 购买 RDS

1. 进入阿里云 **RDS 管理控制台**
2. 创建实例：MySQL 8.0，基础版，2核4G
3. 地域选择与 ECS 相同（华东2-上海），确保内网互通
4. 设置数据库账号：`opcs_admin`
5. 创建数据库：`opcs_production`，字符集 `utf8mb4`

### 3.2 配置白名单

将 ECS 的内网 IP 添加到 RDS 白名单，确保内网访问。

### 3.3 获取连接地址

在 RDS 控制台获取 **内网连接地址**，格式如：`rm-bp1xxxxx.mysql.rds.aliyuncs.com:3306`

将连接信息填入 `.env.production`：

```
DATABASE_URL=mysql://opcs_admin:你的密码@rm-bp1xxxxx.mysql.rds.aliyuncs.com:3306/opcs_production
```

---

## 四、Redis 缓存配置

### 4.1 方案选择

**方案 A（推荐初期）**：使用 Docker 内置 Redis（docker-compose.yml 已配置），零成本。

**方案 B（数据量大时）**：购买阿里云 Redis，1G 标准版，与 ECS 同地域内网互通。

初期使用方案 A 即可，后续数据量增大再迁移到阿里云 Redis。

---

## 五、OSS 对象存储配置

### 5.1 创建 Bucket

1. 进入 **OSS 管理控制台**
2. 创建 Bucket：名称 `opcs-assets`，地域 **华东2（上海）**
3. 存储类型：**标准存储**
4. 读写权限：**公共读**（用于 CDN 加速）

### 5.2 配置跨域 CORS

在 Bucket 的 **权限管理 → 跨域设置** 中添加规则：

| 配置项 | 值 |
|-------|---|
| 来源 | https://opcs.vip |
| 允许 Methods | GET, POST, PUT |
| 允许 Headers | * |
| 暴露 Headers | ETag, x-oss-request-id |
| 缓存时间 | 3600 |

### 5.3 创建 AccessKey

在 **RAM 访问控制** 中创建子用户，授予 OSS 读写权限，获取 AccessKey ID 和 Secret。

---

## 六、CDN 全站加速

### 6.1 配置 CDN

1. 进入 **CDN 控制台**，添加加速域名 `cdn.opcs.vip`
2. 源站类型选择 **OSS 域名**，填入 `opcs-assets.oss-cn-shanghai.aliyuncs.com`
3. 加速区域选择 **全国**

### 6.2 DNS 解析

在域名解析中添加 CNAME 记录：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|-------|
| CNAME | cdn | CDN 分配的 CNAME 域名 |

---

## 七、域名解析与 SSL 证书

### 7.1 DNS 解析配置（从 Vercel 迁移）

在阿里云 **域名解析控制台** 中，将原来指向 Vercel 的记录修改为：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|-------|-----|
| A | @ | ECS 公网 IP | 600 |
| A | www | ECS 公网 IP | 600 |
| CNAME | cdn | CDN CNAME 地址 | 600 |

**迁移步骤**：先在 ECS 上部署好应用并测试通过，然后修改 DNS 解析，实现零停机迁移。

### 7.2 SSL 证书

**方案 A（推荐）**：阿里云免费 DV SSL 证书

1. 进入 **数字证书管理服务** 控制台
2. 申请免费 DV 证书，域名填 `opcs.vip`
3. 完成 DNS 验证后下载 Nginx 格式证书
4. 将证书文件放入 `deploy/certbot/conf/live/opcs.vip/` 目录

**方案 B**：Let's Encrypt 自动证书（部署脚本已内置支持）

部署脚本会自动通过 Certbot 获取和续期 Let's Encrypt 证书。

---

## 八、通义千问 API（百炼平台）

### 8.1 开通百炼平台

1. 访问 [百炼平台](https://bailian.console.aliyun.com/)
2. 开通服务并创建 API Key
3. 推荐模型配置：

| 用途 | 模型 | 说明 |
|-----|------|------|
| 文章写作 | qwen-max | 最强文本生成能力 |
| 长文处理 | qwen-long | 支持超长上下文 |
| 图片理解 | qwen-vl-max | 多模态视觉理解 |
| 日常对话 | qwen-plus | 性价比最优 |

### 8.2 配置环境变量

```
ALIYUN_DASHSCOPE_API_KEY=sk-你的API密钥
ALIYUN_DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIYUN_DASHSCOPE_MODEL=qwen-max
```

通义千问 API 兼容 OpenAI 格式，系统已预留适配接口，配置好 API Key 即可启用 AI 托管功能。

---

## 九、短信服务（登录验证码）

### 9.1 开通短信服务

1. 进入 **短信服务控制台**
2. 添加签名：`深象科技`（需企业资质审核）
3. 添加模板：验证码模板，内容如 `您的验证码为${code}，5分钟内有效。`
4. 获取模板 CODE

### 9.2 配置环境变量

```
ALIYUN_SMS_ACCESS_KEY_ID=你的AccessKey
ALIYUN_SMS_ACCESS_KEY_SECRET=你的Secret
ALIYUN_SMS_SIGN_NAME=深象科技
ALIYUN_SMS_TEMPLATE_CODE=SMS_xxxxxxxx
```

---

## 十、邮件推送服务

### 10.1 开通邮件推送

1. 进入 **邮件推送控制台**
2. 创建发信域名：`mail.opcs.vip`
3. 按提示配置 DNS 记录（SPF、DKIM、DMARC）
4. 创建发信地址：`noreply@mail.opcs.vip`

### 10.2 配置环境变量

```
ALIYUN_EMAIL_ACCOUNT=noreply@mail.opcs.vip
ALIYUN_EMAIL_FROM_ALIAS=深象科技
```

---

## 十一、SLS 日志服务

### 11.1 创建日志项目

1. 进入 **日志服务控制台**
2. 创建 Project：`opcs-logs`，地域 **华东2（上海）**
3. 创建 Logstore：`app-logs`，保存 30 天

### 11.2 配置 Logtail 采集

在 ECS 上安装 Logtail Agent，采集 Docker 容器日志和 Nginx 访问日志。

---

## 十二、WAF 防火墙

### 12.1 开通 WAF

1. 进入 **Web 应用防火墙控制台**
2. 开通基础版 WAF
3. 将域名 `opcs.vip` 接入 WAF
4. 配置防护规则：SQL 注入防护、XSS 防护、CC 攻击防护

---

## 十三、ACR 容器镜像仓库

### 13.1 创建镜像仓库

1. 进入 **容器镜像服务控制台**
2. 创建个人版实例（免费）
3. 创建命名空间：`shenxiang`
4. 创建镜像仓库：`opcs-app`

### 13.2 推送镜像

```bash
# 登录 ACR
docker login --username=你的阿里云账号 registry.cn-shanghai.aliyuncs.com

# 构建并推送
docker build -t registry.cn-shanghai.aliyuncs.com/shenxiang/opcs-app:latest .
docker push registry.cn-shanghai.aliyuncs.com/shenxiang/opcs-app:latest
```

---

## 十四、完整部署流程

### 14.1 一键部署

```bash
# 1. SSH 登录 ECS
ssh root@你的ECS公网IP

# 2. 克隆代码
git clone https://github.com/KWJIFF/opc-admin-system.git /opt/opcs
cd /opt/opcs

# 3. 运行部署脚本（安装 Docker、配置防火墙等）
sudo bash deploy/scripts/deploy.sh

# 4. 编辑环境变量
cp .env.production.example .env.production
nano .env.production  # 填写所有配置值

# 5. 启动服务
docker compose up -d --build

# 6. 查看状态
docker compose ps
docker compose logs -f app
```

### 14.2 从 Vercel 迁移步骤

1. 在 ECS 上完成部署并确认应用正常运行
2. 通过 ECS 公网 IP 直接访问测试（`http://ECS公网IP:3000`）
3. 确认无误后，在阿里云域名解析控制台修改 DNS：
   - 删除原来指向 Vercel 的 CNAME 记录
   - 添加 A 记录：`@` → ECS 公网 IP
   - 添加 A 记录：`www` → ECS 公网 IP
4. 等待 DNS 生效（通常 10 分钟内）
5. 访问 `https://opcs.vip` 验证迁移成功
6. 在 Vercel 控制台删除旧项目

### 14.3 日常运维命令

```bash
# 查看服务状态
docker compose ps

# 查看应用日志
docker compose logs -f app

# 重启应用
docker compose restart app

# 更新代码并重新部署
cd /opt/opcs && git pull && docker compose up -d --build

# 数据库迁移
docker compose exec app npx drizzle-kit generate && docker compose exec app npx drizzle-kit migrate

# 查看资源使用
docker stats
```

---

## 十五、未来扩展建议

随着业务增长，可按需升级：

| 阶段 | 建议 |
|-----|------|
| 用户量 < 1000 | 当前配置足够 |
| 用户量 1000-5000 | ECS 升级到 4核8G，RDS 升级到高可用版 |
| 用户量 > 5000 | 考虑负载均衡 SLB + 多台 ECS，RDS 读写分离 |
| 全球访问 | 开通阿里云全球加速 GA |

---

**文档版本**：v1.0 | **最后更新**：2026-04-09 | **维护者**：深象科技技术团队
