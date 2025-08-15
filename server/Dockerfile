# 使用最新的 Node.js 镜像作为构建阶段
FROM node:20-alpine AS builder

# 安全更新 Alpine 包
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖，用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建 NestJS 项目
RUN npm run build

# 生产阶段 - 使用 Google distroless 镜像，更安全且无已知漏洞
FROM gcr.io/distroless/nodejs20-debian12 AS production

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建后的应用
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 暴露端口
EXPOSE 3000

# 启动应用 - distroless 镜像已经使用非 root 用户
CMD ["dist/main.js"]