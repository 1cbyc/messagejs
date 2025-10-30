# MessageJS Quick Start Guide

Get up and running with MessageJS in 5 minutes.

## Table of Contents
1. [Overview](#overview)
2. [Dashboard Setup](#dashboard-setup)
3. [SDK Integration](#sdk-integration)
4. [Send Your First Message](#send-your-first-message)
5. [Next Steps](#next-steps)

---

## Overview

MessageJS lets you send messages through WhatsApp, Telegram, SMS, and more from your web app—without exposing credentials to the frontend.

**Flow:**
1. Create a project in the dashboard
2. Add connector credentials (WhatsApp, Telegram, etc.)
3. Get your API key
4. Install SDK in your app
5. Send messages!

---

## Dashboard Setup

### 1. Sign Up

Visit [dashboard.messagejs.pro](https://dashboard.messagejs.pro) and create an account.

### 2. Create a Project

1. Click "New Project"
2. Enter project name: `My Awesome App`
3. Click "Create"

### 3. Add a Connector

Choose your messaging platform:

#### **WhatsApp (Recommended)**
1. Go to "Connectors" → "Add Connector"
2. Select "WhatsApp"
3. Fill in credentials:
   - **Phone Number ID**: From Meta Business Manager
   - **Access Token**: From Meta Business Manager
4. Click "Test Connection"
5. Click "Save"

#### **Telegram**
1. Go to "Connectors" → "Add Connector"
2. Select "Telegram"
3. Fill in credentials:
   - **Bot Token**: From @BotFather
4. Click "Test Connection"
5. Click "Save"

#### **Twilio (SMS)**
1. Go to "Connectors" → "Add Connector"
2. Select "Twilio"
3. Fill in credentials:
   - **Account SID**: From Twilio Console
   - **Auth Token**: From Twilio Console
   - **From Number**: Your Twilio phone number
4. Click "Test Connection"
5. Click "Save"

### 4. Create API Key

1. Go to "API Keys" → "Create Key"
2. Enter name: `Production Key`
3. Set rate limit (optional)
4. Click "Create"
5. **Copy the API key** — you'll need it for the SDK!

---

## SDK Integration

### Install SDK

#### npm/yarn
```bash
npm install messagejs-client
# or
yarn add messagejs-client
```

#### CDN (Browser)
```html
<script src="https://cdn.messagejs.pro/v1/messagejs.js"></script>
```

### Initialize SDK

```typescript
import messagejs from 'messagejs-client';

// Initialize with your API key and project ID
messagejs.init(
  'sk_live_abc123def456...', // Your API key
  'proj_xyz789',             // Your project ID
  {
    endpoint: 'https://api.messagejs.pro', // optional
    timeout: 10000                           // optional
  }
);
```

**Browser:**
```javascript
messagejs.init('sk_live_abc123...', 'proj_xyz789');
```

---

## Send Your First Message

### Basic Example

```typescript
async function sendWelcomeMessage() {
  const result = await messagejs.sendMessage({
    to: '+1234567890',              // Phone number (E.164 format)
    message: 'Hello from MessageJS!',
    connector: 'whatsapp'           // or 'telegram', 'twilio'
  });

  if (result.success) {
    console.log('Message sent!', result.messageId);
  } else {
    console.error('Error:', result.error);
  }
}
```

### React Component

```typescript
import React, { useState } from 'react';
import messagejs from 'messagejs-client';

messagejs.init(
  process.env.REACT_APP_MESSAGEJS_API_KEY!,
  process.env.REACT_APP_MESSAGEJS_PROJECT_ID!
);

function ContactForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    
    try {
      const result = await messagejs.sendMessage({
        to: phoneNumber,
        message: 'New contact form submission!',
        connector: 'whatsapp'
      });

      if (result.success) {
        alert('Message sent! 🎉');
        setPhoneNumber('');
      } else {
        alert('Failed to send: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="+1234567890"
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  );
}
```

### Node.js Example

```typescript
import messagejs from 'messagejs-client';

messagejs.init(
  process.env.MESSAGEJS_API_KEY!,
  process.env.MESSAGEJS_PROJECT_ID!
);

async function sendOTP(phoneNumber: string, code: string) {
  const result = await messagejs.sendMessage({
    to: phoneNumber,
    message: `Your verification code is: ${code}`,
    connector: 'whatsapp'
  });

  return result.success;
}
```

### With Templates

**1. Create Template in Dashboard:**
- Name: `welcome`
- Content: `Hello {{name}}, welcome to {{company}}! Your code: {{code}}`

**2. Use in SDK:**
```typescript
const result = await messagejs.sendMessage({
  to: '+1234567890',
  templateId: 'welcome',
  templateVars: {
    name: 'John',
    company: 'MyCompany',
    code: '12345'
  },
  connector: 'whatsapp'
});
```

---

## Next Steps

### Learn More
- Read the [full documentation](/docs/README.md)
- Browse [API reference](/docs/API_REFERENCE.md)
- Check out [examples](/examples)

### Dashboard Features
- View message logs and analytics
- Create and manage templates
- Set up multiple connectors
- Configure rate limits

### 🔧 Advanced Usage
- Webhook notifications
- Message status callbacks
- Custom error handling
- Retry logic

### 🆘 Need Help?
- [Documentation](https://docs.messagejs.pro)
- [GitHub Issues](https://github.com/messagejs/messagejs/issues)
- [Discord Community](https://discord.gg/messagejs)
- [Email Support](mailto:support@messagejs.pro)

---

## Tips

### Best Practices

1. **Store API key securely**: Never commit to version control
2. **Use environment variables**: `process.env.MESSAGEJS_API_KEY`
3. **Handle errors**: Always check `result.success`
4. **Validate phone numbers**: Use E.164 format (`+1234567890`)
5. **Rate limiting**: Respect connector rate limits

### Common Pitfalls

1. **Missing initialization**: Call `init()` before sending messages
2. **Invalid phone format**: Use E.164 format with country code
3. **Connector not active**: Enable connector in dashboard
4. **Rate limit exceeded**: Check your plan limits

### Security

- API keys are **read-only** for sending messages
- Never expose connector credentials to frontend
- Use HTTPS in production
- Rotate API keys periodically

---

**Ready to build?** Start sending messages in your app today!
