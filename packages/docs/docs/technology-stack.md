---
id: technology-stack
title: Technology Stack
sidebar_position: 8
---

# Technology Stack

MessageJS is built with modern, production-ready technologies.

## Backend

### Runtime
- **Node.js**: Version 20+
- **TypeScript**: For type safety and better DX

### Framework
- **Express.js**: Fast, minimal web framework
- **BullMQ**: Job queue and worker management
- **Redis**: Caching and queue storage

### Database
- **PostgreSQL**: Primary database
- **Prisma**: ORM with type-safe queries
- **Prisma Accelerate**: Connection pooling

### Security
- **bcrypt**: Password hashing
- **AES-256-GCM**: Credential encryption
- **JWT**: Authentication tokens
- **Rate Limit**: redis-rate-limiter

### Validation
- **Zod**: Schema validation
- **express-validator**: Request validation middleware

### Logging
- **Winston**: Structured logging
- **Morgan**: HTTP request logger

## Frontend (Dashboard)

### Framework
- **Next.js**: React framework with App Router
- **React**: UI library

### Styling
- **Tailwind CSS**: Utility-first CSS
- **Radix UI**: Accessible component primitives

### State Management
- **Zustand**: Lightweight state management
- **TanStack Query**: Data fetching and caching

### HTTP Client
- **Axios**: HTTP requests
- **Fetch**: Native browser API

### Forms
- **React Hook Form**: Form handling
- **Class Variance Authority**: Component variants

## Frontend (SDK)

### Build Tools
- **Rollup**: Module bundler
- **TypeScript**: Compile to JavaScript
- **Terser**: Minification

### Output Formats
- **ESM**: ES Modules
- **UMD**: Universal Module Definition
- **TypeScript Declarations**: `.d.ts` files

## Marketing Website

### Framework
- **Next.js**: App Router
- **React**: UI components

### Styling
- **Tailwind CSS**: Utility-first styling

### Deployment
- **Vercel**: Hosting and deployment

## Documentation

### Framework
- **Docusaurus**: Documentation framework
- **MDX**: Markdown with JSX

### Features
- **Search**: Algolia DocSearch (optional)
- **Theme**: Light/Dark mode
- **Code Highlighting**: Prism

## Infrastructure

### Development
- **Docker Compose**: Local services
- **npm workspaces**: Monorepo management

### CI/CD
- **GitHub Actions**: Automated testing and deployment
- **Vercel**: Automatic deployments

### Monitoring (Coming Soon)
- **Sentry**: Error tracking
- **Analytics**: Usage analytics

## Package Management

- **npm**: Primary package manager
- **npm workspaces**: Monorepo support

## Version Control

- **Git**: Source control
- **GitHub**: Hosting and collaboration

## Why These Technologies?

### Node.js & Express
- Fast, scalable runtime
- Large ecosystem
- Great TypeScript support

### PostgreSQL
- ACID compliant
- Excellent performance
- Strong data integrity

### Prisma
- Type-safe queries
- Great DX
- Automatic migrations

### Next.js
- Server-side rendering
- Great performance
- Excellent DX

### Tailwind CSS
- Rapid development
- Consistent design
- Small bundle size

### Redis
- Fast caching
- Pub/sub capabilities
- Reliable queuing

## Performance Considerations

### Bundle Size
- SDK < 20KB gzipped
- Tree-shaking enabled
- Code splitting

### Caching
- Redis for frequent data
- Response caching
- Connection pooling

### Database
- Indexed queries
- Connection pooling
- Query optimization

## Security Stack

### Encryption
- AES-256-GCM for credentials
- bcrypt for passwords
- TLS for all connections

### Authentication
- JWT for sessions
- API keys with hashing
- Rate limiting per key

### Validation
- Zod schemas
- Input sanitization
- SQL injection prevention

## Next Steps

- [Architecture Overview](./architecture-overview)
- [Installation Guide](./installation)
- [Quick Start](./quick-start)

