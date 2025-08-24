import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Hollow Knight: Silksong',
  description: 'The page you are looking for could not be found in the Silksong archive.',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center px-4">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
            404
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins text-white">
            Lost in the Void
          </h1>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            Even Hornet couldn't find this path. The page you seek has vanished into the depths.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Return Home
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/timeline" className="flex items-center gap-2 text-white border-white/30 hover:bg-white/10">
              <Search className="w-5 h-5" />
              Explore Timeline
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/checklist" className="text-purple-400 hover:text-purple-300 underline">
              Readiness Checklist
            </Link>
            <Link href="/platforms" className="text-purple-400 hover:text-purple-300 underline">
              Platforms
            </Link>
            <Link href="/faq" className="text-purple-400 hover:text-purple-300 underline">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}