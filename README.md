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

## 技术栈

- **后端**: Node.js 24 + Express 5 + WebSocket (ws)
- **前端**: Vue 3 (Composition API) + Vite 6 + CodeMirror 6
- **认证**: JWT (jsonwebtoken)
- **持久化**: JSON 文件（配置）+ JSON Lines（日志）
