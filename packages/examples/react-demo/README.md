# MessageJS React Demo

A React application demonstrating how to integrate MessageJS for sending messages.

## Features

- Form-based message sending
- Real-time status updates
- Error handling
- Responsive UI

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
VITE_MESSAGEJS_API_KEY=sk_live_your_api_key_here
VITE_MESSAGEJS_BASE_URL=https://api.messagejs.pro
```

### Running the App

```bash
npm run dev
```

Visit http://localhost:5173 in your browser.

## Usage

1. Enter a phone number in E.164 format (e.g., +1234567890)
2. Enter your message
3. Click "Send" to dispatch the message
4. View success or error status

## Learn More

- [Documentation](https://docs.messagejs.pro)
- [React Demo Guide](https://docs.messagejs.pro/examples/react-demo)
- [Quick Start](https://docs.messagejs.pro/quick-start)

## License

MIT

