// Common template files
exports.generateGitignore = function(config) {
  const gitignoreContent = `
# Dependencies
node_modules/
__pycache__/
target/
build/
dist/
vendor/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite
*.sqlite3

# Docker
.dockerignore

# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out

# Rust
/target/
**/*.rs.bk
Cargo.lock

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/
.idea/
.vscode/

# Java
*.class
*.log
*.jar
*.war
*.ear
*.zip
*.tar.gz
*.rar

# IDE files
.metadata/
.recommenders/
.settings/
.loadpath
.factorypath
.project
.classpath
.c9/
.launch/
.settings/
.springBeans
.sts4-cache/

# Temporary files
*.tmp
*.temp
`;
  
  return gitignoreContent;
};

exports.generateEnvExample = function(config) {
  const commonEnv = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/${config.projectName}
DB_NAME=${config.projectName}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info

# External Services
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;

  // Add technology-specific env variables
  const techSpecific = {
    python: `
# Python Specific
PYTHONPATH=.
DEBUG=True
CORS_ORIGINS=http://localhost:3000`,
    
    java: `
# Java Specific
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080`,
    
    go: `
# Go Specific
GIN_MODE=debug`,
    
    rust: `
# Rust Specific
RUST_LOG=debug`,
    
    php: `
# PHP Specific
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:your-app-key`
  };

  const specificEnv = techSpecific[config.technology] || '';
  
  return commonEnv + specificEnv;
};