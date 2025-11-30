import { registerAs } from '@nestjs/config';
import * as winston from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

export default registerAs('logger', () => {
  // 确保日志目录存在
  const logsDir = join(process.cwd(), 'logs');
  
  // 错误日志的传输配置
  const errorTransport = new winstonDailyRotateFile({
    level: 'error',
    filename: join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  });

  // 正常日志的传输配置
  const combinedTransport = new winstonDailyRotateFile({
    level: 'info',
    filename: join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  });

  // 控制台输出配置
  const consoleTransport = new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
      winston.format.colorize(),
      winston.format.printf(
        ({ timestamp, level, message, context, ...meta }) => {
          let logMsg = `${timestamp} [${level}]`;
          if (context) {
            logMsg += ` [${context}]`;
          }
          logMsg += `: ${message}`;
          
          // 添加其他元数据
          if (Object.keys(meta).length > 0) {
            logMsg += ` ${JSON.stringify(meta, null, 2)}`;
          }
          
          return logMsg;
        },
      ),
    ),
  });

  return {
    winston: {
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        errorTransport,
        combinedTransport,
        consoleTransport,
      ],
    },
  };
});