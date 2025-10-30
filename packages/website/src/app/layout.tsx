import { type Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Metadata for Next.js 13 App Router
export const metadata: Metadata = {
  title: "MessageJS - SendGrid for Chat Apps",
  description: "Send messages via WhatsApp, Telegram, SMS, and more through a simple, unified API. Secure. Reliable. Developer-friendly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

