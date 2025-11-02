---
id: react-demo
title: React Demo Walkthrough
sidebar_position: 2
---

# React Demo Walkthrough

Learn how to integrate MessageJS into a React application with this step-by-step guide.

## Overview

The React Demo shows a simple message-sending interface with:
- Form inputs for phone number and message
- Real-time status updates
- Error handling

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/1cbyc/messagejs.git
cd messagejs
```

### 2. Navigate to the Example

```bash
cd packages/examples/react-demo
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

Create a `.env` file:

```env
VITE_MESSAGEJS_API_KEY=sk_live_your_api_key_here
VITE_MESSAGEJS_BASE_URL=https://api.messagejs.pro
```

### 5. Run the Application

```bash
npm run dev
```

Visit http://localhost:5173 in your browser.

## Code Walkthrough

### Initialization

```typescript
import messagejs from '@nsisong/messagejs';

// Initialize once when the app loads
messagejs.init(import.meta.env.VITE_MESSAGEJS_API_KEY);
```

### Sending a Message

```typescript
const handleSend = async () => {
  try {
    const response = await messagejs.sendMessage({
      connectorId: 'conn_whatsapp',
      templateId: 'tpl_demo',
      to: phone,
      variables: { message }
    });
    
    console.log('Message ID:', response.messageId);
    setResult(`Success: ${response.messageId}`);
  } catch (error) {
    console.error('Error:', error);
    setResult(`Error: ${error}`);
  }
};
```

## Key Concepts

### 1. API Key Configuration

Store your API key securely using environment variables. Never commit API keys to version control.

### 2. Error Handling

Always wrap message sending in try-catch blocks to handle network errors gracefully.

### 3. Loading States

Consider adding loading indicators while messages are being sent:

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSend = async () => {
  setIsLoading(true);
  try {
    await messagejs.sendMessage({...});
  } finally {
    setIsLoading(false);
  }
};
```

## Next Steps

- Add message templates
- Implement retry logic
- Build a message history view
- Add multi-channel support

## Full Example

See the complete code in `packages/examples/react-demo/src/App.tsx`.

