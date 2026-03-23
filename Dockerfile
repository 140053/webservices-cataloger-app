# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy app source
COPY . .

# Build app
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment variables
ENV JWT_SECRET="FOqDtFjZ&-=#0)Zfs#(@,BuW=nlk&MS[!xXmcAEy3-c"
ENV NODE_ENV=development
ENV NODE_ENV_BACKEND_API=http://10.2.42.18:8001
ENV NEXT_PUBLIC_BACKEND_API=http://fastapi_app:8001
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the app
CMD ["npm", "start"]