'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            Seggs.Life
          </Link>
          
          {user ? (
            <nav className="flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/suggestions" 
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                Suggestions
              </Link>
              <Link 
                href="/assessment" 
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                Assessment
              </Link>
              <Link 
                href="/combined-analysis" 
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                Analysis
              </Link>
              <button
                onClick={signOut}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
              >
                Logout
              </button>
            </nav>
          ) : (
            <nav className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
              >
                Get Started
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
} 