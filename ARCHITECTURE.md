# NestJS服务项目架构文档

## 1. 项目概述

本项目是一个基于NestJS框架构建的后端服务，提供用户认证、文件上传、健康检查等核心功能。采用模块化架构设计，支持MySQL数据库和Redis缓存，实现了完整的JWT认证机制。

## 2. 技术栈

| 类别 | 技术/框架 | 版本 | 用途 |
|------|-----------|------|------|
| 运行环境 | Node.js | - | 服务运行环境 |
| 后端框架 | NestJS | ^11.0.1 | 应用主体框架 |
| 数据库 | MySQL | ^3.15.3 | 数据持久化存储 |
| ORM | TypeORM | ^0.3.27 | 数据库对象关系映射 |
| 缓存 | Redis | ^5.10.0 | 缓存和会话管理 |
| 认证 | JWT | ^11.0.1 | 用户身份验证 |
| 文件上传 | Multer | ^2.0.2 | 文件处理 |
| 密码加密 | bcrypt | ^6.0.0 | 密码安全存储 |
| 日志 | winston | ^3.18.3 | 日志记录 |
| 配置管理 | @nestjs/config | ^4.0.2 | 环境配置管理 |

## 3. 项目结构

```
src/
├── app.module.ts         # 应用主模块
├── main.ts               # 应用入口文件
├── config/               # 配置文件目录
│   ├── index.ts
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
├── entities/             # 数据库实体
│   ├── user.entity.ts
│   └── resources.entity.ts
├── modules/              # 业务模块
│   ├── auth/             # 认证模块
│   ├── user/             # 用户模块
│   ├── upload/           # 文件上传模块
│   └── health/           # 健康检查模块
└── common/               # 公共组件
    ├── decorators/       # 装饰器
    ├── guards/           # 守卫
    ├── filters/          # 过滤器
    ├── interceptors/     # 拦截器
    ├── modules/          # 公共模块
    │   ├── cache/        # 缓存模块
    │   └── logger/       # 日志模块
    └── utils/            # 工具函数
```

## 4. 核心模块设计

### 4.1 应用模块 (AppModule)

应用主模块，负责全局配置和模块组织，集成所有业务模块和公共模块。

**主要职责：**
- 全局配置加载（应用配置、数据库配置、Redis配置）
- 数据库连接配置
- 全局异常过滤器注册
- 全局响应拦截器注册
- 业务模块集成

**核心依赖：**
- ConfigModule：配置管理
- TypeOrmModule：数据库连接
- 各业务模块（AuthModule、UserModule、UploadModule、HealthModule）
- 公共模块（LoggerModule、RedisCacheModule）

### 4.2 认证模块 (AuthModule)

用户认证和授权相关功能模块。

**主要职责：**
- 用户登录与注册
- JWT令牌生成与验证
- 令牌刷新
- 用户登出
- 登录状态检查

**核心组件：**
- AuthController：处理认证相关请求
- AuthService：实现认证业务逻辑
- JwtAuthGuard：JWT认证守卫

**配置：**
- JWT配置：密钥、过期时间、算法等
- Redis缓存：存储活跃令牌

### 4.3 文件上传模块 (UploadModule)

处理文件上传和资源管理的模块。

**主要职责：**
- 文件上传处理
- 资源信息存储
- 资源与用户关联

**核心组件：**
- UploadController：处理文件上传请求
- UploadService：实现文件处理逻辑
- Multer配置：文件存储策略

### 4.4 缓存模块 (RedisCacheModule)

提供Redis缓存功能的公共模块。

**主要职责：**
- Redis连接管理
- 缓存操作封装
- 令牌存储与验证

**配置：**
- Redis连接参数：主机、端口、密码、数据库索引等
- 连接超时和重连策略

## 5. 数据模型设计

### 5.1 User实体

用户信息实体，存储系统用户的基本信息和账户状态。

**主要字段：**
- `id`: 主键，自增生成
- `userId`: 自定义用户ID，唯一标识
- `username`: 用户名，登录账号
- `email`: 电子邮箱
- `password`: 加密后的密码
- `phone`: 手机号码
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 5.2 Resources实体

资源实体，存储系统中的文件资源信息。

**主要字段：**
- `id`: 主键，自增生成
- `resourceId`: 自定义资源ID
- `name`: 资源名称
- `originalName`: 文件原始名称
- `resourcePath`: 资源存储路径
- `mimetype`: 资源MIME类型
- `size`: 资源大小
- `userId`: 资源所属用户ID
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

## 6. 认证与授权机制

### 6.1 JWT认证流程

1. **用户登录**：验证用户名和密码，生成访问令牌和刷新令牌
2. **令牌验证**：通过JwtAuthGuard验证请求中的JWT令牌
3. **令牌存储**：活跃令牌存储在Redis中，用于令牌验证和失效处理
4. **令牌刷新**：使用刷新令牌获取新的访问令牌
5. **用户登出**：从Redis中移除用户的活跃令牌

### 6.2 认证守卫 (JwtAuthGuard)

实现CanActivate接口，提供JWT令牌验证功能。

**主要功能：**
- 从请求头提取Authorization令牌
- 验证令牌格式和签名
- 检查令牌是否在Redis中活跃
- 将用户信息注入请求对象

### 6.3 GetCurrentUser装饰器

从请求对象中提取当前登录用户信息的自定义装饰器，方便控制器方法获取用户数据。

## 7. 配置管理

### 7.1 配置文件结构

- **app.config.ts**: 应用基本配置（端口、环境、CORS等）
- **database.config.ts**: 数据库连接配置
- **jwt.config.ts**: JWT认证配置
- **redis.config.ts**: Redis缓存配置

### 7.2 配置加载机制

使用@nestjs/config模块统一管理配置，支持环境变量和配置文件，配置加载优先级：

1. 环境变量
2. 默认配置值

### 7.3 关键配置项

| 配置项 | 说明 | 默认值 | 环境变量 |
|--------|------|--------|----------|
| 服务端口 | 应用监听端口 | 3000 | PORT |
| 环境模式 | 运行环境 | development | NODE_ENV |
| CORS | 是否启用跨域 | false | CORS_ENABLED |
| 全局前缀 | API路由前缀 | api | GLOBAL_PREFIX |
| 数据库主机 | MySQL主机地址 | localhost | DB_HOST |
| JWT密钥 | JWT签名密钥 | default_jwt_secret_key | JWT_SECRET |
| JWT过期 | 访问令牌过期时间 | 7200秒(2小时) | JWT_EXPIRES_IN |

## 8. 中间件与拦截器

### 8.1 全局异常过滤器 (GlobalExceptionFilter)

捕获并处理应用中的所有异常，统一错误响应格式。

### 8.2 响应拦截器 (ResponseInterceptor)

统一API响应格式，添加标准响应结构。

### 8.3 验证管道 (ValidationPipe)

全局数据验证管道，使用class-validator进行请求数据校验。

**主要特性：**
- 白名单验证
- 数据转换
- 禁止非白名单属性
- 隐式类型转换

## 9. 文件存储与访问

### 9.1 文件上传配置

- **存储方式**：使用Multer的diskStorage存储到文件系统
- **目录结构**：按文件类型分类存储在uploads目录下
- **文件命名**：使用时间戳+随机数+文件扩展名

### 9.2 静态文件服务

通过Express静态文件中间件提供上传文件的HTTP访问，访问路径为`/uploads/`。

## 10. API接口设计

### 10.1 认证相关接口

| 接口路径 | 方法 | 功能描述 | 认证要求 |
|----------|------|----------|----------|
| /auth/login | POST | 用户登录 | 否 |
| /auth/register | POST | 用户注册 | 否 |
| /auth/refresh | POST | 刷新令牌 | 否 |
| /auth/logout | POST | 用户登出 | 是 |
| /auth/is-login | POST | 检查登录状态 | 是 |

### 10.2 上传相关接口

| 接口路径 | 方法 | 功能描述 | 认证要求 |
|----------|------|----------|----------|
| /upload | POST | 上传文件 | 是 |

## 11. 安全特性

### 11.1 密码安全

使用bcrypt算法加密存储用户密码，防止密码泄露风险。

### 11.2 JWT安全

- 使用强密钥签名JWT令牌
- 设置合理的令牌过期时间
- 在Redis中维护活跃令牌列表，支持令牌主动失效
- 验证令牌算法，防止算法替换攻击

### 11.3 输入验证

通过ValidationPipe进行严格的输入数据验证，防止注入攻击。

## 12. 部署配置

### 12.1 Docker支持

项目包含Dockerfile和docker-compose配置，支持容器化部署。

### 12.2 环境变量

通过.env文件配置环境变量，支持不同环境的灵活配置。

## 13. 开发与测试

### 13.1 开发命令

| 命令 | 功能描述 |
|------|----------|
| npm run start:dev | 开发模式启动 |
| npm run build | 构建项目 |
| npm run start:prod | 生产模式启动 |
| npm run test | 运行测试 |

### 13.2 代码规范

使用ESLint和Prettier进行代码风格检查和格式化，确保代码质量。

## 14. 扩展建议

1. **API文档**：集成Swagger生成API文档
2. **权限控制**：实现更细粒度的RBAC权限模型
3. **文件分片上传**：支持大文件分片上传
4. **分布式部署**：优化Redis配置支持集群部署
5. **监控告警**：集成Prometheus和Grafana进行监控