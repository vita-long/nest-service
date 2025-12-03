# 线上数据库表查看指南

本指南详细介绍如何查看线上MySQL数据库中的表结构和数据。

## 方法一：通过SSH连接服务器后访问数据库

### 1. 连接到服务器
```bash
ssh root@47.93.63.238
```

### 2. 进入MySQL容器
```bash
# 切换到项目目录
cd /www/wwwroot/nest-service

# 进入MySQL容器
docker-compose -f docker-compose.prod.yml exec mysql bash
```

### 3. 连接到MySQL数据库
```bash
mysql -u root -p
# 输入密码（默认密码在.env文件中配置，通常为123456）
```

### 4. 查看数据库表
```sql
-- 切换到nest_db数据库
USE nest_db;

-- 查看所有表
SHOW TABLES;

-- 查看特定表的结构（例如查看resources表）
DESCRIBE resources;
-- 或使用
SHOW CREATE TABLE resources;

-- 查看表中的数据
SELECT * FROM resources LIMIT 10;

-- 退出MySQL
EXIT;

-- 退出容器
exit
```

## 方法二：直接使用Docker Compose命令执行MySQL查询

无需进入容器，直接在服务器上执行以下命令：

```bash
# 连接到服务器
ssh root@47.93.63.238

# 切换到项目目录
cd /www/wwwroot/nest-service

# 直接查看所有表
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "USE nest_db; SHOW TABLES;"

# 查看特定表结构
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "USE nest_db; DESCRIBE resources;"

# 查看表数据
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "USE nest_db; SELECT * FROM resources LIMIT 10;"
```

## 方法三：在本地直接执行远程命令

可以直接在本地终端执行以下命令，无需先连接服务器：

```bash
# 查看所有表
ssh root@47.93.63.238 'cd /www/wwwroot/nest-service && docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "USE nest_db; SHOW TABLES;"'

# 查看表结构
ssh root@47.93.63.238 'cd /www/wwwroot/nest-service && docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "USE nest_db; DESCRIBE resources;"'
```

## 常见MySQL命令

### 查看表结构和元数据
```sql
-- 查看表结构
DESCRIBE 表名;
SHOW CREATE TABLE 表名;

-- 查看表的索引
SHOW INDEX FROM 表名;

-- 查看表的状态
SHOW TABLE STATUS WHERE Name = '表名';
```

### 数据查询示例
```sql
-- 查询前N条记录
SELECT * FROM 表名 LIMIT 10;

-- 统计记录数
SELECT COUNT(*) FROM 表名;

-- 查询特定条件的数据
SELECT * FROM 表名 WHERE 条件;
```

## 注意事项

1. 请确保使用正确的数据库密码，密码配置在服务器上的 `.env` 文件中
2. 线上环境请谨慎执行DELETE或UPDATE等修改数据的操作
3. 查询大量数据时建议使用LIMIT限制结果集大小，避免影响数据库性能
4. 如需导出表结构或数据，请参考DEPLOY.md中的备份数据库部分

---

如果在查看数据库表时遇到问题，请参考DEPLOY.md中的常见问题排查部分。