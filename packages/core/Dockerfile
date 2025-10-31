# Use Node.js 20 LTS as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install build dependencies if needed
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Install root dependencies
RUN npm ci --only=production

# Copy workspace configuration
COPY package.json ./

# Install workspace dependencies
RUN npm install --workspace=packages/core --workspace=packages/shared-types

# Copy source code
COPY packages/shared-types ./packages/shared-types
COPY packages/core ./packages/core

# Build both packages
WORKDIR /app
RUN npm run build --workspace=packages/shared-types
WORKDIR /app
RUN npm run build --workspace=packages/core

# Set working directory to core package
WORKDIR /app/packages/core

# Expose port (default 3001, overridden by PORT env var)
EXPOSE 3001

# Run database migrations on startup
CMD npx prisma migrate deploy && node dist/index.js

