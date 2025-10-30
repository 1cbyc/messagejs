import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'MessageJS Dashboard',
    template: '%s | MessageJS',
  },
  description: 'Manage your messaging projects, API keys, services, and templates',
  keywords: ['messaging', 'chat', 'API', 'WhatsApp', 'Telegram', 'SMS'],
  authors: [{ name: 'MessageJS Team' }],
  creator: 'MessageJS',
  publisher: 'MessageJS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'MessageJS Dashboard',
    description: 'Manage your messaging projects, API keys, services, and templates',
    siteName: 'MessageJS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MessageJS Dashboard',
    description: 'Manage your messaging projects, API keys, services, and templates',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
