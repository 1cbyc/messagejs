# MessageJS

<div align="center">

**SendGrid, but for chat apps**

Send messages via WhatsApp, Telegram, SMS, and more through a simple, unified API.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

</div>

---

## Overview

MessageJS enables web developers to send messages via multiple chat platforms (WhatsApp, Telegram, SMS, etc.) through a simple SDK, without exposing credentials. Think **EmailJS/SendGrid**, but for messaging apps.

### Key Features

- **Simple SDK**: Similar to EmailJS API (`init()` + `send()`)
- **Secure**: Credentials never exposed to frontend
- **Pluggable**: Support for multiple messaging platforms
- **Lightweight SDK**: <20KB gzipped
- **Production-Ready**: Rate limiting, retries, webhooks

---

## Packages

This is a monorepo containing:

| Package | Description |
|---------|-------------|
| `@messagejs/core` | Node.js/Express backend API |
| `@nsisong/messagejs` | Frontend SDK for browsers & Node.js |
| `@messagejs/shared-types` | Shared TypeScript types |

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/1cbyc/messagejs.git
cd messagejs

# Install dependencies
npm install

# Build all packages
npm run build
```

### Development

```bash
# Start core backend (runs on port 3001)
npm run core

# Build and watch client SDK
npm run client

# Build all packages
npm run build

# Run type checking
npm run typecheck
```

---

## Documentation

- [System Design](docs/system_design.txt) - Complete architecture documentation
- [API Reference](docs/API_REFERENCE.md) - Complete API documentation
- [Quick Start](docs/QUICK_START.md) - Get started in minutes

---

## Usage

### 1. Initialize the SDK

```typescript
import messagejs from '@nsisong/messagejs';

messagejs.init({
  apiKey: 'sk_live_your_api_key',
  baseUrl: 'https://api.messagejs.pro'
});
```

### 2. Send a Message

```typescript
const result = await messagejs.sendMessage({
  connectorId: 'conn_whatsapp',
  templateId: 'tpl_welcome',
  to: '+1234567890',
  variables: {
    name: 'John',
    code: '12345'
  }
});
```

---

## Architecture

```
Client SDK → API Gateway → Connector Router → Third-party APIs
```

- **SDK**: Lightweight client for frontend apps
- **Backend**: Express API with authentication, rate limiting, and routing
- **Connectors**: Pluggable modules for each messaging platform
- **Database**: PostgreSQL for persistence, Redis for caching

---

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (ESM)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Build**: Rollup (SDK), TypeScript compiler

---

## Project Status

**Early Development** - Core infrastructure is being built.

### Completed
- Project architecture and design
- Type system foundation
- Monorepo configuration
- Documentation

### In Progress
- Backend API implementation
- Connector implementations
- Database layer

### Planned
- Dashboard UI
- Testing framework
- CI/CD pipeline

---

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. **Run pre-check before pushing** (`npm run precheck`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Before Pushing

Always run a pre-check to ensure all packages build successfully:

```bash
npm run precheck
```

This verifies that all packages (core, client, dashboard, docs) can build without errors.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Inspired by [EmailJS](https://www.emailjs.com/) and [SendGrid](https://sendgrid.com/).

---

**Built by the Isaac Emmanuel**
