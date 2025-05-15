"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dummy data for user's ads
const dummyUserAds = [
  {
    id: 101,
    amount: 800,
    currency: "USD",
    rate: 1.04,
    targetCurrency: "ZWG",
    description: "Looking to exchange USD for ZWG. Available weekdays.",
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
    expiresAt: new Date(Date.now() + 17 * 60 * 60 * 1000).toISOString(), // 17 hours from now
  },
  {
    id: 102,
    amount: 1200,
    currency: "ZWG",
    rate: 0.96,
    targetCurrency: "USD",
    description: "Need USD urgently. Can meet in city center.",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // 20 hours from now
  }
];

export default function MyAds() {
  const [userAds, setUserAds] = useState(dummyUserAds);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    rate: "",
    targetCurrency: "ZWG",
    description: ""
  });
  const router = useRouter();

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create new ad
    const newAd = {
      id: Date.now(), // Using timestamp as ID for simplicity
      ...formData,
      amount: parseFloat(formData.amount),
      rate: parseFloat(formData.rate),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expires in 24 hours
    };
    
    // Add new ad to list
    setUserAds([newAd, ...userAds]);
    
    // Close modal and reset form
    setShowCreateModal(false);
    setFormData({
      amount: "",
      currency: "USD",
      rate: "",
      targetCurrency: "ZWG",
      description: ""
    });
  };

  // Handle delete ad
  const handleDelete = (adId) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      setUserAds(userAds.filter(ad => ad.id !== adId));
    }
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
            <Link href="/exchange" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-1 py-1">
              Exchange
            </Link>
            <Link href="/my-ads" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 px-1 py-1">
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
              <Link href="/exchange" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2 py-1 hover:border-l-4 hover:border-indigo-600 dark:hover:border-indigo-400">
                Exchange
              </Link>
              <Link href="/my-ads" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400 pl-2 py-1">
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-0 font-[var(--font-raleway)]">
              My Currency Exchange Ads
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white text-xs sm:text-sm rounded-md hover:bg-indigo-700 transition flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Ad
            </button>
          </div>

          {/* User's Ads List */}
          <div className="space-y-3 sm:space-y-4">
            {userAds.length > 0 ? (
              userAds.map((ad) => (
                <div key={ad.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="px-2 py-0.5 sm:py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-xs font-medium">
                          {ad.currency} → {ad.targetCurrency}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          Created {new Date(ad.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Expires in: {getTimeRemaining(ad.expiresAt)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 bg-red-600 text-white text-xs sm:text-sm rounded hover:bg-red-700 transition"
                      >
                        Delete
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
                <p className="text-gray-500 dark:text-gray-400 text-sm">You haven&apos;t created any ads yet.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition"
                >
                  Create Your First Ad
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Ad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-3">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white font-[var(--font-raleway)]">
                  Create New Ad
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                        required
                      >
                        <option value="USD">USD</option>
                        <option value="ZWG">ZWG</option>
                        <option value="TZS">TZS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Target Currency
                      </label>
                      <select
                        name="targetCurrency"
                        value={formData.targetCurrency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                        required
                      >
                        <option value="USD">USD</option>
                        <option value="ZWG">ZWG</option>
                        <option value="TZS">TZS</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                      Exchange Rate (1 {formData.currency} = ? {formData.targetCurrency})
                    </label>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      placeholder="Enter rate"
                      step="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description / Notes
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add details about your exchange offer"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                  >
                    Create Ad
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
