---
id: installation
title: Installation & Setup
sidebar_position: 3
---

# Installation & Setup

This guide will help you set up MessageJS for local development.

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 10 or higher (or yarn/pnpm)
- **PostgreSQL**: Version 14 or higher
- **Redis**: Version 6 or higher (for caching and queues)

## Quick Setup with Docker

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/1cbyc/messagejs.git
cd messagejs

# Copy environment variables
cp .env.example .env

# Start services (PostgreSQL and Redis)
docker-compose up -d

# Install dependencies
npm install

# Run database migrations
cd packages/core
npx prisma migrate dev

# Build all packages
cd ../..
npm run build
```

## Manual Setup

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL

```bash
# Create a database
createdb messagejs_dev

# Or using psql
psql -U postgres
CREATE DATABASE messagejs_dev;
```

### 3. Set Up Redis

```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Key variables to configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/messagejs_dev"
DATABASE_URL_DIRECT="postgresql://user:password@localhost:5432/messagejs_dev"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"

# API
PORT=3001
```

### 5. Run Database Migrations

```bash
cd packages/core
npx prisma migrate dev
cd ../..
```

### 6. Generate Prisma Client

```bash
cd packages/core
npx prisma generate
cd ../..
```

### 7. Build All Packages

```bash
npm run build
```

## Verify Installation

Start the development server:

```bash
# Start core backend
npm run core
```

You should see:

```
✓ Server running on http://localhost:3001
✓ Connected to database
✓ Redis connected
✓ Workers started
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
psql -U postgres -l

# Check connection string format
echo $DATABASE_URL
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

## Next Steps

- [Running in Development](./running-development)
- [Quick Start Guide](./quick-start)
- [System Architecture](./architecture-overview)

