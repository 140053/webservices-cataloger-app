# Base image
FROM node:20-alpine
WORKDIR /app

# Enable pnpm
#RUN corepack enable

# Install pnpm globally
RUN npm install -g pnpm


# Install deps
#FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build app
#FROM base AS builder
#COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production runner
#FROM node:20-alpine AS runner
#WORKDIR /app
#RUN corepack enable

#ENV NODE_ENV=production

#COPY --from=builder /app ./

EXPOSE 3000

CMD ["pnpm", "start"]