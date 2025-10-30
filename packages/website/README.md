# MessageJS Website

The official marketing website for MessageJS.

## Overview

This is a Next.js-based marketing site featuring:
- Hero section with CTAs
- Features showcase
- Platform integrations
- Pricing plans
- Code examples
- SEO optimization

## Development

```bash
# Install dependencies (from root)
npm install

# Run development server (from root)
npm run website

# Or from this directory
npm run dev
```

The website runs on **port 3002** to avoid conflicts with other packages.

## Building

```bash
npm run build
```

## Deployment

The website is designed to be deployed to:
- Vercel
- Netlify
- Any static host
- Or your own server

For production deployment, update the base URL in `next.config.js` if needed.

## Styling

This website uses Tailwind CSS with the same design system as the dashboard for brand consistency.

## Structure

```
src/
├── app/
│   ├── layout.tsx    # Root layout with metadata
│   ├── page.tsx      # Home page with all sections
│   └── globals.css   # Global styles
├── components/
│   └── ui/
│       └── button.tsx  # Reusable button component
└── lib/
    └── utils.ts        # Utility functions
```

