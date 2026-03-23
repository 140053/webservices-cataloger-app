# Base image
FROM node:20-alpine
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Build app
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
