
module.exports = {
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/test-global-project',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};