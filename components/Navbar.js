'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar({ activePage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { success } = await signOut();
      if (success) {
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow w-full">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-[var(--font-raleway)]">Zhet</h1>
          <button 
            className="sm:hidden text-gray-600 dark:text-gray-300 focus:outline-none" 
            onClick={toggleMobileMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center space-x-4 mt-3 sm:mt-0">
          <Link href="/exchange" className={`text-sm font-medium ${activePage === 'exchange' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'} px-1 py-1`}>
            Exchange
          </Link>
          <Link href="/my-ads" className={`text-sm font-medium ${activePage === 'my-ads' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'} px-1 py-1`}>
            My Ads
          </Link>
          <Link href="/profile" className={`text-sm font-medium ${activePage === 'profile' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'} px-1 py-1`}>
            Profile
          </Link>
          <button 
            className="ml-4 text-sm bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </nav>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden w-full mt-3 pb-2">
            <nav className="flex flex-col space-y-2">
              <Link href="/exchange" className={`text-sm font-medium ${activePage === 'exchange' ? 'text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-l-4 hover:border-indigo-600 dark:hover:border-indigo-400'} pl-2 py-1`}>
                Exchange
              </Link>
              <Link href="/my-ads" className={`text-sm font-medium ${activePage === 'my-ads' ? 'text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-l-4 hover:border-indigo-600 dark:hover:border-indigo-400'} pl-2 py-1`}>
                My Ads
              </Link>
              <Link href="/profile" className={`text-sm font-medium ${activePage === 'profile' ? 'text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-l-4 hover:border-indigo-600 dark:hover:border-indigo-400'} pl-2 py-1`}>
                Profile
              </Link>
              <button 
                className="text-sm text-left bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 mt-2"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 