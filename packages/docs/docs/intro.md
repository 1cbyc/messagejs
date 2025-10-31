---
id: intro
title: Welcome to MessageJS
sidebar_position: 1
---

# Welcome to MessageJS

MessageJS enables web developers to send messages via multiple chat platforms (WhatsApp, Telegram, SMS, etc.) through a simple SDK, without exposing credentials. Think **EmailJS/SendGrid**, but for messaging apps.

## What is MessageJS?

MessageJS is like SendGrid/EmailJS, but for chat applications. It provides:

- **Simple SDK**: Similar to EmailJS API (`init()` + `send()`)
- **Secure**: Credentials never exposed to frontend
- **Unified Interface**: Single API for multiple messaging platforms
- **Developer-Friendly**: Minimal setup, clear documentation
- **Lightweight**: SDK is less than 20KB gzipped
- **Production-Ready**: Rate limiting, automatic retries, webhooks, and comprehensive logging

## Core Problem Solved

Web developers often need to send transactional messages (e.g., OTPs, notifications, order confirmations) from their applications. Integrating directly with services like WhatsApp Cloud API or Twilio requires handling authentication, managing API keys securely, and writing backend logic. MessageJS acts as a secure proxy, providing a simple, EmailJS-like experience for chat platforms.

## Key Principles

- **Simplicity**: The client-side SDK should be intuitive, with a minimal API surface (`init`, `send`).
- **Security**: Frontend applications should never handle raw credentials. All communication is secured via per-project API keys.
- **Modularity**: The backend must support new messaging providers through a pluggable "connector" architecture.
- **Performance**: The client-side SDK must be lightweight (less than 20KB gzipped) to avoid impacting web application performance.

## Architecture Overview

MessageJS consists of:

- **Core**: Node.js/Express backend API
- **Client SDK**: Lightweight TypeScript SDK for browsers
- **Dashboard**: React/Next.js web UI for management
- **Website**: Marketing website showcasing features

### System Flow

```
[Client App w/ messagejs-client] 
    ↓ HTTPS (SDK calls)
[messagejs-core API] 
    ↓ Connectors
[Third-Party Messaging API]
```

## Getting Started

### Step 1: Install the SDK

```bash
npm install @messagejs/client
```

### Step 2: Initialize

```typescript
import { messagejs } from '@messagejs/client';

messagejs.init({
  apiKey: 'sk_live_your_api_key',
  baseUrl: 'https://api.messagejs.pro'
});
```

### Step 3: Send a Message

```typescript
const result = await messagejs.sendMessage({
  to: '+1234567890',
  channel: 'whatsapp',
  message: 'Hello from MessageJS!'
});

console.log('Message sent:', result.id);
```

## Supported Platforms

- ✅ **WhatsApp** - Via Cloud API
- ✅ **SMS** - Via Twilio
- 🔜 **Telegram** - Via Bot API (coming soon)
- 🔜 More coming soon

## Security

Your credentials never leave our servers. We use:
- **AES-256-GCM** encryption for credentials
- **bcrypt** for API key hashing
- **JWT** for authentication
- **Rate limiting** per API key
- **Input validation** via Zod schemas

## Dashboard

Manage your projects, API keys, and message history at [app.messagejs.pro](https://app.messagejs.pro).

## Next Steps

- Read our [Quick Start Guide](#) to get up and running in minutes
- Explore the [API Reference](#) for detailed endpoint documentation
- Check out [Examples](#) to see real-world implementations
- Visit our [GitHub](https://github.com/1cbyc/messagejs) to contribute

Let's get started!
