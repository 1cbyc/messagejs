import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider">MessageJS</h1>
          <p className="mt-2 text-xs text-gray-400 uppercase tracking-[0.3em]">
            SendGrid, but for chat apps
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/auth/register">
            <Button className="w-full" size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full" size="lg">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500 uppercase tracking-[0.2em]">
          <p>Send messages via WhatsApp, Telegram, SMS, and more</p>
        </div>
      </div>
    </div>
  );
}
