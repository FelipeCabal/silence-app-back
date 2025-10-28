# Multi-stage Dockerfile for NestJS app
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./
# bcrypt and some deps may need build tools during install
RUN apk add --no-cache python3 make g++ \
  && npm ci \
  && apk del python3 make g++

# Copy the rest of the source and build
COPY . .
RUN npm run build

# --- Runtime image ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Only install prod deps to keep image small
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app
COPY --from=builder /app/dist ./dist

# If your app serves static assets or needs schemas, copy them as needed
# COPY --from=builder /app/src/**/*.graphql ./dist/  # example

EXPOSE 3000
CMD ["node", "dist/main.js"]
