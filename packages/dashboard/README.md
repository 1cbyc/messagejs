# MessageJS Dashboard

The web application for managing your MessageJS projects, API keys, and message history.

## Features

- **User Authentication**: Secure login and registration
- **Project Management**: Create and manage multiple projects
- **API Key Management**: Generate and manage API keys
- **Message Logs**: View message history and analytics
- **Template Management**: Create and edit message templates
- **Real-time Updates**: Live status updates for messages

## Quick Start

### Development

```bash
# From root directory
npm run dashboard

# Or from this directory
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel:**

```bash
cd packages/dashboard
npx vercel
```

**Deploy to Netlify:**

1. Connect GitHub repository
2. Set base directory to `packages/dashboard`
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Core API endpoint URL | Yes |

Example:
```bash
NEXT_PUBLIC_API_URL=https://api.messagejs.pro/api/v1
```

## Recommended Domain

- **Production**: `app.messagejs.pro`
- **Staging**: `staging-app.messagejs.pro`

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **UI Components**: Radix UI

## Project Structure

```
packages/dashboard/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── page.tsx      # Home page
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   ├── components/       # React components
│   │   └── ui/          # UI components (buttons, inputs, etc.)
│   └── lib/             # Utilities and API client
│       ├── api.ts       # API client
│       └── utils.ts     # Helper functions
├── public/              # Static assets
├── vercel.json         # Vercel configuration
├── netlify.toml        # Netlify configuration
├── DEPLOYMENT.md       # Deployment guide
└── package.json        # Dependencies
```

## Authentication Flow

1. User registers or logs in
2. JWT token is stored securely
3. Token is used for authenticated API requests
4. Protected routes check for valid token

## API Integration

The dashboard communicates with the Core API at:
- **Development**: `http://localhost:3001/api/v1`
- **Production**: Configure via `NEXT_PUBLIC_API_URL`

All API calls are handled through the centralized client in `src/lib/api.ts`.

## Building for Production

```bash
npm run build
npm start
```

## Testing

```bash
npm run typecheck  # Type checking
npm run lint       # Linting
```

## Troubleshooting

See [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting tips.

## License

MIT

