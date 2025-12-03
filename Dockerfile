# 构建阶段
FROM node:22.14.0-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建项目
RUN pnpm run build

# 运行阶段
FROM node:22.14.0-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 只安装生产依赖
RUN pnpm install --prod

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制uploads目录（确保存在）
RUN mkdir -p uploads
COPY ./uploads ./uploads

# 复制环境变量文件示例
COPY .env.example .env

# 暴露端口
EXPOSE 3012

# 启动命令
CMD ["pnpm", "start:prod"]