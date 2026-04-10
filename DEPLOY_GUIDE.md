# 深象 OPCS — 阿里云完整部署配置手册

> **适用对象**：零基础小白，所有命令均可直接复制粘贴执行。
> **文档版本**：v3.0 | **更新日期**：2026-04-10
> **项目仓库**：`https://github.com/KWJIFF/opc-admin-system`

---

## 目录

| 章节 | 内容 | 预计耗时 |
|------|------|----------|
| 第一章 | 购买阿里云 ECS 服务器 | 15 分钟 |
| 第二章 | 首次登录服务器并安装 Docker 环境 | 20 分钟 |
| 第三章 | 购买并配置阿里云 RDS MySQL 数据库 | 20 分钟 |
| 第四章 | 拉取代码并部署应用 | 15 分钟 |
| 第五章 | 购买域名并完成 ICP 备案 | 7-20 天（等待审核） |
| 第六章 | 配置域名解析与 SSL 证书 | 15 分钟 |
| 第七章 | 接入通义千问大模型 | 10 分钟 |
| 第八章 | 配置 OSS 对象存储 | 15 分钟 |
| 第九章 | 配置短信服务与邮件推送 | 20 分钟 |
| 第十章 | 配置 GitHub 自动部署 | 15 分钟 |
| 第十一章 | 日常运维命令速查表 | 随时查阅 |
| 第十二章 | 常见问题与故障排查 | 随时查阅 |
| 附录 A | 环境变量完整对照表 | 随时查阅 |
| 附录 B | 阿里云服务费用总览 | 随时查阅 |

---

## 第一章 购买阿里云 ECS 服务器

ECS（Elastic Compute Service）是阿里云的云服务器产品，相当于在阿里云机房里租了一台电脑，您的网站就运行在这台电脑上。

### 1.1 注册阿里云账号

如果您还没有阿里云账号，请先完成注册和实名认证。

**第 1 步**：打开浏览器，访问 [阿里云官网](https://www.aliyun.com/)，点击右上角「免费注册」。

**第 2 步**：使用手机号注册，设置登录密码。注册完成后系统会提示您进行实名认证。

**第 3 步**：选择「个人实名认证」或「企业实名认证」（建议使用企业认证，后续备案更方便）。按提示上传身份证或营业执照照片，通常几分钟到一个工作日内审核通过。

### 1.2 购买 ECS 实例

**第 1 步**：打开 [ECS 购买页面](https://ecs-buy.aliyun.com/)，登录您的阿里云账号。

**第 2 步**：按照下表逐项选择配置。每一项都有对应的下拉菜单或选项按钮，直接对照勾选即可：

| 配置项 | 推荐选择 | 说明 |
|--------|----------|------|
| 付费模式 | **包年包月** | 比按量付费便宜很多 |
| 地域 | **华东2（上海）** | 国内访问速度快，后续备案方便 |
| 可用区 | 默认即可 | 系统自动分配 |
| 实例规格 | 搜索 `ecs.c7.large`，选 **2核4G** | 足够运行本项目，后续可升级 |
| 镜像 | **Ubuntu 22.04 64位** | 部署脚本基于 Ubuntu 编写 |
| 系统盘 | **ESSD 云盘 40GB** | 存放操作系统和 Docker |
| 数据盘 | 点击「增加一块数据盘」→ **ESSD 云盘 100GB** | 存放应用数据和日志 |
| 公网带宽 | **按固定带宽** → **5Mbps** | 小型网站足够，后续可调整 |
| 登录凭证 | **自定义密码** | 设置 root 密码，**务必记住** |
| 购买时长 | **1年** | 有折扣，新用户可能低至 199 元/年 |

**第 3 步**：点击「确认订单」→「去支付」→ 完成付款。

**第 4 步**：支付完成后，打开 [ECS 控制台](https://ecs.console.aliyun.com/)。在实例列表中找到您刚购买的服务器，记下 **公网 IP 地址**（格式类似 `47.100.xxx.xxx`）。请把这个 IP 地址记在手边，后面每一步都会用到。

### 1.3 配置安全组（开放端口）

安全组相当于服务器的防火墙，默认只开放了 SSH（22端口），您需要额外开放 HTTP 和 HTTPS 端口，网站才能被访问。

**第 1 步**：在 ECS 控制台，点击您的实例名称进入详情页。

**第 2 步**：点击左侧菜单「安全组」→ 点击安全组 ID 进入 → 点击「手动添加」。

**第 3 步**：依次添加以下 3 条规则（每条规则添加完后点「保存」，再点「手动添加」继续下一条）：

| 授权策略 | 协议类型 | 端口范围 | 授权对象 | 描述 |
|----------|----------|----------|----------|------|
| 允许 | 自定义 TCP | 80/80 | 0.0.0.0/0 | HTTP 网站访问 |
| 允许 | 自定义 TCP | 443/443 | 0.0.0.0/0 | HTTPS 加密访问 |
| 允许 | 自定义 TCP | 9000/9000 | 0.0.0.0/0 | GitHub 自动部署 |

> SSH 的 22 端口默认已开放，无需重复添加。

---

## 第二章 首次登录服务器并安装 Docker 环境

### 2.1 登录服务器

您需要通过 SSH 远程连接到刚购买的 ECS 服务器。根据您的电脑操作系统选择对应的方式：

**Mac / Linux 用户**：打开「终端」应用，输入以下命令（将 `你的ECS公网IP` 替换为第一章记下的 IP 地址）：

```bash
ssh root@你的ECS公网IP
```

首次连接会提示 `Are you sure you want to continue connecting (yes/no)?`，输入 `yes` 回车。然后输入您在购买时设置的 root 密码（输入密码时屏幕不会显示任何字符，这是正常的），回车即可登录。

**Windows 用户**：下载并安装 [MobaXterm](https://mobaxterm.mobatek.net/download-home-edition.html)（选择 Free 版本的 Installer edition）。安装完成后打开，点击左上角「Session」→「SSH」，在 Remote host 填入您的 ECS 公网 IP，Username 填 `root`，点击 OK，然后输入密码即可登录。

登录成功后，您会看到类似这样的提示符：

```
root@iZxxxxxxxxZ:~#
```

这说明您已经成功登录到了阿里云服务器。接下来的所有命令都在这个界面中执行。

### 2.2 一键安装 Docker 环境

以下是一段完整的安装命令，请**全部复制**，粘贴到终端中，按回车执行。整个过程大约需要 3-5 分钟，期间屏幕会滚动大量文字，这是正常的，耐心等待即可。

```bash
# ============================================
# 深象 OPCS - 一键安装 Docker 环境
# 直接全部复制粘贴执行即可
# ============================================

# 第 1 步：更新系统
echo ">>> 正在更新系统..."
apt-get update -y && apt-get upgrade -y

# 第 2 步：安装基础工具
echo ">>> 正在安装基础工具..."
apt-get install -y curl wget git unzip htop net-tools ufw fail2ban

# 第 3 步：安装 Docker（使用阿里云镜像加速）
echo ">>> 正在安装 Docker..."
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 第 4 步：配置 Docker 镜像加速
echo ">>> 正在配置 Docker 镜像加速..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'DOCKEREOF'
{
    "registry-mirrors": [
        "https://mirror.ccs.tencentyun.com",
        "https://docker.mirrors.ustc.edu.cn"
    ],
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "50m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
DOCKEREOF
systemctl daemon-reload
systemctl restart docker
systemctl enable docker

# 第 5 步：配置防火墙
echo ">>> 正在配置防火墙..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 9000/tcp
ufw --force enable

# 第 6 步：配置 Fail2Ban（防暴力破解）
echo ">>> 正在配置安全防护..."
cat > /etc/fail2ban/jail.local <<'F2BEOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
F2BEOF
systemctl enable fail2ban
systemctl restart fail2ban

echo ""
echo "============================================"
echo "  环境安装完成！"
echo "  Docker 版本: $(docker --version)"
echo "  Docker Compose 版本: $(docker compose version)"
echo "============================================"
```

### 2.3 验证安装结果

安装完成后，运行以下命令确认一切正常：

```bash
docker --version
docker compose version
```

如果看到类似以下输出，说明安装成功：

```
Docker version 27.x.x, build xxxxxxx
Docker Compose version v2.x.x
```

> **如果报错怎么办？** 重新运行一次安装命令即可。如果仍然失败，可能是网络问题，等几分钟再试。

---

## 第三章 购买并配置阿里云 RDS MySQL 数据库

RDS（Relational Database Service）是阿里云的托管数据库服务。虽然也可以在 ECS 上自己安装 MySQL，但使用 RDS 更省心——阿里云会帮您自动备份、监控和维护。

### 3.1 购买 RDS MySQL 实例

**第 1 步**：打开 [RDS 购买页面](https://rdsbuy.console.aliyun.com/)。

**第 2 步**：按照下表选择配置：

| 配置项 | 推荐选择 | 说明 |
|--------|----------|------|
| 数据库引擎 | **MySQL** | 本项目使用 MySQL |
| 引擎版本 | **8.0** | 最新稳定版 |
| 系列 | **基础版**（单节点） | 个人/小团队够用，便宜 |
| 存储类型 | **ESSD 云盘** | 性能好 |
| 地域 | **华东2（上海）** | 必须和 ECS 同一地域 |
| 可用区 | 和 ECS 相同的可用区 | 内网互通，速度最快 |
| 规格 | **mysql.n2e.small.1**（1核2G） | 初期足够，后续可升级 |
| 存储空间 | **20GB** | 初期足够，支持自动扩容 |
| 付费模式 | **包年包月** | 更便宜 |
| 购买时长 | **1年** | 有折扣 |

**第 3 步**：点击「立即购买」→ 完成支付。

### 3.2 配置 RDS 白名单（允许 ECS 连接）

购买完成后，需要告诉 RDS「允许哪些 IP 地址连接」，否则您的 ECS 服务器无法访问数据库。

**第 1 步**：打开 [RDS 控制台](https://rdsnext.console.aliyun.com/)，点击您刚创建的实例 ID 进入详情页。

**第 2 步**：点击左侧菜单「数据安全性」→「白名单设置」→ 点击「default」分组右侧的「修改」。

**第 3 步**：在输入框中填入您的 **ECS 内网 IP 地址**。

> **如何查看 ECS 内网 IP？** 回到 [ECS 控制台](https://ecs.console.aliyun.com/)，在实例列表中找到「私有 IP」那一列，格式类似 `172.16.xxx.xxx`。

**第 4 步**：点击「确定」保存。

### 3.3 创建数据库和账号

**第 1 步**：在 RDS 控制台实例详情页，点击左侧菜单「账号管理」→「创建账号」。

| 配置项 | 填写内容 |
|--------|----------|
| 数据库账号 | `opcs_admin` |
| 账号类型 | **高权限账号** |
| 密码 | 设置一个强密码（至少 8 位，包含大小写字母和数字），**务必记住** |

**第 2 步**：点击左侧菜单「数据库管理」→「创建数据库」。

| 配置项 | 填写内容 |
|--------|----------|
| 数据库名称 | `opcs_production` |
| 支持字符集 | **utf8mb4** |
| 授权账号 | 选择 `opcs_admin` |

**第 3 步**：记下 RDS 的**内网连接地址**。在实例详情页的「基本信息」区域可以找到，格式类似：

```
rm-bp1xxxxxxxxxx.mysql.rds.aliyuncs.com
```

### 3.4 拼接数据库连接字符串

现在您已经有了连接数据库所需的全部信息。请按以下格式拼接连接字符串，后面配置环境变量时会用到：

```
mysql://opcs_admin:你设置的密码@rm-bp1xxxxxxxxxx.mysql.rds.aliyuncs.com:3306/opcs_production
```

将上面的三处信息替换为您的实际值：

| 占位符 | 替换为 |
|--------|--------|
| `你设置的密码` | 第 3.3 步设置的数据库密码 |
| `rm-bp1xxxxxxxxxx.mysql.rds.aliyuncs.com` | 第 3.3 步记下的 RDS 内网连接地址 |
| `opcs_production` | 第 3.3 步创建的数据库名称 |

---

## 第四章 拉取代码并部署应用

### 4.1 克隆项目代码

回到 ECS 服务器的终端（如果断开了，重新 SSH 登录），执行以下命令：

```bash
# 创建应用目录并克隆代码
mkdir -p /opt/opcs
cd /opt/opcs
git clone https://github.com/KWJIFF/opc-admin-system.git .
```

> 注意末尾有一个英文句点 `.`，表示克隆到当前目录。

如果提示输入 GitHub 用户名和密码，因为仓库是私有的，您需要使用 GitHub Personal Access Token。获取方式：打开 [GitHub Token 设置页](https://github.com/settings/tokens) → Generate new token (classic) → 勾选 `repo` 权限 → 生成后复制 Token。在提示输入密码时，粘贴这个 Token 即可。

### 4.2 配置环境变量

这是最关键的一步。环境变量文件告诉应用如何连接数据库、使用哪些阿里云服务。

```bash
# 复制环境变量模板
cp .env.production.example .env.production

# 用编辑器打开（nano 是最简单的命令行编辑器）
nano .env.production
```

打开后您会看到一个配置文件，需要修改以下几项（其他暂时不改，后续章节会逐步配置）。使用键盘上下箭头移动光标，直接修改对应的值：

**必须立即修改的配置：**

```ini
# 改为您的实际域名（如果还没有域名，先填 ECS 公网 IP）
APP_URL=https://你的域名或IP

# 改为第三章拼接的数据库连接字符串
DATABASE_URL=mysql://opcs_admin:你的密码@rm-xxxxx.mysql.rds.aliyuncs.com:3306/opcs_production

# 生成一个随机密钥（不要用示例值）
JWT_SECRET=这里填一个至少32位的随机字符串
```

> **如何生成随机字符串？** 先按 `Ctrl+X` 退出编辑器，运行以下命令生成，然后复制结果填入：
> ```bash
> openssl rand -hex 32
> ```

**修改完成后**：按 `Ctrl+X`，然后按 `Y` 确认保存，再按 `Enter` 确认文件名。

### 4.3 首次启动应用

```bash
cd /opt/opcs

# 构建并启动所有服务（首次构建需要 3-5 分钟）
docker compose up -d --build
```

屏幕会显示构建过程，看到类似以下输出说明启动成功：

```
[+] Running 4/4
 ✔ Network opcs-network  Created
 ✔ Container opcs-redis   Started
 ✔ Container opcs-app     Started
 ✔ Container opcs-nginx   Started
```

### 4.4 验证部署结果

```bash
# 查看所有服务状态
docker compose ps
```

正常情况下应该看到 3 个服务都是 `running` 状态：

```
NAME          STATUS          PORTS
opcs-app      Up (healthy)    0.0.0.0:3000->3000/tcp
opcs-redis    Up (healthy)    127.0.0.1:6379->6379/tcp
opcs-nginx    Up              0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

现在打开浏览器，访问 `http://你的ECS公网IP`，应该能看到网站页面了。

> **如果看到 502 Bad Gateway 或者无法访问**：运行 `docker compose logs app` 查看应用日志，通常是数据库连接字符串填写有误。

### 4.5 初始化数据库表

首次部署需要创建数据库表结构：

```bash
cd /opt/opcs
docker compose exec app npx drizzle-kit generate
docker compose exec app npx drizzle-kit migrate
```

看到 `Migration completed` 说明数据库初始化成功。

---

## 第五章 购买域名并完成 ICP 备案

在中国大陆运营网站，域名必须完成 ICP 备案后才能正常使用。备案本身不收费，但需要等待管局审核，通常 7-20 个工作日。

### 5.1 购买域名

**第 1 步**：打开 [阿里云域名注册页](https://wanwang.aliyun.com/)。

**第 2 步**：在搜索框中输入您想要的域名（例如 `opcs.vip` 或 `shenxiang.com`），点击查询。

**第 3 步**：选择一个可注册的域名，加入清单，完成购买。

**第 4 步**：购买后需要进行域名实名认证。在 [域名控制台](https://dc.console.aliyun.com/) 中找到您的域名，按提示上传身份证或营业执照完成认证。

> 域名实名认证通常 1-3 个工作日完成。实名认证通过后才能进行 ICP 备案。

### 5.2 ICP 备案

**第 1 步**：打开 [阿里云备案系统](https://beian.aliyun.com/)，点击「开始备案」。

**第 2 步**：按提示填写以下信息：

| 信息类型 | 填写内容 |
|----------|----------|
| 主体类型 | 个人 或 企业（根据实际情况选择） |
| 主办单位名称 | 您的姓名 或 公司名称 |
| 证件号码 | 身份证号 或 统一社会信用代码 |
| 域名 | 您购买的域名 |
| 网站名称 | 深象科技 或 您的网站名称 |
| 网站用途 | 企业官网 / 个人博客 |

**第 3 步**：上传证件照片（身份证正反面 或 营业执照）。

**第 4 步**：阿里云会在 1 个工作日内完成初审。初审通过后，阿里云会将您的备案信息提交到当地通信管理局。

**第 5 步**：管局会发送一条短信到您的手机，收到后 24 小时内需要完成短信核验（点击短信中的链接，输入验证码）。

**第 6 步**：等待管局审核，通常 7-20 个工作日。审核通过后，您会收到备案号（格式如 `沪ICP备xxxxxxxx号`）。

> **备案期间网站能访问吗？** 备案期间可以通过 IP 地址访问网站进行调试，但不能通过域名访问。备案通过后再配置域名解析。

---

## 第六章 配置域名解析与 SSL 证书

备案通过后，您需要将域名指向 ECS 服务器的 IP 地址，并配置 SSL 证书实现 HTTPS 加密访问。

### 6.1 配置域名解析

**第 1 步**：打开 [云解析 DNS 控制台](https://dns.console.aliyun.com/)。

**第 2 步**：找到您的域名，点击「解析设置」→「添加记录」。

**第 3 步**：添加以下两条记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|----------|----------|--------|-----|
| A | `@` | 你的ECS公网IP | 10分钟 |
| A | `www` | 你的ECS公网IP | 10分钟 |

> `@` 表示直接用域名访问（如 `opcs.vip`），`www` 表示带 www 前缀访问（如 `www.opcs.vip`）。

**第 4 步**：等待 5-10 分钟让 DNS 生效。可以在终端中用以下命令验证：

```bash
ping 你的域名
```

如果返回的 IP 地址是您的 ECS 公网 IP，说明解析已生效。

### 6.2 修改 Nginx 配置中的域名

回到 ECS 服务器终端，将 Nginx 配置中的示例域名替换为您的实际域名：

```bash
cd /opt/opcs

# 将配置文件中的 opcs.vip 替换为您的实际域名
# 请将下面命令中的 你的域名 替换为实际值，例如 shenxiang.tech
sed -i 's/opcs.vip/你的域名/g' deploy/nginx/conf.d/opcs.conf
```

### 6.3 获取 SSL 证书（Let's Encrypt 免费证书）

项目已经内置了 Certbot 自动证书工具。执行以下命令即可自动获取免费 SSL 证书：

```bash
cd /opt/opcs

# 第 1 步：先创建证书存放目录
mkdir -p deploy/certbot/conf deploy/certbot/www

# 第 2 步：临时启动 Nginx（仅 HTTP 模式，用于证书验证）
# 先注释掉 HTTPS 配置，只保留 HTTP
docker compose up -d nginx
sleep 5

# 第 3 步：申请证书（将下面两处 你的域名 和 你的邮箱 替换为实际值）
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email 你的邮箱@example.com \
    --agree-tos \
    --no-eff-email \
    -d 你的域名 \
    -d www.你的域名

# 第 4 步：重启所有服务（启用 HTTPS）
docker compose down
docker compose up -d --build
```

看到 `Congratulations! Your certificate and chain have been saved` 说明证书获取成功。

> **证书会自动续期吗？** 会的。docker-compose.yml 中已经配置了 certbot 容器，每 12 小时自动检查并续期证书。Let's Encrypt 证书有效期 90 天，自动续期会在到期前 30 天执行。

### 6.4 更新环境变量中的域名

```bash
cd /opt/opcs
nano .env.production
```

将 `APP_URL` 改为您的实际域名：

```ini
APP_URL=https://你的域名
CORS_ORIGIN=https://你的域名
```

保存后重启应用：

```bash
docker compose restart app
```

现在打开浏览器访问 `https://你的域名`，应该能看到带绿色锁标志的安全连接了。

---

## 第七章 接入通义千问大模型

通义千问是阿里云的大语言模型，接入后可以实现 AI 自动选题、自动写作、自动生图等功能。通义千问支持 OpenAI 兼容接口，接入非常简单。

### 7.1 开通百炼平台并获取 API Key

**第 1 步**：打开 [阿里云百炼平台](https://bailian.console.aliyun.com/)，使用您的阿里云账号登录。

**第 2 步**：首次访问会弹出服务协议，阅读并同意即可开通。如果没有弹出，说明已经开通过了。

**第 3 步**：点击页面右上角的头像图标 → 选择「API-KEY」（或在左侧菜单找到「API-KEY 管理」）。

**第 4 步**：点击「创建 API Key」→ 选择归属业务空间（默认即可）→ 点击「确定」。

**第 5 步**：复制生成的 API Key（格式类似 `sk-xxxxxxxxxxxxxxxxxxxxxxxx`）。这个 Key 只会显示一次，请立即保存。

### 7.2 配置环境变量

回到 ECS 服务器终端：

```bash
cd /opt/opcs
nano .env.production
```

找到以下几行，填入您的 API Key：

```ini
ALIYUN_DASHSCOPE_API_KEY=sk-你复制的API密钥
ALIYUN_DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIYUN_DASHSCOPE_MODEL=qwen-max
ALIYUN_DASHSCOPE_VISION_MODEL=qwen-vl-max
ALIYUN_DASHSCOPE_LONG_MODEL=qwen-long
```

保存并重启应用：

```bash
docker compose restart app
```

### 7.3 模型选择指南

通义千问提供多个模型，各有特点。您可以根据需求在环境变量中切换：

| 模型名称 | 适用场景 | 输入价格（每百万 Token） | 输出价格（每百万 Token） | 推荐指数 |
|----------|----------|--------------------------|--------------------------|----------|
| `qwen-max` | 复杂写作、深度分析 | 约 11.7 元 | 约 47 元 | 质量最高 |
| `qwen-plus` | 日常内容生成、选题 | 约 0.8 元 | 约 2 元 | 性价比之王 |
| `qwen-turbo` | 简单任务、分类标签 | 约 0.3 元 | 约 0.6 元 | 最便宜 |
| `qwen-vl-max` | 图片理解、图文分析 | 约 3 元 | 约 9 元 | 多模态任务 |
| `qwen-long` | 超长文档处理 | 约 0.5 元 | 约 2 元 | 长文本 |

> **费用说明**：百炼平台新用户通常有免费额度（约 100 万 Token），用完后按量计费，从阿里云账户余额扣费。1 百万 Token 大约相当于 75 万个汉字的输入或 50 万个汉字的输出。

### 7.4 验证接入是否成功

在 ECS 服务器上运行以下命令快速测试：

```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-你的API密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-plus",
    "messages": [
      {"role": "user", "content": "你好，请用一句话介绍自己"}
    ]
  }'
```

如果返回了 AI 的回复内容（JSON 格式），说明接入成功。如果报错 `InvalidApiKey`，请检查 API Key 是否复制正确。

---

## 第八章 配置 OSS 对象存储

OSS（Object Storage Service）用于存储网站中的图片、文件、素材等。相比直接存在服务器上，OSS 更可靠、更便宜、支持 CDN 加速。

### 8.1 创建 OSS Bucket

**第 1 步**：打开 [OSS 控制台](https://oss.console.aliyun.com/)。

**第 2 步**：点击「创建 Bucket」，按以下配置填写：

| 配置项 | 推荐选择 |
|--------|----------|
| Bucket 名称 | `opcs-assets`（可自定义，全局唯一） |
| 地域 | **华东2（上海）** |
| 存储类型 | **标准存储** |
| 读写权限 | **公共读**（图片需要被用户访问） |
| 其他选项 | 保持默认 |

**第 3 步**：点击「确定」创建。

### 8.2 创建 RAM 子用户获取 AccessKey

为了安全，不建议使用主账号的 AccessKey。我们创建一个专用的子用户：

**第 1 步**：打开 [RAM 控制台](https://ram.console.aliyun.com/users)。

**第 2 步**：点击「创建用户」。

| 配置项 | 填写内容 |
|--------|----------|
| 登录名称 | `opcs-oss` |
| 显示名称 | `OPCS OSS 专用` |
| 访问方式 | 勾选「OpenAPI 调用访问」 |

**第 3 步**：创建完成后，页面会显示 **AccessKey ID** 和 **AccessKey Secret**。**请立即复制保存**，这是唯一一次显示 Secret 的机会。

**第 4 步**：给这个子用户授权。点击用户名进入详情 → 「权限管理」→「新增授权」→ 搜索并添加 `AliyunOSSFullAccess`。

### 8.3 配置环境变量

```bash
cd /opt/opcs
nano .env.production
```

填入 OSS 相关配置：

```ini
ALIYUN_OSS_ACCESS_KEY_ID=你的AccessKey ID
ALIYUN_OSS_ACCESS_KEY_SECRET=你的AccessKey Secret
ALIYUN_OSS_BUCKET=opcs-assets
ALIYUN_OSS_REGION=oss-cn-shanghai
ALIYUN_OSS_ENDPOINT=https://oss-cn-shanghai.aliyuncs.com
```

保存并重启：

```bash
docker compose restart app
```

### 8.4 配置 CDN 加速（可选但推荐）

CDN 可以让全国用户更快地加载图片和文件。

**第 1 步**：打开 [CDN 控制台](https://cdn.console.aliyun.com/)。

**第 2 步**：点击「域名管理」→「添加域名」。

| 配置项 | 填写内容 |
|--------|----------|
| 加速域名 | `cdn.你的域名`（例如 `cdn.opcs.vip`） |
| 业务类型 | **图片小文件** |
| 源站信息 | 源站类型选「OSS 域名」→ 选择 `opcs-assets.oss-cn-shanghai.aliyuncs.com` |

**第 3 步**：添加完成后，系统会给您一个 CNAME 值。回到 [DNS 控制台](https://dns.console.aliyun.com/)，为您的域名添加一条 CNAME 记录：

| 记录类型 | 主机记录 | 记录值 |
|----------|----------|--------|
| CNAME | `cdn` | 阿里云给的 CNAME 值 |

**第 4 步**：更新环境变量：

```bash
nano /opt/opcs/.env.production
```

```ini
ALIYUN_OSS_CDN_DOMAIN=https://cdn.你的域名
ALIYUN_CDN_DOMAIN=cdn.你的域名
```

保存并重启：`docker compose restart app`

---

## 第九章 配置短信服务与邮件推送

### 9.1 开通短信服务（用于登录验证码）

**第 1 步**：打开 [短信服务控制台](https://dysms.console.aliyun.com/)，点击「开通短信服务」。

**第 2 步**：添加短信签名。点击「国内消息」→「签名管理」→「添加签名」。

| 配置项 | 填写内容 |
|--------|----------|
| 签名名称 | 您的公司名或产品名（例如 `深象科技`） |
| 适用场景 | **验证码** |
| 签名来源 | 根据实际情况选择（企业选「企事业单位名称」） |

> 签名审核通常 2 小时内完成。

**第 3 步**：添加短信模板。点击「模板管理」→「添加模板」。

| 配置项 | 填写内容 |
|--------|----------|
| 模板名称 | `登录验证码` |
| 模板类型 | **验证码** |
| 模板内容 | `您的验证码为${code}，5分钟内有效，请勿泄露给他人。` |

审核通过后，记下**模板 CODE**（格式如 `SMS_xxxxxxxx`）。

**第 4 步**：创建短信专用的 RAM 子用户（步骤同第八章 8.2），授权 `AliyunDysmsFullAccess`。

**第 5 步**：配置环境变量：

```bash
nano /opt/opcs/.env.production
```

```ini
ALIYUN_SMS_ACCESS_KEY_ID=短信子用户的AccessKey ID
ALIYUN_SMS_ACCESS_KEY_SECRET=短信子用户的AccessKey Secret
ALIYUN_SMS_SIGN_NAME=深象科技
ALIYUN_SMS_TEMPLATE_CODE=SMS_xxxxxxxx
```

### 9.2 开通邮件推送（用于订阅通知）

**第 1 步**：打开 [邮件推送控制台](https://dm.console.aliyun.com/)。

**第 2 步**：点击「发信域名」→「新建域名」→ 输入 `mail.你的域名`。

**第 3 步**：系统会给出几条 DNS 记录，需要在 [DNS 控制台](https://dns.console.aliyun.com/) 中添加。按照页面提示逐条添加即可（通常是 TXT 和 MX 记录）。

**第 4 步**：DNS 记录添加完成后，回到邮件推送控制台点击「验证」。

**第 5 步**：创建发信地址。点击「发信地址」→「新建发信地址」→ 输入 `noreply`（完整地址为 `noreply@mail.你的域名`）。

**第 6 步**：配置环境变量：

```bash
nano /opt/opcs/.env.production
```

```ini
ALIYUN_EMAIL_ACCESS_KEY_ID=邮件子用户的AccessKey ID
ALIYUN_EMAIL_ACCESS_KEY_SECRET=邮件子用户的AccessKey Secret
ALIYUN_EMAIL_ACCOUNT=noreply@mail.你的域名
ALIYUN_EMAIL_FROM_ALIAS=深象科技
```

保存后重启：`docker compose restart app`

---

## 第十章 配置 GitHub 自动部署

配置完成后，每次您（或开发者）往 GitHub 推送代码，网站就会自动更新，无需手动操作。

### 10.1 方案一：Webhook 自动部署（推荐）

项目中已经内置了 Webhook 服务，只需要启动并在 GitHub 上配置即可。

**第 1 步**：生成 Webhook 密钥：

```bash
# 生成一个随机密钥并记下来
openssl rand -hex 20
```

**第 2 步**：配置并启动 Webhook 服务：

```bash
cd /opt/opcs

# 编辑 Webhook 服务配置，将密钥填入
sed -i "s/your-webhook-secret-change-me/你生成的随机密钥/g" deploy/scripts/opcs-webhook.service

# 安装并启动服务
cp deploy/scripts/opcs-webhook.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable opcs-webhook
systemctl start opcs-webhook

# 验证运行状态
systemctl status opcs-webhook
```

看到 `active (running)` 就说明 Webhook 服务已启动。

**第 3 步**：在 GitHub 上配置 Webhook。打开浏览器访问 [仓库 Webhook 设置页](https://github.com/KWJIFF/opc-admin-system/settings/hooks)，点击「Add webhook」，填写以下信息：

| 配置项 | 填写内容 |
|--------|----------|
| Payload URL | `http://你的ECS公网IP:9000/webhook` |
| Content type | `application/json` |
| Secret | 第 1 步生成的随机密钥 |
| Which events | 选择 `Just the push event` |
| Active | 勾选 |

点击「Add webhook」保存。

**第 4 步**：测试。在 GitHub 上随便编辑一个文件（比如 README.md），提交后在 ECS 上查看日志：

```bash
journalctl -u opcs-webhook -f
```

看到「部署成功」就说明自动部署配置完成了。

### 10.2 方案二：GitHub Actions 自动部署

如果您更喜欢用 GitHub Actions，项目中也提供了配置文件。

**第 1 步**：在 ECS 上生成 SSH 密钥对：

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f /root/.ssh/github_deploy -N ""
cat /root/.ssh/github_deploy.pub >> /root/.ssh/authorized_keys
cat /root/.ssh/github_deploy
```

最后一条命令会输出私钥内容，全部复制。

**第 2 步**：在 GitHub 仓库中配置 Secrets。打开 [仓库 Settings → Secrets](https://github.com/KWJIFF/opc-admin-system/settings/secrets/actions)，点击「New repository secret」，依次添加：

| Secret 名称 | 值 |
|-------------|-----|
| `ECS_HOST` | 你的 ECS 公网 IP |
| `ECS_USERNAME` | `root` |
| `ECS_SSH_KEY` | 第 1 步复制的私钥内容 |

**第 3 步**：在仓库中创建 Actions 工作流。打开仓库页面 → 点击「Actions」→「set up a workflow yourself」→ 将 `deploy/github-actions-deploy.yml` 的内容粘贴进去 → 点击「Commit」。

之后每次推送代码到 main 分支，GitHub Actions 就会自动部署到 ECS。

### 10.3 自动部署工作流程总结

配置完成后，更新网站的流程变得非常简单：

| 场景 | 操作流程 |
|------|----------|
| 您跟 AI 对话修改代码 | AI 修改代码 → 推送到 GitHub → ECS 自动更新 |
| 委托开发者修改 | 开发者修改代码 → 推送到 GitHub → ECS 自动更新 |
| 您自己在 GitHub 上修改 | 在 GitHub 网页编辑 → 提交 → ECS 自动更新 |

---

## 第十一章 日常运维命令速查表

以下所有命令都在 ECS 服务器上执行。先 SSH 登录服务器，然后直接复制粘贴。

### 11.1 查看状态

```bash
# 查看所有服务运行状态
cd /opt/opcs && docker compose ps

# 实时查看应用日志（按 Ctrl+C 退出）
docker compose logs -f app

# 实时查看 Nginx 日志
docker compose logs -f nginx

# 查看服务器资源使用情况（CPU、内存）
docker stats

# 查看磁盘使用情况
df -h
```

### 11.2 重启服务

```bash
# 重启应用（修改环境变量后需要执行）
cd /opt/opcs && docker compose restart app

# 重启 Nginx（修改 Nginx 配置后需要执行）
cd /opt/opcs && docker compose restart nginx

# 重启所有服务
cd /opt/opcs && docker compose restart

# 完全停止再启动（遇到严重问题时使用）
cd /opt/opcs && docker compose down && docker compose up -d
```

### 11.3 手动更新部署

```bash
# 拉取最新代码并重新部署
cd /opt/opcs && git pull origin main && docker compose up -d --build
```

### 11.4 数据库操作

```bash
# 生成数据库迁移文件（修改 schema 后执行）
cd /opt/opcs && docker compose exec app npx drizzle-kit generate

# 执行数据库迁移
cd /opt/opcs && docker compose exec app npx drizzle-kit migrate
```

### 11.5 清理磁盘空间

```bash
# 查看 Docker 占用空间
docker system df

# 清理无用的 Docker 镜像（释放空间）
docker image prune -f

# 深度清理（清理所有未使用的镜像、容器、网络）
docker system prune -f
```

### 11.6 SSL 证书相关

```bash
# 手动续期证书
cd /opt/opcs && docker compose run --rm certbot renew

# 查看证书到期时间
docker compose run --rm certbot certificates
```

### 11.7 查看 Webhook 自动部署日志

```bash
# 实时查看自动部署日志
journalctl -u opcs-webhook -f

# 重启 Webhook 服务
systemctl restart opcs-webhook
```

---

## 第十二章 常见问题与故障排查

### 12.1 网站无法访问（连接超时）

**排查步骤**：

```bash
# 1. 检查服务是否在运行
cd /opt/opcs && docker compose ps

# 2. 如果服务没有运行，启动它
docker compose up -d

# 3. 检查防火墙是否开放了 80 和 443 端口
ufw status

# 4. 检查阿里云安全组是否配置正确
# 回到阿里云 ECS 控制台 → 安全组 → 确认 80/443 端口已开放
```

### 12.2 网站显示 502 Bad Gateway

这通常表示 Nginx 正常但应用服务出了问题。

```bash
# 查看应用日志找到错误原因
cd /opt/opcs && docker compose logs --tail=50 app

# 常见原因：数据库连接失败
# 解决：检查 .env.production 中的 DATABASE_URL 是否正确
# 解决：检查 RDS 白名单是否包含了 ECS 的内网 IP
```

### 12.3 数据库连接失败

```bash
# 在 ECS 上测试能否连接 RDS
apt-get install -y mysql-client
mysql -h rm-xxxxx.mysql.rds.aliyuncs.com -u opcs_admin -p

# 如果连接失败，检查：
# 1. RDS 白名单是否包含 ECS 内网 IP
# 2. RDS 和 ECS 是否在同一地域和 VPC
# 3. 密码是否正确
```

### 12.4 Docker 构建失败

```bash
# 清理缓存后重新构建
cd /opt/opcs && docker compose down
docker system prune -f
docker compose up -d --build
```

### 12.5 磁盘空间不足

```bash
# 查看哪里占用了空间
du -sh /opt/opcs/*
docker system df

# 清理 Docker 无用数据
docker system prune -af

# 清理旧日志
find /var/log -name "*.log" -mtime +30 -delete
```

### 12.6 SSL 证书过期

```bash
# 手动续期
cd /opt/opcs && docker compose run --rm certbot renew

# 续期后重启 Nginx
docker compose restart nginx
```

### 12.7 忘记了服务器密码

在阿里云 ECS 控制台，找到您的实例 → 点击「更多」→「密码/密钥」→「重置实例密码」。重置后需要重启实例才能生效。

---

## 附录 A 环境变量完整对照表

以下是 `.env.production` 文件中所有环境变量的说明和获取方式：

| 变量名 | 说明 | 获取方式 | 是否必填 |
|--------|------|----------|----------|
| `NODE_ENV` | 运行环境 | 固定填 `production` | 必填 |
| `PORT` | 应用端口 | 固定填 `3000` | 必填 |
| `APP_URL` | 网站地址 | 您的域名，如 `https://opcs.vip` | 必填 |
| `DATABASE_URL` | 数据库连接串 | 第三章拼接的连接字符串 | 必填 |
| `REDIS_URL` | Redis 地址 | 已在 docker-compose.yml 中自动配置为 `redis://redis:6379`，无需在 .env.production 中修改 | 自动 |
| `JWT_SECRET` | 会话密钥 | 用 `openssl rand -hex 32` 生成 | 必填 |
| `ALIYUN_DASHSCOPE_API_KEY` | 通义千问密钥 | 百炼平台 → API Key 管理 | AI 功能需要 |
| `ALIYUN_DASHSCOPE_BASE_URL` | 通义千问接口地址 | 固定填 `https://dashscope.aliyuncs.com/compatible-mode/v1` | AI 功能需要 |
| `ALIYUN_DASHSCOPE_MODEL` | 默认模型 | 推荐 `qwen-max` 或 `qwen-plus` | AI 功能需要 |
| `ALIYUN_OSS_ACCESS_KEY_ID` | OSS 密钥 ID | RAM 控制台创建子用户获取 | 文件存储需要 |
| `ALIYUN_OSS_ACCESS_KEY_SECRET` | OSS 密钥 | 同上 | 文件存储需要 |
| `ALIYUN_OSS_BUCKET` | OSS 存储桶名 | OSS 控制台创建时设置的名称 | 文件存储需要 |
| `ALIYUN_OSS_REGION` | OSS 地域 | 固定填 `oss-cn-shanghai` | 文件存储需要 |
| `ALIYUN_OSS_ENDPOINT` | OSS 接口地址 | 固定填 `https://oss-cn-shanghai.aliyuncs.com` | 文件存储需要 |
| `ALIYUN_OSS_CDN_DOMAIN` | CDN 加速域名 | CDN 控制台配置后获取 | 可选 |
| `ALIYUN_SMS_ACCESS_KEY_ID` | 短信密钥 ID | RAM 控制台创建子用户获取 | 短信验证码需要 |
| `ALIYUN_SMS_ACCESS_KEY_SECRET` | 短信密钥 | 同上 | 短信验证码需要 |
| `ALIYUN_SMS_SIGN_NAME` | 短信签名 | 短信控制台申请审核通过的签名 | 短信验证码需要 |
| `ALIYUN_SMS_TEMPLATE_CODE` | 短信模板 | 短信控制台申请审核通过的模板 CODE | 短信验证码需要 |
| `ALIYUN_EMAIL_ACCESS_KEY_ID` | 邮件密钥 ID | RAM 控制台创建子用户获取 | 邮件通知需要 |
| `ALIYUN_EMAIL_ACCESS_KEY_SECRET` | 邮件密钥 | 同上 | 邮件通知需要 |
| `ALIYUN_EMAIL_ACCOUNT` | 发信地址 | 邮件推送控制台创建 | 邮件通知需要 |
| `ALIYUN_EMAIL_FROM_ALIAS` | 发信人昵称 | 自定义，如 `深象科技` | 邮件通知需要 |
| `ALIYUN_SLS_ACCESS_KEY_ID` | 日志密钥 ID | RAM 控制台创建子用户获取 | 可选 |
| `ALIYUN_SLS_ACCESS_KEY_SECRET` | 日志密钥 | 同上 | 可选 |
| `ALIYUN_SLS_ENDPOINT` | 日志接口 | 固定填 `cn-shanghai.log.aliyuncs.com` | 可选 |
| `ALIYUN_SLS_PROJECT` | 日志项目名 | SLS 控制台创建 | 可选 |
| `ALIYUN_SLS_LOGSTORE` | 日志库名 | SLS 控制台创建 | 可选 |
| `CORS_ORIGIN` | 跨域白名单 | 填您的域名，如 `https://opcs.vip` | 必填 |
| `RATE_LIMIT_WINDOW_MS` | 限流窗口 | 固定填 `60000`（60秒） | 必填 |
| `RATE_LIMIT_MAX_REQUESTS` | 限流次数 | 固定填 `100` | 必填 |

---

## 附录 B 阿里云服务费用总览

| 服务 | 推荐规格 | 月费（预估） | 是否必须 | 备注 |
|------|----------|-------------|----------|------|
| ECS 云服务器 | 2核4G | 约 80-150 元 | 必须 | 新用户可能低至 199 元/年 |
| RDS MySQL | 1核2G 基础版 | 约 50-80 元 | 必须 | 新用户有优惠 |
| OSS 对象存储 | 标准存储 | 约 5 元 | 建议开通 | 按实际存储量计费 |
| CDN 加速 | 100GB 流量包 | 约 20 元 | 建议开通 | 按流量计费 |
| SSL 证书 | Let's Encrypt | 免费 | 必须 | 自动续期 |
| 域名 | .com / .vip | 约 5-10 元/月 | 必须 | 按年付费 |
| 通义千问 API | 按量计费 | 按用量 | AI 功能需要 | 新用户有免费额度 |
| 短信服务 | 按量计费 | 约 5 元 | 验证码需要 | 每条约 0.045 元 |
| 邮件推送 | 免费额度 | 免费 | 可选 | 每日 200 封免费 |
| SLS 日志 | 免费额度 | 免费 | 可选 | 500MB/月免费 |

**初期最低月费**：ECS + RDS + 域名 + SSL ≈ **140-250 元/月**

**完整配置月费**：全部服务 ≈ **200-350 元/月**

> 以上价格基于 2026 年 4 月阿里云官网公示价格，实际费用以阿里云账单为准。新用户通常有较大折扣。

---

## 附录 C 部署后的推荐操作顺序

如果您是第一次部署，建议按以下顺序逐步完成配置。不需要一次全部搞定，可以分几天慢慢来：

| 优先级 | 操作 | 对应章节 | 预计耗时 |
|--------|------|----------|----------|
| 第 1 天 | 购买 ECS + 安装 Docker + 购买 RDS | 第一至三章 | 1 小时 |
| 第 1 天 | 拉取代码 + 部署应用 + 验证能通过 IP 访问 | 第四章 | 30 分钟 |
| 第 1 天 | 购买域名 + 提交 ICP 备案 | 第五章 | 30 分钟 |
| 等备案通过 | 配置域名解析 + SSL 证书 | 第六章 | 15 分钟 |
| 随时 | 接入通义千问 | 第七章 | 10 分钟 |
| 随时 | 配置 OSS 存储 | 第八章 | 15 分钟 |
| 随时 | 配置短信和邮件 | 第九章 | 20 分钟 |
| 随时 | 配置自动部署 | 第十章 | 15 分钟 |

---

> **文档版本**：v3.0 | **最后更新**：2026-04-10 | **作者**：深象 OPCS 技术团队
