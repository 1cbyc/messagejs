# @nsisong/messagejs

MessageJS Client SDK - Send messages via WhatsApp, Telegram, SMS, and more through a simple, unified API.

## Installation

```bash
npm install @nsisong/messagejs
```

## Quick Start

```typescript
import messagejs from '@nsisong/messagejs';

// Initialize the SDK
messagejs.init({
  apiKey: 'sk_live_your_api_key',
  baseUrl: 'https://api.messagejs.pro'
});

// Send a message
const result = await messagejs.sendMessage({
  connectorId: 'conn_whatsapp',
  templateId: 'tpl_welcome',
  to: '+1234567890',
  variables: {
    name: 'John',
    code: '12345'
  }
});

console.log('Message ID:', result.messageId);
console.log('Status:', result.status);
```

## Documentation

For complete documentation, visit [https://docs.messagejs.pro](https://docs.messagejs.pro)

## License

MIT

