"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dummy data for currency ads
const dummyAds = [
  {
    id: 1,
    username: "john_doe",
    rating: 4.8,
    location: "Harare, Zimbabwe",
    amount: 500,
    currency: "USD",
    rate: 1.05,
    targetCurrency: "ZWG",
    description: "Looking to exchange USD for ZWG. Meet in Harare CBD.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(), // 19 hours from now
  },
  {
    id: 2,
    username: "jane_smith",
    rating: 4.5,
    location: "Bulawayo, Zimbabwe",
    amount: 1000,
    currency: "ZWG",
    rate: 0.95,
    targetCurrency: "USD",
    description: "Have ZWG, need USD. Can meet anywhere in Bulawayo.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
  },
  {
    id: 3,
    username: "mike_tz",
    rating: 4.9,
    location: "Dar es Salaam, Tanzania",
    amount: 2000,
    currency: "TZS",
    rate: 0.00043,
    targetCurrency: "USD",
    description: "TZS to USD exchange. Fast and reliable service.",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(), // 14 hours from now
  },
  {
    id: 4,
    username: "sarah_m",
    rating: 4.7,
    location: "Harare, Zimbabwe",
    amount: 750,
    currency: "USD",
    rate: 1.03,
    targetCurrency: "ZWG",
    description: "USD to ZWG, competitive rates. Available daily 9am-5pm.",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(), // 16 hours from now
  },
  {
    id: 5,
    username: "robert_zw",
    rating: 4.6,
    location: "Mutare, Zimbabwe",
    amount: 1500,
    currency: "ZWG",
    rate: 0.97,
    targetCurrency: "USD",
    description: "Looking for USD, offering ZWG. Meet in Mutare town center.",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(), // 21 hours from now
  },
  {
    id: 6,
    username: "lisa_tz",
    rating: 4.8,
    location: "Arusha, Tanzania",
    amount: 3000,
    currency: "TZS",
    rate: 0.00042,
    targetCurrency: "USD",
    description: "TZS to USD, great rates. Mobile money transfer available.",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
  },
];

export default function Exchange() {
  const [activeTab, setActiveTab] = useState("all");
  const [filteredAds, setFilteredAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Filter ads based on active tab and search query
    let filtered = dummyAds;
    
    // Filter by currency tab
    if (activeTab !== "all") {
      filtered = filtered.filter(ad => ad.currency === activeTab || ad.targetCurrency === activeTab);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ad => 
        ad.username.toLowerCase().includes(query) || 
        ad.location.toLowerCase().includes(query) || 
        ad.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredAds(filtered);
  }, [activeTab, searchQuery]);

  // Add mobile menu toggle functionality
  useEffect(() => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
      const toggleMenu = () => {
        mobileMenu.classList.toggle('hidden');
      };
      
      mobileMenuButton.addEventListener('click', toggleMenu);
      
      return () => {
        mobileMenuButton.removeEventListener('click', toggleMenu);
      };
    }
  }, []);

  // Calculate time remaining until ad expires
  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  const handleChat = (adId, username) => {
    alert(`Starting chat with ${username} about ad #${adId}`);
    // In a real implementation, this would open a chat interface or redirect to a chat page
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[var(--font-poppins)] overflow-x-hidden">
      {/* Header/Navigation */}
      <header className="bg-white dark:bg-slate-800 shadow w-full">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-[var(--font-raleway)]">Zhet</h1>
            <button className="sm:hidden text-gray-600 dark:text-gray-300 focus:outline-none" id="mobile-menu-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          <nav className="hidden sm:flex items-center space-x-4 mt-3 sm:mt-0">
            <Link href="/exchange" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 px-1 py-1">
              Exchange
            </Link>
            <Link href="/my-ads" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-1 py-1">
              My Ads
            </Link>
            <Link href="/profile" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-1 py-1">
              Profile
            </Link>
            <button 
              className="ml-4 text-sm bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600"
              onClick={() => {
                // Sign out logic would go here
                router.push('/auth/signin');
              }}
            >
              Sign Out
            </button>
          </nav>
          
          {/* Mobile Navigation Menu */}
          <div className="mobile-menu hidden sm:hidden w-full mt-3 pb-2" id="mobile-menu">
            <nav className="flex flex-col space-y-2">
              <Link href="/exchange" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400 pl-2 py-1">
                Exchange
              </Link>
              <Link href="/my-ads" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2 py-1 hover:border-l-4 hover:border-indigo-600 dark:hover:border-indigo-400">
                My Ads
              </Link>
              <Link href="/profile" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2 py-1 hover:border-l-4 hover:border-indigo-600 dark:hover:border-indigo-400">
                Profile
              </Link>
              <button 
                className="text-sm text-left bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 mt-2"
                onClick={() => {
                  // Sign out logic would go here
                  router.push('/auth/signin');
                }}
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 sm:p-4 md:p-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 font-[var(--font-raleway)]">
            Currency Exchange Listings
          </h2>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-slate-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 dark:text-white"
                placeholder="Search ads..."
              />
            </div>
          </div>

          {/* Currency Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
            <div className="overflow-x-auto -mb-px">
              <ul className="flex flex-nowrap text-sm font-medium text-center min-w-full">
                <li className="mr-2">
                  <button
                    className={`inline-block p-2 md:p-4 border-b-2 rounded-t-lg whitespace-nowrap ${
                      activeTab === "all"
                        ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("all")}
                  >
                    All
                  </button>
                </li>
                <li className="mr-2">
                  <button
                    className={`inline-block p-2 md:p-4 border-b-2 rounded-t-lg whitespace-nowrap ${
                      activeTab === "USD"
                        ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("USD")}
                  >
                    USD
                  </button>
                </li>
                <li className="mr-2">
                  <button
                    className={`inline-block p-2 md:p-4 border-b-2 rounded-t-lg whitespace-nowrap ${
                      activeTab === "ZWG"
                        ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("ZWG")}
                  >
                    ZWG
                  </button>
                </li>
                <li className="mr-2">
                  <button
                    className={`inline-block p-2 md:p-4 border-b-2 rounded-t-lg whitespace-nowrap ${
                      activeTab === "TZS"
                        ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("TZS")}
                  >
                    TZS
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Ads List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredAds.length > 0 ? (
              filteredAds.map((ad) => (
                <div key={ad.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-2 md:mb-0">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-base flex-shrink-0">
                        {ad.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-2 sm:ml-3 min-w-0">
                        <div className="flex items-center flex-wrap">
                          <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-800 dark:text-white mr-2">
                            {ad.username}
                          </h3>
                          <div className="flex items-center text-yellow-500">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            <span className="text-xs ml-1">{ad.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ad.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Expires in: {getTimeRemaining(ad.expiresAt)}</p>
                      </div>
                      <button
                        onClick={() => handleChat(ad.id, ad.username)}
                        className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 bg-indigo-600 text-white text-xs sm:text-sm rounded hover:bg-indigo-700 transition"
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Amount</p>
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {ad.amount.toLocaleString()} {ad.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Rate</p>
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        1 {ad.currency} = {ad.rate} {ad.targetCurrency}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Notes</p>
                      <p className="font-medium text-gray-800 dark:text-white text-xs sm:text-sm break-words">
                        {ad.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-10">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No ads found for this currency.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
