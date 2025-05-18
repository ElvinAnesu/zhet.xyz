'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-slate-900 font-[var(--font-poppins)]">
      {/* Header */}
      <header className="container mx-auto p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-[var(--font-raleway)]">Zhet</h1>
        </div>
        <div className="flex gap-2">
          {user ? (
            <Link href="/exchange" className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">Exchange</Link>
          ) : (
            <>
              <Link href="/auth/signin" className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:text-white transition">Login</Link>
              <Link href="/auth/signup" className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">Sign Up</Link>
            </>
          )}
        </div>
      </header>

      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button className="bg-indigo-600 text-white p-3 rounded-full shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-10 md:py-20 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="md:w-1/2 space-y-4 md:space-y-6 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-white leading-tight font-[var(--font-raleway)]">
            Peer-to-Peer Currency Exchange Platform for Zimbabweans
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300">
            Connect directly with others to exchange currencies between Zimbabwe and Tanzania, or within Zimbabwe&apos;s dual currency system.
          </p>
          <div className="pt-2 md:pt-4">
            {user ? (
              <Link href="/exchange" className="inline-block px-6 py-3 rounded-md bg-indigo-600 text-center text-white hover:bg-indigo-700 transition text-sm sm:text-base">
                Exchange
              </Link>
            ) : (
              <Link href="/auth/signup" className="inline-block px-6 py-3 rounded-md bg-indigo-600 text-center text-white hover:bg-indigo-700 transition text-sm sm:text-base">
                Get Started
              </Link>
            )}
          </div>
        </div>
        
        {/* Banner - Hidden on mobile, visible on md and up */}
        <div className="hidden md:block md:w-1/2">
          <div className="relative h-80 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 p-1">
            <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
              <div className="relative h-full w-full">
                <object 
                  type="image/svg+xml"
                  data="/currency-exchange.svg"
                  className="w-full h-full object-cover"
                  aria-label="Currency exchange between Zimbabwean and Tanzanian currencies"
                >
                  <img
                    src="/currency-exchange.svg"
                    alt="Currency exchange between Zimbabwean and Tanzanian currencies"
                    className="w-full h-full object-cover"
                  />
                </object>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent flex flex-col justify-end p-6">
                  <div className="bg-white/90 dark:bg-slate-800/90 p-4 rounded-md max-w-xs">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-2 text-lg font-[var(--font-raleway)]">
                      Safe & Secure Exchanges
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Connect with other users and exchange your currencies with confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile CTA Box - Only visible on mobile */}
        <div className="md:hidden w-full">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-5 text-white">
            <h3 className="text-lg font-bold mb-2 font-[var(--font-raleway)]">Exchange Currency Easily</h3>
            <p className="text-sm mb-3 text-indigo-100">Our platform connects you with verified users for secure currency exchanges.</p>
            {user ? (
              <Link href="/exchange" className="inline-block w-full py-2.5 bg-white text-indigo-600 font-medium text-center rounded-md hover:bg-indigo-50 transition text-sm">
                Exchange
              </Link>
            ) : (
              <Link href="/auth/signup" className="inline-block w-full py-2.5 bg-white text-indigo-600 font-medium text-center rounded-md hover:bg-indigo-50 transition text-sm">
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white font-[var(--font-raleway)]">Currency Exchange Solutions</h2>
            <p className="mt-3 md:mt-4 text-lg md:text-xl text-slate-600 dark:text-slate-300">Addressing specific currency exchange needs</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 md:gap-10">
            <div className="bg-blue-50 dark:bg-slate-800 p-6 md:p-8 rounded-xl">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-3 md:mb-4 font-[var(--font-raleway)]">Cross-Border Exchange</h3>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-4">Connect Zimbabweans in Tanzania who have TZS/USD with individuals in Zimbabwe who have ZWG/USD.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">Secure international transfers</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">Match based on currency needs</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">Competitive exchange rates</span>
                </li>
              </ul>
            </div>
            <div className="bg-purple-50 dark:bg-slate-800 p-6 md:p-8 rounded-xl">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-3 md:mb-4 font-[var(--font-raleway)]">Domestic Exchange</h3>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-4">Facilitate exchanges between ZWG and USD within Zimbabwe&apos;s dual currency system.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">Peer-to-peer matching</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">Avoid bank fees and delays</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">Fast local transfers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 md:py-20 bg-indigo-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white font-[var(--font-raleway)]">How Zhet Works</h2>
            <p className="mt-3 md:mt-4 text-lg md:text-xl text-slate-600 dark:text-slate-300">Simple steps to exchange your currency</p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white dark:bg-slate-700 p-6 rounded-xl text-center">
              <div className="inline-flex h-12 w-12 md:h-16 md:w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mb-4 md:mb-6">
                <span className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400">1</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-2 md:mb-4 font-[var(--font-raleway)]">Create an Account</h3>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">Sign up and verify your identity to start using Zhet&apos;s peer-to-peer currency exchange services.</p>
            </div>
            <div className="bg-white dark:bg-slate-700 p-6 rounded-xl text-center">
              <div className="inline-flex h-12 w-12 md:h-16 md:w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mb-4 md:mb-6">
                <span className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400">2</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-2 md:mb-4 font-[var(--font-raleway)]">Set Exchange Preferences</h3>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">Specify which currencies you have and which you need, along with preferred exchange rates.</p>
            </div>
            <div className="bg-white dark:bg-slate-700 p-6 rounded-xl text-center sm:col-span-2 md:col-span-1">
              <div className="inline-flex h-12 w-12 md:h-16 md:w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mb-4 md:mb-6">
                <span className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400">3</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-2 md:mb-4 font-[var(--font-raleway)]">Complete Exchange</h3>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">Get matched with compatible users, confirm terms, and complete your currency exchange.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-indigo-600 dark:bg-indigo-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 font-[var(--font-raleway)]">Ready to Start Exchanging Currency?</h2>
          <p className="text-base md:text-xl text-indigo-100 max-w-2xl mx-auto mb-6 md:mb-8">
            Be part of the pioneers of using Zhet for your currency exchange needs.
          </p>
          {user ? (
            <Link href="/exchange" className="inline-block px-6 py-3 md:px-8 md:py-4 bg-white text-indigo-600 font-medium rounded-md hover:bg-indigo-50 transition text-sm md:text-base">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/auth/signup" className="inline-block px-6 py-3 md:px-8 md:py-4 bg-white text-indigo-600 font-medium rounded-md hover:bg-indigo-50 transition text-sm md:text-base">
              Create Your Account
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 dark:bg-slate-900 text-white py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="border-t border-slate-700 pt-4 md:pt-6 text-center text-slate-400">
            <p className="text-xs md:text-sm">© {new Date().getFullYear()} Zhet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
