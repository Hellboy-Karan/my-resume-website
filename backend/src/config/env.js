import dotenv from 'dotenv';

dotenv.config();

export const env = {
  appName: process.env.APP_NAME || 'AI Resume Builder by Karan Kumar Sharma',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY || 'change-me-change-me-change-me-32',
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE || 'ai_resume_builder',
    user: process.env.MYSQL_USER || 'resume_user',
    password: process.env.MYSQL_PASSWORD || 'resume_password'
  },
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ai_resume_builder',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || ''
  },
  systemAi: {
    provider: process.env.SYSTEM_AI_PROVIDER || 'ollama',
    apiKey: process.env.SYSTEM_OPENAI_API_KEY || '',
    baseUrl: process.env.SYSTEM_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.SYSTEM_OPENAI_MODEL || 'gpt-4o-mini'
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.1'
  }
};
