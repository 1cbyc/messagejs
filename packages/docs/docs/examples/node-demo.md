---
id: node-demo
title: Node.js Demo Walkthrough
sidebar_position: 3
---

# Node.js Demo Walkthrough

Learn how to integrate MessageJS into a Node.js backend application.

## Overview

The Node.js Demo demonstrates server-side message sending with:
- Programmatic message dispatch
- Template usage with variables
- Batch operations

## Getting Started

### 1. Navigate to the Example

```bash
cd packages/examples/node-demo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file:

```env
MESSAGEJS_API_KEY=sk_live_your_api_key_here
MESSAGEJS_BASE_URL=https://api.messagejs.pro
```

### 4. Run the Application

```bash
npm run dev
```

## Code Walkthrough

### Basic Setup

```typescript
import messagejs from '@nsisong/messagejs';

// Initialize with environment variables
messagejs.init({
  apiKey: process.env.MESSAGEJS_API_KEY!,
  baseUrl: process.env.MESSAGEJS_BASE_URL
});
```

### Sending a Message

```typescript
async function sendMessage() {
  const result = await messagejs.sendMessage({
    connectorId: 'conn_whatsapp',
    templateId: 'tpl_welcome',
    to: '+1234567890',
    variables: {
      name: 'John',
      code: '12345'
    }
  });

  console.log('Message sent:', result.messageId);
}
```

### Error Handling

```typescript
try {
  await messagejs.sendMessage({...});
} catch (error) {
  console.error('Failed to send message:', error);
  // Implement retry logic or alerting
}
```

## Advanced Patterns

### Batch Sending

```typescript
async function sendBatch(recipients: string[]) {
  const results = await Promise.all(
    recipients.map(to => 
      messagejs.sendMessage({
        connectorId: 'conn_whatsapp',
        templateId: 'tpl_notification',
        to,
        variables: { name: 'User' }
      })
    )
  );
  
  console.log(`Sent ${results.length} messages`);
}
```

### With Retry Logic

The SDK automatically retries failed requests. You can configure retry behavior:

```typescript
messagejs.init({
  apiKey: process.env.MESSAGEJS_API_KEY!,
  retries: 5, // Retry up to 5 times
});
```

### Using Webhooks

Listen for delivery status updates:

```typescript
// Express webhook handler
app.post('/webhooks/messagejs', (req, res) => {
  const { messageId, status, timestamp } = req.body;
  
  console.log(`Message ${messageId} is now ${status}`);
  
  res.status(200).send('OK');
});
```

## Production Considerations

### 1. Environment Variables

Always use environment variables for sensitive data:

```bash
# .env
MESSAGEJS_API_KEY=sk_live_production_key
MESSAGEJS_BASE_URL=https://api.messagejs.pro
```

### 2. Logging

Implement proper logging:

```typescript
import logger from './logger';

try {
  const result = await messagejs.sendMessage({...});
  logger.info('Message sent', { messageId: result.messageId });
} catch (error) {
  logger.error('Failed to send message', { error });
}
```

### 3. Monitoring

Track message sending success rates:

```typescript
const metrics = {
  sent: 0,
  failed: 0
};

try {
  await messagejs.sendMessage({...});
  metrics.sent++;
} catch (error) {
  metrics.failed++;
}
```

## Full Example

See the complete code in `packages/examples/node-demo/src/index.ts`.

