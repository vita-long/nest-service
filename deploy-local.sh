#!/bin/bash

# 颜色定义
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}NestJS 项目本地部署脚本（无需阿里云镜像仓库）${NC}"
echo -e "${GREEN}====================================${NC}"

# 配置变量
SERVER_IP="47.93.63.238"
SERVER_USER="root"
LOCAL_IMAGE_NAME="nest-service:local"

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
echo -e "${GREEN}\n[1/2] 开始构建项目...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败！${NC}"
    exit 1
fi
echo -e "${GREEN}构建成功！${NC}"

# 构建Docker镜像
echo -e "${GREEN}\n[2/2] 开始构建Docker镜像并部署到服务器...${NC}"

# 构建本地镜像
docker build -t ${LOCAL_IMAGE_NAME} .
if [ $? -ne 0 ]; then
    echo -e "${RED}Docker镜像构建失败！${NC}"
    exit 1
fi

# 创建临时目录
TEMP_DIR=$(mktemp -d)

# 保存镜像到临时文件
echo -e "${GREEN}保存镜像到临时文件...${NC}"
docker save ${LOCAL_IMAGE_NAME} | gzip > ${TEMP_DIR}/nest-service.tar.gz
if [ $? -ne 0 ]; then
    echo -e "${RED}镜像保存失败！${NC}"
    rm -rf ${TEMP_DIR}
    exit 1
fi

# 创建服务器上的部署目录
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p /www/wwwroot/nest-service"

# 复制文件到服务器
echo -e "${GREEN}上传镜像和配置文件到服务器...${NC}"
scp ${TEMP_DIR}/nest-service.tar.gz ${SERVER_USER}@${SERVER_IP}:/www/wwwroot/nest-service/
scp docker-compose.prod.yml ${SERVER_USER}@${SERVER_IP}:/www/wwwroot/nest-service/
scp .env ${SERVER_USER}@${SERVER_IP}:/www/wwwroot/nest-service/

# 清理临时文件
rm -rf ${TEMP_DIR}

# 在服务器上加载镜像并启动
echo -e "${GREEN}在服务器上部署应用...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cd /www/wwwroot/nest-service && \
  docker load -i nest-service.tar.gz && \
  # 修改docker-compose文件使用本地镜像
  sed -i 's|build: .|image: nest-service:local|g' docker-compose.prod.yml && \
  # 修改.env文件中的数据库和Redis连接配置
  sed -i 's|DB_HOST=localhost|DB_HOST=mysql|g' .env && \
  sed -i 's|REDIS_HOST=localhost|REDIS_HOST=redis|g' .env && \
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
echo -e "${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /www/wwwroot/nest-service && docker-compose -f docker-compose.prod.yml logs -f'${NC}"

echo -e "${YELLOW}\n注意: 此脚本使用本地Docker镜像直接部署，无需阿里云容器镜像服务${NC}"