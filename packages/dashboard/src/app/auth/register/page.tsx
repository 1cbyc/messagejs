import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 p-8 border border-gray-800 bg-black/40 relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white pointer-events-none"></div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Create Account</h1>
          <p className="mt-2 text-xs text-gray-400 uppercase tracking-[0.3em]">
            Start sending messages in minutes
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-[0.2em]">
              Full Name
            </label>
            <Input id="name" type="text" placeholder="John Doe" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-[0.2em]">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-[0.2em]">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#f45817] hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

