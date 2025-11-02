import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'MessageJS Dashboard',
  description: 'Manage your messaging projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
