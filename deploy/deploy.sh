#!/bin/bash
set -e

# ============================================
# AgentSolveHub 一键部署脚本
# 适用于 Ubuntu 20.04+ / CentOS 7+
# ============================================

# 配置变量
PROJECT_NAME="agentSolveHub"
GIT_REPO="https://github.com/onlysyz/agentSolveHub.git"
INSTALL_DIR="/opt/${PROJECT_NAME}"
DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-admin@example.com}"
DB_PASSWORD="${DB_PASSWORD:-}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then
    log_error "请使用 root 权限运行此脚本"
    exit 1
fi

# 欢迎信息
echo "=========================================="
echo "  AgentSolveHub 一键部署脚本"
echo "=========================================="
echo ""

# 交互式配置
if [ -z "$DOMAIN" ]; then
    read -p "请输入域名（例如: agent.example.com，留空则用IP访问）: " DOMAIN
fi

if [ -z "$DB_PASSWORD" ]; then
    read -p "请输入数据库密码: " DB_PASSWORD
fi

# 检测系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi
    log_info "检测到操作系统: $OS"
}

# 安装 Docker
install_docker() {
    log_info "安装 Docker..."

    if command -v docker &> /dev/null; then
        log_warn "Docker 已安装，跳过"
        return
    fi

    curl -fsSL https://get.docker.com | sh

    # 启动 Docker
    systemctl start docker
    systemctl enable docker

    # 安装 Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    log_info "Docker 安装完成"
}

# 安装 Nginx
install_nginx() {
    log_info "安装 Nginx..."

    if command -v nginx &> /dev/null; then
        log_warn "Nginx 已安装，跳过"
        return
    fi

    if [ "$OS" == "ubuntu" ] || [ "$OS" == "debian" ]; then
        apt update && apt install -y nginx
    elif [ "$OS" == "centos" ] || [ "$OS" == "rocky" ]; then
        yum install -y nginx
    fi

    log_info "Nginx 安装完成"
}

# 克隆项目
clone_project() {
    log_info "克隆项目..."

    mkdir -p $INSTALL_DIR
    cd $INSTALL_DIR

    if [ -d .git ]; then
        git pull
    else
        git clone $GIT_REPO .
    fi

    log_info "项目克隆完成"
}

# 配置环境变量
setup_env() {
    log_info "配置环境变量..."

    cd $INSTALL_DIR/server

    cat > .env << EOF
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@localhost:5432/agent_solve_hub?schema=public"
JWT_SECRET="$(openssl rand -base64 32)"
PORT=3001
EOF

    log_info "环境变量配置完成"
}

# 启动 Docker 容器
start_containers() {
    log_info "启动 Docker 容器..."

    cd $INSTALL_DIR

    # 创建 Docker 网络
    docker network create ${PROJECT_NAME}_net 2>/dev/null || true

    # 启动 PostgreSQL
    docker run -d \
        --name ${PROJECT_NAME}_postgres \
        --network ${PROJECT_NAME}_net \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=${DB_PASSWORD} \
        -e POSTGRES_DB=agent_solve_hub \
        -p 127.0.0.1:5432:5432 \
        -v ${PROJECT_NAME}_postgres_data:/var/lib/postgresql/data \
        --restart unless-stopped \
        postgres:16

    # 等待 PostgreSQL 启动
    log_info "等待数据库启动..."
    sleep 10

    # 检查数据库是否启动
    for i in {1..30}; do
        if docker exec ${PROJECT_NAME}_postgres pg_isready &> /dev/null; then
            log_info "数据库已就绪"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "数据库启动失败"
            exit 1
        fi
        sleep 1
    done

    log_info "Docker 容器启动完成"
}

# 初始化数据库
init_db() {
    log_info "初始化数据库..."

    cd $INSTALL_DIR/server

    # 安装依赖
    npm install

    # 生成 Prisma Client
    npx prisma generate

    # 创建数据库表
    DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@localhost:5432/agent_solve_hub?schema=public" npx prisma db push

    # 填充种子数据（可选）
    # DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@localhost:5432/agent_solve_hub?schema=public" npx tsx prisma/seed.ts

    log_info "数据库初始化完成"
}

# 构建前端
build_frontend() {
    log_info "构建前端..."

    cd $INSTALL_DIR

    # 安装依赖
    npm install

    # 构建
    npm run build

    log_info "前端构建完成"
}

# 配置 Nginx
config_nginx() {
    log_info "配置 Nginx..."

    # 获取公网 IP
    SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "YOUR_SERVER_IP")

    if [ -n "$DOMAIN" ]; then
        SERVER_NAME="$DOMAIN"
    else
        SERVER_NAME="$SERVER_IP"
    fi

    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/${PROJECT_NAME} << EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    # 前端静态文件
    root ${INSTALL_DIR}/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 前端路由
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 启用配置
    ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # 测试 Nginx 配置
    nginx -t

    # 重载 Nginx
    systemctl reload nginx

    log_info "Nginx 配置完成"
}

# 安装 SSL 证书（可选）
install_ssl() {
    if [ -z "$DOMAIN" ]; then
        log_warn "未配置域名，跳过 SSL 证书安装"
        return
    fi

    log_info "安装 SSL 证书..."

    # 安装 Certbot
    if [ "$OS" == "ubuntu" ] || [ "$OS" == "debian" ]; then
        apt update && apt install -y certbot python3-certbot-nginx
    elif [ "$OS" == "centos" ] || [ "$OS" == "rocky" ]; then
        yum install -y certbot python3-certbot-nginx
    fi

    # 获取证书
    certbot --nginx -d "$DOMAIN" --noninteractive --agree-tos -m "$EMAIL"

    # 自动续期
    systemctl enable certbot.timer
    systemctl start certbot.timer

    log_info "SSL 证书安装完成"
}

# 启动后端
start_backend() {
    log_info "构建后端..."

    cd $INSTALL_DIR/server
    npm install
    npm run build

    log_info "后端构建完成"
}

# 配置 PM2
setup_pm2() {
    log_info "配置 PM2..."

    # 安装 PM2
    npm install -g pm2

    # 启动后端
    cd $INSTALL_DIR/server
    pm2 delete ${PROJECT_NAME}_api 2>/dev/null || true
    pm2 start dist/index.js --name ${PROJECT_NAME}_api

    # 保存 PM2 进程列表
    pm2 save

    # 设置开机自启
    pm2 startup

    log_info "PM2 配置完成"
}

# 防火墙配置
config_firewall() {
    log_info "配置防火墙..."

    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
    fi

    log_info "防火墙配置完成"
}

# 打印完成信息
print_summary() {
    SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "YOUR_SERVER_IP")

    echo ""
    echo "=========================================="
    echo "  部署完成！"
    echo "=========================================="
    echo ""
    echo "访问地址: http://${DOMAIN:-$SERVER_IP}"
    echo ""
    echo "数据库信息:"
    echo "  地址: localhost:5432"
    echo "  用户: postgres"
    echo "  密码: $DB_PASSWORD"
    echo "  数据库: agent_solve_hub"
    echo ""
    echo "后端 API: http://${DOMAIN:-$SERVER_IP}/api"
    echo ""
    echo "常用命令:"
    echo "  查看后端日志: pm2 logs ${PROJECT_NAME}_api"
    echo "  重启后端: pm2 restart ${PROJECT_NAME}_api"
    echo "  查看数据库: docker exec -it ${PROJECT_NAME}_postgres psql -U postgres"
    echo ""
}

# 主函数
main() {
    detect_os
    install_docker
    install_nginx
    clone_project
    setup_env
    start_containers
    init_db
    build_frontend
    config_nginx
    start_backend
    setup_pm2
    config_firewall

    # SSL 证书安装（需要域名）
    if [ -n "$DOMAIN" ]; then
        install_ssl
    fi

    print_summary
}

main "$@"
