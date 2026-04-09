# 深象 OPCS - 阿里云部署指南（傻瓜式操作手册）

本文档是一份**可以直接复制粘贴完成**的操作手册。按照步骤从上到下执行即可完成从 Vercel 到阿里云的完整迁移。

---

## 目录

1. [购买阿里云 ECS 服务器](#一购买阿里云-ecs-服务器)
2. [登录服务器并安装环境](#二登录服务器并安装环境)
3. [部署应用](#三部署应用)
4. [配置数据库](#四配置数据库)
5. [开启 SSL 证书](#五开启-ssl-证书)
6. [切换域名解析（从 Vercel 迁移）](#六切换域名解析从-vercel-迁移)
7. [配置自动部署](#七配置自动部署github-推送后网站自动更新)
8. [配置阿里云其他服务](#八配置阿里云其他服务)
9. [日常运维命令速查](#九日常运维命令速查)
10. [委托第三方维护说明](#十委托第三方维护说明)

---

## 一、购买阿里云 ECS 服务器

### 操作步骤

1. 打开浏览器，访问 [阿里云 ECS 购买页](https://ecs-buy.aliyun.com/)

2. 按以下配置选择（直接对照勾选）：

| 配置项 | 选择 |
|-------|------|
| 付费模式 | **包年包月**（更便宜） |
| 地域 | **华东2（上海）** |
| 实例规格 | 搜索 `ecs.c7.large`，选择 **2核4G** |
| 镜像 | **Ubuntu 22.04 64位** |
| 系统盘 | **ESSD 云盘 40GB** |
| 数据盘 | 点击"增加一块数据盘" → **ESSD 云盘 100GB** |
| 公网带宽 | **按固定带宽** → **5Mbps** |
| 登录凭证 | **自定义密码** → 设置 root 密码（记住这个密码！） |
| 购买时长 | 建议 **1年**（有折扣） |

3. 点击 **确认订单** → **去支付**

4. 购买完成后，在 [ECS 控制台](https://ecs.console.aliyun.com/) 找到你的实例，记下 **公网 IP 地址**（后面要用）

### 配置安全组

5. 在 ECS 控制台，点击你的实例 → 左侧菜单 **安全组** → **配置规则** → **手动添加**

依次添加以下 3 条规则：

| 授权策略 | 端口范围 | 授权对象 | 说明 |
|---------|---------|---------|------|
| 允许 | 80/80 | 0.0.0.0/0 | HTTP |
| 允许 | 443/443 | 0.0.0.0/0 | HTTPS |
| 允许 | 9000/9000 | 0.0.0.0/0 | Webhook 自动部署 |

> SSH 22 端口默认已开放，无需重复添加。

---

## 二、登录服务器并安装环境

### 2.1 登录服务器

**Mac/Linux 用户**：打开终端，输入：

```bash
ssh root@你的ECS公网IP
```

输入你刚才设置的密码，回车。

**Windows 用户**：下载 [MobaXterm](https://mobaxterm.mobatek.net/download.html)，打开后点击 Session → SSH，填入 IP 和密码。

### 2.2 一键安装 Docker（复制粘贴以下全部命令）

```bash
# 更新系统
apt-get update -y && apt-get upgrade -y

# 安装基础工具
apt-get install -y curl wget git unzip htop ufw fail2ban

# 安装 Docker（阿里云镜像加速）
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 配置 Docker 镜像加速
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
    "registry-mirrors": ["https://mirror.ccs.tencentyun.com","https://docker.mirrors.ustc.edu.cn"],
    "log-driver": "json-file",
    "log-opts": {"max-size": "50m", "max-file": "3"}
}
EOF
systemctl daemon-reload && systemctl restart docker && systemctl enable docker

# 配置防火墙
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 9000/tcp && ufw --force enable

# 验证安装
docker --version && docker compose version
```

看到 Docker 版本号输出就表示安装成功。

### 2.3 安装 Node.js（Webhook 脚本需要）

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node --version
```

---

## 三、部署应用

### 3.1 克隆代码

```bash
git clone https://github.com/KWJIFF/opc-admin-system.git /opt/opcs
cd /opt/opcs
```

### 3.2 配置环境变量

```bash
cp .env.production.example .env.production
nano .env.production
```

在编辑器中，**必须修改**以下几项（其他的先保持默认，后续按需配置）：

| 变量名 | 填什么 | 怎么获取 |
|-------|-------|---------|
| `DATABASE_URL` | MySQL 连接地址 | 见下方"配置数据库"章节 |
| `JWT_SECRET` | 一串随机字符 | 在终端运行 `openssl rand -hex 32` 复制结果 |
| `APP_URL` | `https://opcs.vip` | 你的域名 |

> 编辑完成后按 `Ctrl+O` 保存，`Ctrl+X` 退出。

### 3.3 启动服务

```bash
cd /opt/opcs
docker compose up -d --build
```

等待 2-3 分钟构建完成。然后检查状态：

```bash
docker compose ps
```

看到所有服务状态为 `running` 就成功了。

### 3.4 测试访问

在浏览器中访问 `http://你的ECS公网IP:3000`，能看到页面就说明部署成功。

---

## 四、配置数据库

你有两个选择：

### 方案 A：使用阿里云 RDS MySQL（推荐，数据更安全）

1. 打开 [RDS 购买页](https://rdsbuy.console.aliyun.com/)

2. 按以下配置选择：

| 配置项 | 选择 |
|-------|------|
| 数据库类型 | **MySQL** |
| 版本 | **8.0** |
| 系列 | **基础版**（初期够用） |
| 规格 | **2核4G** |
| 存储 | **50GB ESSD** |
| 地域 | **华东2（上海）**（必须和 ECS 同地域！） |

3. 购买完成后，在 [RDS 控制台](https://rdsnext.console.aliyun.com/) 找到实例

4. 点击实例 → **账号管理** → **创建账号**：
   - 账号名：`opcs_admin`
   - 密码：设置一个强密码（记住！）
   - 账号类型：**高权限账号**

5. 点击 **数据库管理** → **创建数据库**：
   - 数据库名：`opcs_production`
   - 字符集：`utf8mb4`

6. 点击 **白名单与安全组** → **修改** → 添加 ECS 的**内网 IP**

7. 点击 **数据库连接** → 复制**内网地址**（类似 `rm-bp1xxxxx.mysql.rds.aliyuncs.com`）

8. 回到 ECS 服务器，编辑环境变量：

```bash
nano /opt/opcs/.env.production
```

修改 DATABASE_URL 为：

```
DATABASE_URL=mysql://opcs_admin:你设置的密码@rm-bp1xxxxx.mysql.rds.aliyuncs.com:3306/opcs_production
```

9. 重启应用：

```bash
cd /opt/opcs && docker compose restart app
```

### 方案 B：使用 Docker 内置 MySQL（省钱，适合测试）

在 `docker-compose.yml` 中添加 MySQL 服务，这里不展开，推荐直接用方案 A。

---

## 五、开启 SSL 证书

### 方案 A：阿里云免费 SSL 证书（推荐，最简单）

1. 打开 [数字证书管理服务](https://yundunnext.console.aliyun.com/?p=cas)

2. 点击 **免费证书** → **创建证书** → **申请证书**

3. 填写信息：
   - 域名：`opcs.vip`
   - 验证方式：**DNS 验证**（因为域名在阿里云，会自动验证）

4. 等待审核通过（通常几分钟）

5. 点击 **下载** → 选择 **Nginx** 格式 → 下载压缩包

6. 解压后得到两个文件，上传到 ECS：

```bash
# 在 ECS 上创建证书目录
mkdir -p /opt/opcs/deploy/certbot/conf/live/opcs.vip

# 在你的电脑上，用 scp 上传证书文件
# Mac/Linux 终端执行（替换为你的实际文件路径）：
scp ~/Downloads/opcs.vip.pem root@你的ECS公网IP:/opt/opcs/deploy/certbot/conf/live/opcs.vip/fullchain.pem
scp ~/Downloads/opcs.vip.key root@你的ECS公网IP:/opt/opcs/deploy/certbot/conf/live/opcs.vip/privkey.pem
```

7. 重启 Nginx：

```bash
cd /opt/opcs && docker compose restart nginx
```

### 方案 B：Let's Encrypt 自动证书

```bash
# 在 ECS 上执行
cd /opt/opcs
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email 你的邮箱@example.com \
  --agree-tos \
  --no-eff-email \
  -d opcs.vip \
  -d www.opcs.vip

# 重启 Nginx
docker compose restart nginx
```

---

## 六、切换域名解析（从 Vercel 迁移）

这是最关键的一步，操作非常简单：

### 6.1 确认新服务器已就绪

先在浏览器访问 `http://你的ECS公网IP:3000`，确认网站正常显示。

### 6.2 修改 DNS 解析

1. 打开 [阿里云域名解析控制台](https://dns.console.aliyun.com/)

2. 找到 `opcs.vip` → 点击 **解析设置**

3. **删除**原来指向 Vercel 的记录（通常是 CNAME 记录，值类似 `cname.vercel-dns.com`）

4. **添加**以下两条新记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|-------|-----|
| **A** | **@** | **你的ECS公网IP** | 10分钟 |
| **A** | **www** | **你的ECS公网IP** | 10分钟 |

5. 点击 **确认**

6. 等待 5-10 分钟，然后在浏览器访问 `https://opcs.vip`

> 如果访问不了，等 10 分钟再试。DNS 生效需要一点时间。

### 6.3 清理 Vercel

迁移成功后，可以到 [Vercel 控制台](https://vercel.com/dashboard) 删除旧项目。

---

## 七、配置自动部署（GitHub 推送后网站自动更新）

这一步配置好后，无论是您跟 AI 对话修改代码，还是委托其他人修改代码，只要推送到 GitHub，网站就会自动更新。

### 7.1 在 ECS 上启动 Webhook 服务

```bash
# 生成一个随机密钥（复制输出的结果，后面要用）
openssl rand -hex 20
```

记下这个密钥，然后：

```bash
# 编辑 Webhook 服务配置
nano /opt/opcs/deploy/scripts/opcs-webhook.service
```

将 `your-webhook-secret-change-me` 替换为刚才生成的密钥。按 `Ctrl+O` 保存，`Ctrl+X` 退出。

```bash
# 安装并启动 Webhook 服务
cp /opt/opcs/deploy/scripts/opcs-webhook.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable opcs-webhook
systemctl start opcs-webhook

# 验证运行状态
systemctl status opcs-webhook
```

看到 `active (running)` 就成功了。

### 7.2 在 GitHub 上配置 Webhook

1. 打开 [GitHub 仓库设置页](https://github.com/KWJIFF/opc-admin-system/settings/hooks)

2. 点击 **Add webhook**

3. 填写以下信息：

| 配置项 | 填写内容 |
|-------|---------|
| Payload URL | `http://你的ECS公网IP:9000/webhook` |
| Content type | `application/json` |
| Secret | 刚才生成的那个随机密钥 |
| Which events | 选择 `Just the push event` |
| Active | ✅ 勾选 |

4. 点击 **Add webhook**

### 7.3 测试自动部署

在 GitHub 上随便编辑一个文件（比如 README.md），提交后观察 ECS 上的日志：

```bash
journalctl -u opcs-webhook -f
```

看到 "部署成功" 就说明自动部署配置完成了。

### 7.4 工作流程说明

配置完成后，更新网站的流程变成：

| 场景 | 流程 |
|-----|------|
| **您跟 AI（我）对话修改** | 我修改代码 → 推送到 GitHub → ECS 自动拉取更新 → 网站自动更新 |
| **委托其他开发者修改** | 开发者修改代码 → 推送到 GitHub → ECS 自动拉取更新 → 网站自动更新 |
| **您自己在 GitHub 上修改** | 在 GitHub 网页上编辑 → 提交 → ECS 自动拉取更新 → 网站自动更新 |

---

## 八、配置阿里云其他服务

以下服务按需开通，不是必须的，可以后续逐步配置。

### 8.1 OSS 对象存储（存图片和文件）

1. 打开 [OSS 控制台](https://oss.console.aliyun.com/)
2. 点击 **创建 Bucket**
3. 配置：

| 配置项 | 选择 |
|-------|------|
| Bucket 名称 | `opcs-assets` |
| 地域 | **华东2（上海）** |
| 存储类型 | **标准存储** |
| 读写权限 | **公共读** |

4. 创建完成后，在 [RAM 控制台](https://ram.console.aliyun.com/users) 创建子用户获取 AccessKey
5. 将 AccessKey 填入 `.env.production` 的 OSS 相关变量

### 8.2 通义千问 API（AI 内容生成）

1. 打开 [百炼平台](https://bailian.console.aliyun.com/)
2. 开通服务 → 点击 **API Key 管理** → **创建 API Key**
3. 复制 API Key，填入 `.env.production`：

```
ALIYUN_DASHSCOPE_API_KEY=sk-你复制的API密钥
```

4. 重启应用：`cd /opt/opcs && docker compose restart app`

### 8.3 短信服务（登录验证码）

1. 打开 [短信服务控制台](https://dysms.console.aliyun.com/)
2. 点击 **国内消息** → **签名管理** → **添加签名**
   - 签名名称：`深象科技`
   - 适用场景：**验证码**
3. 点击 **模板管理** → **添加模板**
   - 模板名称：`登录验证码`
   - 模板内容：`您的验证码为${code}，5分钟内有效，请勿泄露。`
4. 审核通过后，将签名和模板 CODE 填入 `.env.production`

### 8.4 CDN 全站加速

1. 打开 [CDN 控制台](https://cdn.console.aliyun.com/)
2. 点击 **域名管理** → **添加域名**
3. 加速域名：`cdn.opcs.vip`
4. 源站：选择 **OSS 域名** → `opcs-assets.oss-cn-shanghai.aliyuncs.com`
5. 配置完成后，在域名解析中添加 CNAME 记录

### 8.5 邮件推送

1. 打开 [邮件推送控制台](https://dm.console.aliyun.com/)
2. 创建发信域名：`mail.opcs.vip`
3. 按提示在域名解析中添加 DNS 记录
4. 创建发信地址：`noreply@mail.opcs.vip`

### 8.6 SLS 日志服务

1. 打开 [日志服务控制台](https://sls.console.aliyun.com/)
2. 创建 Project：`opcs-logs`，地域选上海
3. 创建 Logstore：`app-logs`

### 8.7 WAF 防火墙

1. 打开 [WAF 控制台](https://yundun.console.aliyun.com/?p=waf)
2. 开通基础版
3. 将 `opcs.vip` 接入 WAF

---

## 九、日常运维命令速查

以下命令在 ECS 服务器上执行，直接复制粘贴即可：

```bash
# ===== 查看状态 =====
cd /opt/opcs && docker compose ps          # 查看所有服务状态
docker compose logs -f app                  # 实时查看应用日志
docker compose logs -f nginx                # 实时查看 Nginx 日志
docker stats                                # 查看资源使用情况

# ===== 重启服务 =====
cd /opt/opcs && docker compose restart app     # 重启应用
cd /opt/opcs && docker compose restart nginx   # 重启 Nginx
cd /opt/opcs && docker compose restart         # 重启所有服务

# ===== 手动更新部署 =====
cd /opt/opcs && git pull origin main && docker compose up -d --build

# ===== 查看磁盘空间 =====
df -h                                       # 查看磁盘使用
docker system df                            # 查看 Docker 占用空间
docker image prune -f                       # 清理无用镜像

# ===== 数据库操作 =====
cd /opt/opcs && docker compose exec app npx drizzle-kit generate   # 生成迁移
cd /opt/opcs && docker compose exec app npx drizzle-kit migrate    # 执行迁移

# ===== 查看 Webhook 日志 =====
journalctl -u opcs-webhook -f              # 实时查看自动部署日志
systemctl restart opcs-webhook              # 重启 Webhook 服务
```

---

## 十、委托第三方维护说明

如果您需要委托其他专业人士来维护这个网站，只需要做以下操作：

### 10.1 给开发者 GitHub 仓库权限

1. 打开 [仓库设置](https://github.com/KWJIFF/opc-admin-system/settings/access)
2. 点击 **Add people**
3. 输入开发者的 GitHub 用户名
4. 权限选择 **Write**（可以推送代码）

### 10.2 给开发者 ECS 服务器权限（可选）

如果需要开发者直接操作服务器：

```bash
# 在 ECS 上创建新用户
adduser developer
usermod -aG docker developer

# 或者直接给 SSH 密钥访问
mkdir -p /home/developer/.ssh
echo "开发者的SSH公钥" >> /home/developer/.ssh/authorized_keys
```

### 10.3 开发者工作流程

开发者只需要：

1. `git clone https://github.com/KWJIFF/opc-admin-system.git` 克隆代码
2. 在本地修改代码
3. `git push` 推送到 GitHub
4. 网站自动更新（Webhook 自动触发）

### 10.4 项目技术栈说明（给开发者看）

| 技术 | 版本 | 用途 |
|-----|------|------|
| React | 19 | 前端框架 |
| TypeScript | 5.9 | 类型安全 |
| Tailwind CSS | 4 | 样式系统 |
| tRPC | 11 | 前后端类型安全 API |
| Express | 4 | 后端服务器 |
| Drizzle ORM | 0.44 | 数据库 ORM |
| MySQL | 8.0 | 数据库 |
| Docker | 最新 | 容器化部署 |
| Nginx | 1.25 | 反向代理 |
| Framer Motion | 12 | 交互动画 |

---

## 阿里云服务费用总览

| 服务 | 规格 | 月费（预估） | 是否必须 |
|-----|------|------------|---------|
| ECS 云服务器 | 2核4G | 约 80-150 元 | ✅ 必须 |
| RDS MySQL | 2核4G 基础版 | 约 80 元 | ✅ 必须 |
| OSS 对象存储 | 标准存储 | 约 5 元 | 建议开通 |
| CDN | 100GB 流量包 | 约 20 元 | 建议开通 |
| SSL 证书 | 免费 DV | 免费 | ✅ 必须 |
| 通义千问 API | 按量 | 按用量 | AI 功能需要 |
| 短信服务 | 按量 | 约 5 元 | 登录验证码需要 |
| 邮件推送 | 免费额度 | 免费 | 可选 |
| SLS 日志 | 免费额度 | 免费 | 可选 |
| WAF 防火墙 | 基础版 | 约 30 元 | 可选 |

**初期最低费用**：ECS + RDS + SSL ≈ **160-230 元/月**

---

**文档版本**：v2.0 | **最后更新**：2026-04-09 | **域名**：opcs.vip
