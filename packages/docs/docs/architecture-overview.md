---
id: architecture-overview
title: Architecture Overview
sidebar_position: 5
---

# Architecture Overview

MessageJS is built with a modular, scalable architecture that separates concerns across multiple packages.

## High-Level Architecture

```
┌─────────────────┐
│  Web Apps       │
│  (React, Vue)   │
└────────┬────────┘
         │ HTTPS
         │ SDK Calls
┌────────▼──────────────────────────────┐
│         MessageJS Client SDK          │
│  - init(apiKey, projectId)            │
│  - sendMessage(to, message, connector)│
└────────┬──────────────────────────────┘
         │ REST API
         │ POST /api/v1/messages
┌────────▼──────────────────────────────┐
│         Core Backend API              │
│  ┌────────────────────────────────┐  │
│  │  Express.js Server             │  │
│  │  - Auth Middleware             │  │
│  │  - Rate Limiting               │  │
│  │  - Request Validation          │  │
│  └───────────┬────────────────────┘  │
│              │                        │
│  ┌───────────▼────────────────────┐  │
│  │  Service Layer                 │  │
│  │  - MessageService              │  │
│  │  - ProjectService              │  │
│  │  - UserService                 │  │
│  │  - AnalyticsService            │  │
│  └───────────┬────────────────────┘  │
│              │                        │
│  ┌───────────▼────────────────────┐  │
│  │  Connector Router              │  │
│  │  - WhatsAppConnector           │  │
│  └───────────┬────────────────────┘  │
└──────────────┼─────────────────────────┘
               │
      ┌────────▼──────────┐
      │   Database        │
      │   (PostgreSQL)    │
      │   - Users         │
      │   - Projects      │
      │   - API Keys      │
      │   - Messages      │
      │   - Templates     │
      └────────┬──────────┘
               │
      ┌────────▼──────────┐
      │  Redis Cache      │
      │  - Rate Limiting  │
      │  - Session Store  │
      │  - Queue Worker   │
      └───────────────────┘

┌─────────────────────────────────────────┐
│         External APIs                   │
│  ┌──────────┐                          │
│  │ WhatsApp │                          │
│  │ Cloud API│                          │
│  └──────────┘                          │
└─────────────────────────────────────────┘
```

## Components

### 1. Client SDK (`@messagejs/client`)

A lightweight TypeScript library for frontend applications.

**Features:**
- Simple API: `init()` and `sendMessage()`
- Less than 20KB gzipped
- Full TypeScript support
- Error handling and retries

### 2. Core API (`@messagejs/core`)

The backend Express.js server that processes all requests.

**Features:**
- API key authentication
- Rate limiting per key
- Job queue with BullMQ
- Connector routing
- Comprehensive logging

### 3. Dashboard (`@messagejs/dashboard`)

React/Next.js web UI for project management.

**Features:**
- User authentication
- Project management
- API key generation
- Service configuration
- Message logs & analytics

### 4. Website (`@messagejs/website`)

Marketing website built with Next.js.

**Features:**
- Hero section
- Features showcase
- Pricing information
- Code examples

## Data Flow

### Message Sending Flow

1. **Client SDK** receives `sendMessage()` call
2. **SDK** makes authenticated request to Core API
3. **Core API** validates API key
4. **Core API** fetches project and connector config
5. **Core API** decrypts credentials
6. **Connector** sends message to third-party API
7. **Core API** logs result to database
8. **SDK** returns result to client

### Authentication Flow

1. User logs in via Dashboard
2. Backend validates credentials
3. JWT token generated
4. Token used for authenticated requests
5. Middleware validates token on each request

## Security

### Credential Management

- **Encryption**: AES-256-GCM for credentials at rest
- **Key Management**: Environment-based encryption keys
- **Decryption**: Only in memory during message sending

### Authentication

- **Dashboard**: JWT-based sessions
- **API**: API key authentication
- **Authorization**: Project-scoped access control

### Rate Limiting

- Per API key limits
- Redis-backed counter
- Configurable thresholds

## Scalability

### Horizontal Scaling

- Stateless API design
- Shared Redis for coordination
- PostgreSQL connection pooling with Prisma Accelerate

### Performance

- Asynchronous job processing
- Caching with Redis
- Database indexing
- Connection pooling

## Next Steps

- [Project Structure](./project-structure)
- [Data Flow](./data-flow)
- [Technology Stack](./technology-stack)

