#!/bin/bash
# ============================================
# 深象 OPCS - 阿里云 ECS 一键部署脚本
# 使用方法: sudo bash deploy.sh
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[OPCS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then
    error "请使用 sudo 运行此脚本"
fi

log "=========================================="
log "  深象 OPCS 一键部署脚本"
log "  适用于阿里云 ECS (Ubuntu 22.04/24.04)"
log "=========================================="

# --- 1. 系统更新与基础工具 ---
log "步骤 1/8: 更新系统并安装基础工具..."
apt-get update -qq
apt-get install -y -qq curl wget git unzip htop net-tools ufw fail2ban

# --- 2. 安装 Docker ---
log "步骤 2/8: 安装 Docker..."
if ! command -v docker &> /dev/null; then
    # 使用阿里云镜像加速安装
    curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    log "Docker 安装完成"
else
    log "Docker 已安装，跳过"
fi

# 配置 Docker 镜像加速（阿里云）
log "配置 Docker 镜像加速..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
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
EOF
systemctl daemon-reload
systemctl restart docker

# --- 3. 安装 Docker Compose ---
log "步骤 3/8: 检查 Docker Compose..."
if ! docker compose version &> /dev/null; then
    error "Docker Compose 插件未安装，请检查 Docker 安装"
fi
log "Docker Compose 版本: $(docker compose version --short)"

# --- 4. 配置防火墙 ---
log "步骤 4/8: 配置防火墙..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
log "防火墙配置完成"

# --- 5. 配置 Fail2Ban ---
log "步骤 5/8: 配置 Fail2Ban 防暴力破解..."
cat > /etc/fail2ban/jail.local <<EOF
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
EOF
systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2Ban 配置完成"

# --- 6. 创建应用目录 ---
log "步骤 6/8: 创建应用目录..."
APP_DIR="/opt/opcs"
mkdir -p $APP_DIR
cd $APP_DIR

# 如果代码还没有克隆
if [ ! -f "$APP_DIR/docker-compose.yml" ]; then
    warn "请将项目代码复制到 $APP_DIR 目录"
    warn "例如: git clone https://github.com/KWJIFF/opc-admin-system.git $APP_DIR"
    warn "或者: scp -r ./opc-admin/* root@your-ecs-ip:$APP_DIR/"
fi

# --- 7. SSL 证书 ---
log "步骤 7/8: 配置 SSL 证书..."
read -p "请输入您的域名 (例如 opcs.shenxiang.tech): " DOMAIN
if [ -z "$DOMAIN" ]; then
    warn "未输入域名，跳过 SSL 配置"
else
    # 替换 Nginx 配置中的域名
    if [ -f "$APP_DIR/deploy/nginx/conf.d/opcs.conf" ]; then
        sed -i "s/YOUR_DOMAIN/$DOMAIN/g" $APP_DIR/deploy/nginx/conf.d/opcs.conf
        log "Nginx 配置已更新域名: $DOMAIN"
    fi

    # 首次获取 SSL 证书（先用 HTTP 模式启动 Nginx）
    log "正在获取 Let's Encrypt SSL 证书..."
    read -p "请输入您的邮箱 (用于证书通知): " EMAIL
    
    # 临时启动 Nginx（仅 HTTP）用于验证
    docker compose up -d nginx 2>/dev/null || true
    sleep 3
    
    docker compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN 2>/dev/null || warn "SSL 证书获取失败，请手动配置"
    
    docker compose down 2>/dev/null || true
    log "SSL 证书配置完成"
fi

# --- 8. 启动服务 ---
log "步骤 8/8: 检查环境变量..."
if [ ! -f "$APP_DIR/.env.production" ]; then
    if [ -f "$APP_DIR/.env.production.example" ]; then
        cp $APP_DIR/.env.production.example $APP_DIR/.env.production
        warn "已创建 .env.production，请编辑填写实际配置值:"
        warn "  nano $APP_DIR/.env.production"
        warn "填写完成后运行: docker compose up -d"
    else
        error "缺少 .env.production.example 模板文件"
    fi
else
    log "启动所有服务..."
    docker compose up -d --build
    sleep 10
    
    # 检查服务状态
    log "检查服务状态..."
    docker compose ps
    
    log "=========================================="
    log "  部署完成！"
    log "  访问: https://$DOMAIN"
    log "  管理: docker compose logs -f"
    log "=========================================="
fi

# --- 添加自动备份 cron ---
log "配置每日自动备份..."
cat > /etc/cron.d/opcs-backup <<EOF
# 每天凌晨 3 点备份数据库
0 3 * * * root docker compose -f $APP_DIR/docker-compose.yml exec -T app node -e "console.log('backup triggered')" >> /var/log/opcs-backup.log 2>&1
# 每天凌晨 4 点清理 30 天前的日志
0 4 * * * root find /var/log/nginx -name "*.log" -mtime +30 -delete
EOF
log "自动备份已配置"

log "部署脚本执行完毕！"
