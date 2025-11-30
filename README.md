# 企业级NestJS后端服务

这是一个基于NestJS框架的企业级后端服务架构，提供了完整的模块化结构和常用功能实现。

## 项目结构

```
src/
├── app.module.ts        # 应用主模块
├── main.ts              # 应用入口文件
├── common/              # 通用组件
│   ├── auth/            # 认证相关模块
│   ├── decorators/      # 自定义装饰器
│   ├── filters/         # 异常过滤器
│   ├── guards/          # 守卫
│   ├── interceptors/    # 拦截器
│   ├── middleware/      # 中间件
│   ├── pipes/           # 管道
│   ├── types/           # 类型定义
│   └── utils/           # 工具函数
├── config/              # 配置文件
├── entities/            # TypeORM实体
├── modules/             # 业务模块
│   ├── auth/            # 认证模块
│   ├── user/            # 用户模块
│   └── health/          # 健康检查模块
```

## 核心功能

- **认证系统**：基于JWT的用户认证，包括登录和注册功能
- **用户管理**：用户CRUD操作，密码加密存储
- **健康检查**：服务状态监控
- **统一异常处理**：全局异常过滤器
- **数据验证**：基于class-validator的数据验证
- **配置管理**：基于环境变量的配置管理

## 技术栈

- **NestJS**：Node.js框架
- **MySQL**：关系型数据库
- **TypeORM**：ORM库
- **JWT**：用户认证
- **bcrypt**：密码加密
- **class-validator**：数据验证

## 安装依赖

```bash
# 使用npm
npm install

# 或使用yarn
yarn install

# 或使用pnpm
pnpm install
```

## 环境配置

1. 复制`.env.example`文件为`.env`
2. 根据需要修改`.env`文件中的配置

## 运行项目

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## API端点

- **认证**
  - POST /api/auth/login - 用户登录
  - POST /api/auth/register - 用户注册

- **用户管理**
  - GET /api/users - 获取所有用户（需要认证）
  - GET /api/users/:id - 获取单个用户（需要认证）
  - PUT /api/users/:id - 更新用户（需要认证）
  - DELETE /api/users/:id - 删除用户（需要认证）

- **健康检查**
  - GET /api/health - 检查服务健康状态

## 扩展指南

### 添加新模块

1. 在`src/modules/`下创建新的模块目录
2. 创建控制器、服务、DTO等文件
3. 创建模块文件并导出
4. 在`app.module.ts`中导入新模块

### 添加新的数据库模型

1. 在`src/entities/`下创建新的TypeORM实体文件
2. 使用TypeORM装饰器定义实体结构
3. 在相应模块中导入并使用

## 测试

```bash
# 运行单元测试
npm run test

# 运行e2e测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:cov
```

## 生产部署

1. 构建项目：`npm run build`
2. 设置环境变量
3. 启动服务：`npm run start:prod`

## License

MIT
