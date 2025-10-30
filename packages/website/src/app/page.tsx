import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Shield,
  Zap,
  Globe,
  Code,
  ArrowRight,
  Check,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-xl font-bold">MessageJS</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="https://docs.messagejs.pro" className="text-sm hover:underline">
                Docs
              </Link>
              <Link href="#features" className="text-sm hover:underline">
                Features
              </Link>
              <Link href="#pricing" className="text-sm hover:underline">
                Pricing
              </Link>
              <Button variant="outline" asChild>
                <Link href="https://docs.messagejs.pro">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              SendGrid, but for chat apps
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Send messages via WhatsApp, Telegram, SMS, and more through a simple,
              unified API. Secure. Reliable. Developer-friendly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="https://docs.messagejs.pro">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#code-examples">View Docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to send messages
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built for developers who want simplicity without sacrificing power
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-6">
              <Code className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 text-xl font-semibold">Simple SDK</h3>
              <p className="mt-2 text-gray-600">
                Just <code className="rounded bg-gray-100 px-2 py-1 text-sm">init()</code> and{" "}
                <code className="rounded bg-gray-100 px-2 py-1 text-sm">send()</code>. Get
                started in minutes, not hours.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <Shield className="h-10 w-10 text-green-600" />
              <h3 className="mt-4 text-xl font-semibold">Secure by Default</h3>
              <p className="mt-2 text-gray-600">
                Your credentials never leave our servers. We encrypt everything
                with AES-256-GCM.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <Globe className="h-10 w-10 text-purple-600" />
              <h3 className="mt-4 text-xl font-semibold">Multi-Platform</h3>
              <p className="mt-2 text-gray-600">
                One API for WhatsApp, Telegram, SMS, and more. Switch
                platforms without changing your code.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <Zap className="h-10 w-10 text-yellow-600" />
              <h3 className="mt-4 text-xl font-semibold">Lightweight</h3>
              <p className="mt-2 text-gray-600">
                Our SDK is less than 20KB gzipped. Fast, efficient, and perfect
                for production.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <MessageSquare className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 text-xl font-semibold">Production Ready</h3>
              <p className="mt-2 text-gray-600">
                Built with rate limiting, automatic retries, webhooks, and
                comprehensive logging.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <Check className="h-10 w-10 text-green-600" />
              <h3 className="mt-4 text-xl font-semibold">Developer Friendly</h3>
              <p className="mt-2 text-gray-600">
                Full TypeScript support, detailed docs, and examples to get you
                up and running quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="border-y bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Works with your favorite platforms
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Connect to multiple messaging services with one integration
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { name: "WhatsApp", color: "bg-green-600" },
              { name: "Telegram", color: "bg-blue-500" },
              { name: "SMS", color: "bg-orange-600" },
              { name: "More coming soon", color: "bg-gray-600" },
            ].map((platform) => (
              <div
                key={platform.name}
                className="flex flex-col items-center justify-center rounded-lg border bg-white p-6"
              >
                <div className={`h-12 w-12 rounded-full ${platform.color}`} />
                <p className="mt-4 font-semibold">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section id="code-examples" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Get started in 2 minutes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Initialize the SDK and start sending messages
            </p>
          </div>
          <div className="mt-16">
            <div className="rounded-lg border bg-gray-900 p-6">
              <pre className="overflow-x-auto text-sm text-gray-300">
                <code>{`// 1. Install the SDK
npm install @messagejs/client

// 2. Initialize
import messagejs from '@messagejs/client';

messagejs.init({
  apiKey: 'sk_live_your_api_key',
  baseUrl: 'https://api.messagejs.pro'
});

// 3. Send a message
const result = await messagejs.sendMessage({
  to: '+1234567890',
  channel: 'whatsapp',
  message: 'Hello from MessageJS!'
});

console.log('Message sent:', result.id);`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-y bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, scale as you grow
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-lg border bg-white p-8">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="mt-2 text-3xl font-bold">$0</p>
              <p className="mt-2 text-sm text-gray-600">Forever</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>1,000 messages/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>All platforms</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>Community support</span>
                </li>
              </ul>
              <Button className="mt-8 w-full" variant="outline" asChild>
                <Link href="https://docs.messagejs.pro">Get Started</Link>
              </Button>
            </div>

            {/* Starter Plan */}
            <div className="rounded-lg border-2 border-blue-600 bg-white p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Starter</h3>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                  Popular
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold">$29</p>
              <p className="mt-2 text-sm text-gray-600">Per month</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>10,000 messages/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>Custom webhooks</span>
                </li>
              </ul>
              <Button className="mt-8 w-full" asChild>
                <Link href="https://docs.messagejs.pro">Get Started</Link>
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-lg border bg-white p-8">
              <h3 className="text-xl font-semibold">Enterprise</h3>
              <p className="mt-2 text-3xl font-bold">Custom</p>
              <p className="mt-2 text-sm text-gray-600">Contact us</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>Unlimited messages</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>SLA guarantee</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  <span>Custom integrations</span>
                </li>
              </ul>
              <Button className="mt-8 w-full" variant="outline" asChild>
                <Link href="https://docs.messagejs.pro">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start sending messages?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Join developers building the future of messaging
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="outline" asChild>
                <Link href="https://docs.messagejs.pro">
                  View Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="https://docs.messagejs.pro">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-xl font-bold">MessageJS</span>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  SendGrid, but for chat apps
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Product</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link href="#features" className="text-gray-600 hover:underline">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-gray-600 hover:underline">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="https://docs.messagejs.pro" className="text-gray-600 hover:underline">
                      Documentation
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Company</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link href="https://github.com/1cbyc/messagejs" className="text-gray-600 hover:underline">
                      GitHub
                    </Link>
                  </li>
                  <li>
                    <Link href="https://github.com/1cbyc/messagejs/blob/main/LICENSE" className="text-gray-600 hover:underline">
                      License
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Support</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link href="https://github.com/1cbyc/messagejs/issues" className="text-gray-600 hover:underline">
                      Issues
                    </Link>
                  </li>
                  <li>
                    <Link href="https://docs.messagejs.pro" className="text-gray-600 hover:underline">
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
              <p>Copyright © {new Date().getFullYear()} MessageJS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

