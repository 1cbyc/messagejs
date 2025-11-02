# MessageJS Node.js Demo

A Node.js application demonstrating server-side integration with MessageJS.

## Features

- Programmatic message sending
- Template usage
- Variable substitution
- Error handling

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MessageJS API key

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file:

```env
MESSAGEJS_API_KEY=sk_live_your_api_key_here
MESSAGEJS_BASE_URL=https://api.messagejs.pro
```

### Running the App

```bash
npm run dev
```

## Usage

The demo sends a welcome message using a template:

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

## Learn More

- [Documentation](https://docs.messagejs.pro)
- [Node.js Demo Guide](https://docs.messagejs.pro/examples/node-demo)
- [Quick Start](https://docs.messagejs.pro/quick-start)

## License

MIT

