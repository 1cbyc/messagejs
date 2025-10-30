import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">MessageJS</h1>
          <p className="mt-2 text-sm text-gray-600">
            SendGrid, but for chat apps
          </p>
        </div>

        <div className="space-y-4">
          <Button className="w-full" size="lg">
            Get Started
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            Sign In
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Send messages via WhatsApp, Telegram, SMS, and more</p>
        </div>
      </div>
    </div>
  );
}
