---
id: quick-start
title: Quick Start Guide
sidebar_position: 2
---

# Quick Start Guide

Get up and running with MessageJS in minutes.

## Prerequisites

- Node.js 20+ installed
- npm 10+ or yarn
- Basic familiarity with TypeScript/JavaScript

## Step 1: Install the SDK

```bash
npm install @nsisong/messagejs
```

## Step 2: Create a Project

Visit [app.messagejs.pro](https://app.messagejs.pro) and:
1. Create an account
2. Create a new project
3. Generate an API key
4. Add a connector (WhatsApp, Telegram, or SMS)

## Step 3: Initialize the SDK

```typescript
import messagejs from '@nsisong/messagejs';

messagejs.init({
  apiKey: 'sk_live_your_api_key_here',
  baseUrl: 'https://api.messagejs.pro'
});
```

## Step 4: Send Your First Message

```typescript
const result = await messagejs.sendMessage({
  to: '+1234567890',
  channel: 'whatsapp',
  message: 'Hello from MessageJS!'
});

console.log('Message sent:', result.id);
```

## Complete Example

Here's a complete working example:

```typescript
import messagejs from '@nsisong/messagejs';

// Initialize the SDK
messagejs.init({
  apiKey: process.env.MESSAGEJS_API_KEY!,
  baseUrl: 'https://api.messagejs.pro'
});

// Send a message
async function sendMessage() {
  try {
    const result = await messagejs.sendMessage({
      to: '+1234567890',
      channel: 'whatsapp',
      message: 'Your OTP code is 123456'
    });
    
    console.log('✅ Message sent:', result.id);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

sendMessage();
```

## What's Next?

- Learn more about [Architecture](../intro#architecture-overview)
- Explore [Supported Platforms](../intro#supported-platforms)
- Read about [Security](../intro#security)
- Check out [Examples](#) (coming soon)

