# Core API Deployment Guide

## Overview

This guide covers deploying the MessageJS Core API to production. The Core API is a Node.js/Express backend that handles authentication, message processing, and job queuing.

## Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL database (12+)
- Redis instance (6+)
- Domain/URL for deployment (api.messagejs.pro)

## Environment Variables

The Core API requires the following environment variables:

### Required Variables

| Variable | Description | Example | How to Generate |
|----------|-------------|---------|----------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` | Provided by database host |
| `REDIS_URL` | Redis connection string | `redis://host:6379` or `rediss://host:6380` | Provided by Redis host |
| `ENCRYPTION_KEY` | 32-byte key for AES-256-GCM | 32 random characters | See below |
| `JWT_SECRET` | Secret for JWT token signing | Random string | See below |

### Optional Variables (with defaults)

| Variable | Description | Default | When to Override |
|----------|-------------|---------|-----------------|
| `PORT` | API server port | `3001` | If your host requires a specific port |
| `NODE_ENV` | Environment mode | `development` | Always set to `production` |
| `LOG_LEVEL` | Logging verbosity | `info` | Set to `warn` or `error` for less logs |
| `WHATSAPP_VERIFY_TOKEN` | WhatsApp webhook verification | - | Required for WhatsApp webhooks |
| `DEFAULT_RATE_LIMIT` | Default API key rate limit (req/hour) | `1000` | Adjust based on needs |
| `AUTH_RATE_LIMIT_POINTS` | Auth attempts before blocking | `5` | Increase for testing |
| `AUTH_RATE_LIMIT_DURATION` | Auth rate limit window (seconds) | `900` (15 min) | - |
| `AUTH_RATE_LIMIT_BLOCK_DURATION` | Auth block duration (seconds) | `900` (15 min) | - |
| `WORKER_CONCURRENCY` | Max concurrent job processing | `5` | Scale based on load |
| `WORKER_RATE_LIMIT_MAX` | Worker rate limit jobs | `10` | Based on provider limits |
| `WORKER_RATE_LIMIT_DURATION` | Worker rate limit window (ms) | `1000` | Based on provider limits |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` | Adjust for security needs |

## Generating Secrets

### ENCRYPTION_KEY (32 bytes)

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32 | tr -d '\n' | head -c 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64').slice(0, 32))"

# Option 3: Using /dev/urandom (Linux/Mac)
head -c 32 /dev/urandom | base64
```

### JWT_SECRET

```bash
# Option 1: Using OpenSSL
openssl rand -hex 64

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Deployment Platforms

### Option 1: Railway.app (Recommended for Speed)

Railway provides PostgreSQL, Redis, and Node.js hosting in one place.

**Steps:**
1. Sign up at [railway.app](https://railway.app)
2. Create new project "MessageJS Core API"
3. Add PostgreSQL service (New → PostgreSQL)
4. Add Redis service (New → Redis)
5. Connect your GitHub repo
6. Railway auto-detects package.json and builds
7. Add environment variables in Variables tab
8. Deploy!

**Advantages:**
- PostgreSQL & Redis included
- Auto HTTPS
- Simple pricing
- Great DX

### Option 2: Render.com

Render provides managed PostgreSQL and Redis.

**Steps:**
1. Sign up at [render.com](https://render.com)
2. Create PostgreSQL database
3. Create Redis instance
4. Create Web Service
5. Connect GitHub repo
6. Build command: `npm install && npm run build`
7. Start command: `npm run start`
8. Add environment variables
9. Deploy!

**Advantages:**
- Free tier available
- Managed PostgreSQL & Redis
- Auto deployments
- SSL included

### Option 3: DigitalOcean App Platform

DigitalOcean provides app hosting with managed databases.

**Steps:**
1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Create managed PostgreSQL database
3. Create Redis managed database
4. Create App Platform service
5. Connect GitHub repo
6. Configure build/start commands
7. Add environment variables
8. Deploy!

### Option 4: Self-Hosted (VPS/Docker)

For full control, deploy to your own server.

**Requirements:**
- Ubuntu 20.04+ or similar
- Docker & Docker Compose
- Nginx or similar reverse proxy

See `docker-compose.prod.yml` for setup.

## Build Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start production server
npm start
```

## Worker Process

The API has a separate worker process for processing queued messages. Deploy this as a separate service:

**Build command:** Same as above
**Start command:** `npm run start:worker`

**Note:** Some platforms support "Background Workers". Add this as a separate service.

## Database Migrations

Run migrations after first deployment:

```bash
# Using Prisma CLI
npx prisma migrate deploy

# Or create a startup script that runs migrations
```

## Health Check Endpoint

The API exposes a health check at:
- `GET /api/v1/health`

Configure your hosting provider to monitor this endpoint.

## Monitoring

Recommended monitoring:
- Logs: View application logs in your hosting dashboard
- Uptime: Use services like UptimeRobot or Better Uptime
- Metrics: The API exposes Prometheus metrics at `/metrics`
- Database: Monitor PostgreSQL connections and slow queries
- Redis: Monitor memory usage and connection count

## Scaling Considerations

### Horizontal Scaling

The API is designed to scale horizontally:
- Stateless API server (scales infinitely)
- Shared Redis for coordination
- PostgreSQL connection pooling (Prisma Accelerate)

**To scale:**
1. Deploy multiple API instances
2. All connect to same PostgreSQL + Redis
3. Load balance across instances

### Vertical Scaling

**Database:**
- Monitor connection pool usage
- Increase pool size if needed
- Consider read replicas for heavy read traffic

**Redis:**
- Monitor memory usage
- Consider Redis Cluster for large deployments

**Workers:**
- Deploy multiple worker instances for higher throughput
- Each worker processes jobs concurrently

## Security Checklist

- [ ] All secrets in environment variables (never in code)
- [ ] HTTPS/SSL enabled
- [ ] Firewall restricts database access
- [ ] Redis authentication enabled
- [ ] Rate limiting configured appropriately
- [ ] CORS configured for frontend domains
- [ ] Regular security updates applied
- [ ] Database backups configured
- [ ] Logging configured (without sensitive data)

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
node -e "require('dotenv').config(); const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('Connected!')).catch(e => console.error(e));"
```

### Redis Connection Issues

```bash
# Test Redis connection
node -e "require('dotenv').config(); const IORedis = require('ioredis'); const redis = new IORedis(process.env.REDIS_URL); redis.ping().then(r => console.log('Redis:', r));"
```

### Port Issues

If your hosting provider assigns a random port, ensure your app reads from `process.env.PORT` (already configured).

## Support

For issues or questions:
- Check logs in your hosting dashboard
- Review application logs for errors
- Test health endpoint
- Verify all environment variables are set

