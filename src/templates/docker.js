module.exports = {
  generateDockerfileNode(config) {
    return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]`;
  },

  generateDockerCompose(config) {
    const dbServices = {
      mongodb: `
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db`,
      postgresql: `
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${config.projectName}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data`
    };

    const dbService = config.database ? dbServices[config.database] : '';

    return `version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
${config.database ? `      - ${config.database}` : ''}
    environment:
      - DATABASE_URL=${config.database ? `${config.database}://localhost:27017/${config.projectName}` : ''}
${dbService}

volumes:
${config.database ? `  ${config.database}_data:` : ''}`;
  }
};