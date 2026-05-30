# HTTP Request Receiver

一个 HTTP 请求接收与调试工具。通过 Web 管理页面创建多个 HTTP 接口，实时查看各接口收到的请求日志。

## 功能

- 创建/编辑/删除/启用禁用 HTTP 接口，自定义响应状态码、响应头和响应体
- 实时请求日志推送（WebSocket），支持按接口过滤、展开查看详情
- 日志按接口按日期持久化为 JSON Lines 文件
- JSON 响应体使用 CodeMirror 编辑器，支持语法高亮和格式化
- 密码保护管理界面（JWT 认证）

## 快速开始

```bash
# 安装依赖
npm run install:all

# 开发模式（前后端并行启动）
npm run dev

# 生产模式
npm run build
npm start
```

默认地址 `http://localhost:3456`，默认密码 `admin123`。

## 配置

根目录 `.env` 文件：

```
PORT=3456
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-password
```

## 部署到服务器

以下以 Ubuntu/Debian 为例，假设服务器 IP 为 `123.45.67.89`。

### 1. 克隆项目

```bash
git clone https://github.com/CNorato/node-http.git
cd node-http
```

### 2. 安装依赖

```bash
npm run install:all
```

### 3. 配置环境变量

复制 `.env` 文件并修改为强密码：

```bash
# 生成安全的 JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

编辑 `.env`：

```
PORT=3456
JWT_SECRET=<上一步生成的随机字符串>
ADMIN_PASSWORD=<你的强密码>
```

### 4. 构建前端

```bash
npm run build
```

构建产物输出到 `client/dist/`。生产模式下 Express 会自动托管该目录下的静态文件，因此**不需要单独启动前端服务**——后端进程同时提供 API 和前端页面。

### 5. 使用 PM2 守护进程

```bash
# 全局安装 PM2
npm install -g pm2

# 启动应用
pm2 start server/index.js --name http-receiver

# 开机自启
pm2 startup
pm2 save
```

常用 PM2 命令：

```bash
pm2 status           # 查看运行状态
pm2 logs http-receiver   # 查看日志
pm2 restart http-receiver  # 重启
pm2 stop http-receiver     # 停止
```

### 6. 配置防火墙

如果服务器启用了防火墙，需要开放端口：

```bash
# ufw 防火墙
sudo ufw allow 3456/tcp
```

**安全建议**：避免直接在公网暴露服务端口，推荐使用 Nginx 反向代理（见下一步）。

### 7. 配置 Nginx 反向代理（推荐）

```bash
sudo apt install nginx
```

创建配置文件 `/etc/nginx/sites-available/http-receiver`：

```nginx
server {
    listen 80;
    server_name your-domain.com;   # 替换为你的域名或删掉此行

    location / {
        proxy_pass http://127.0.0.1:3456;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 支持
    location /ws {
        proxy_pass http://127.0.0.1:3456;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/http-receiver /etc/nginx/sites-enabled/
sudo nginx -t          # 测试配置
sudo systemctl reload nginx
```

此时可以通过 80 端口访问，WebSocket 也会经过 Nginx 代理正常工作。防火墙改为只开放 80/443：

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw delete allow 3456/tcp   # 移除之前的 3456 端口开放
```

### 8. 配置 HTTPS（强烈建议）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Let's Encrypt 证书 90 天有效，certbot 会自动续期。

### 9. 更新部署

后续更新代码时：

```bash
cd node-http
git pull
npm run install:all
npm run build
pm2 restart http-receiver
```

### 完整部署脚本

将以上步骤整合为一个脚本（保存为 `deploy.sh`）：

```bash
#!/bin/bash
set -e

echo ">>> 安装依赖..."
npm run install:all

echo ">>> 构建前端..."
npm run build

echo ">>> 生成 JWT_SECRET..."
if ! grep -q "node-http-secret-change-me" .env 2>/dev/null; then
  echo "JWT_SECRET 已配置，跳过"
else
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  sed -i "s/node-http-secret-change-me-in-production/$SECRET/" .env
  echo "JWT_SECRET 已自动生成"
fi

echo ">>> 启动/重启服务..."
if pm2 list | grep -q http-receiver; then
  pm2 restart http-receiver
else
  pm2 start server/index.js --name http-receiver
  pm2 save
fi

echo ">>> 部署完成！"
```

使用：

```bash
chmod +x deploy.sh
./deploy.sh
```

## 技术栈

- **后端**: Node.js 24 + Express 5 + WebSocket (ws)
- **前端**: Vue 3 (Composition API) + Vite 6 + CodeMirror 6
- **认证**: JWT (jsonwebtoken)
- **持久化**: JSON 文件（配置）+ JSON Lines（日志）
- **进程管理**: PM2
- **反向代理**: Nginx（可选）
