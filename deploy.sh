#!/bin/bash

# 颜色定义
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}NestJS 项目部署脚本${NC}"
echo -e "${GREEN}====================================${NC}"

# 配置变量
IMAGE_NAME="registry.cn-hangzhou.aliyuncs.com/your-namespace/nest-service"
IMAGE_TAG="latest"
SERVER_IP="47.93.63.238"
SERVER_USER="root"

# 检查环境变量文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}警告: .env 文件不存在，将从 .env.example 创建${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}已创建 .env 文件${NC}"
    else
        echo -e "${RED}错误: .env.example 文件也不存在${NC}"
        exit 1
    fi
fi

# 构建阶段
echo -e "${GREEN}\n[1/4] 开始构建项目...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败！${NC}"
    exit 1
fi
echo -e "${GREEN}构建成功！${NC}"

# 构建Docker镜像
echo -e "${GREEN}\n[2/4] 开始构建Docker镜像...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
if [ $? -ne 0 ]; then
    echo -e "${RED}Docker镜像构建失败！${NC}"
    exit 1
fi
echo -e "${GREEN}Docker镜像构建成功！${NC}"

# 推送Docker镜像
echo -e "${GREEN}\n[3/4] 开始推送Docker镜像到阿里云仓库...${NC}"
echo -e "${YELLOW}请确保已登录阿里云容器镜像服务: docker login registry.cn-hangzhou.aliyuncs.com${NC}"
docker push ${IMAGE_NAME}:${IMAGE_TAG}
if [ $? -ne 0 ]; then
    echo -e "${RED}Docker镜像推送失败！${NC}"
    exit 1
fi
echo -e "${GREEN}Docker镜像推送成功！${NC}"

# 部署到服务器
echo -e "${GREEN}\n[4/4] 开始部署到服务器 ${SERVER_IP}...${NC}"

# 创建部署目录和文件
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p /opt/nest-service"

# 复制配置文件
scp docker-compose.prod.yml ${SERVER_USER}@${SERVER_IP}:/opt/nest-service/
scp .env ${SERVER_USER}@${SERVER_IP}:/opt/nest-service/

# 在服务器上部署
ssh ${SERVER_USER}@${SERVER_IP} "cd /opt/nest-service && \
docker-compose -f docker-compose.prod.yml down && \
docker-compose -f docker-compose.prod.yml up -d"

if [ $? -ne 0 ]; then
    echo -e "${RED}部署失败！${NC}"
    exit 1
fi
echo -e "${GREEN}\n====================================${NC}"
echo -e "${GREEN}部署成功！应用已在 ${SERVER_IP}:3012 上运行${NC}"
echo -e "${GREEN}====================================${NC}"
echo -e "${YELLOW}提示: 使用以下命令查看应用日志:${NC}"
echo -e "${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/nest-service && docker-compose -f docker-compose.prod.yml logs -f'${NC}"