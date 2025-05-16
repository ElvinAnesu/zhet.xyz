"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function MyAds() {
  const [userAds, setUserAds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    rate: "",
    targetCurrency: "ZWG",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [phoneError, setPhoneError] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();

  // Fetch user's ads and profile
  useEffect(() => {
    if (!authUser) {
      router.push('/auth/signin');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user profile to check for phone number
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        setUserProfile(profileData);
        
        // Fetch user's ads
        const { data: adsData, error: adsError } = await supabase
          .from('exchange_ads')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });
          
        if (adsError) {
          throw adsError;
        }
        
        setUserAds(adsData || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load your ads. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authUser, router]);

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
    
    if (diffMs <= 0) {
      return "Expired";
    }
    
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has a phone number
    if (!userProfile?.phone || userProfile.phone.trim() === '') {
      setPhoneError(true);
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      // Create new ad in Supabase
      const { data, error } = await supabase
        .from('exchange_ads')
        .insert([
          {
            user_id: authUser.id,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            rate: parseFloat(formData.rate),
            target_currency: formData.targetCurrency,
            description: formData.description,
            location: userProfile.location || null,
            status: 'active',
            created_at: now.toISOString(),
            expires_at: expiresAt.toISOString()
          }
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Add new ad to list
      setUserAds([data[0], ...userAds]);
      
      // Close modal and reset form
      setShowCreateModal(false);
      setFormData({
        amount: "",
        currency: "USD",
        rate: "",
        targetCurrency: "ZWG",
        description: ""
      });
    } catch (error) {
      console.error("Error creating ad:", error);
      setError("Failed to create ad. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete ad
  const handleDelete = async (adId) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      try {
        const { error } = await supabase
          .from('exchange_ads')
          .delete()
          .eq('id', adId)
          .eq('user_id', authUser.id); // Ensure the ad belongs to the user
          
        if (error) {
          throw error;
        }
        
        setUserAds(userAds.filter(ad => ad.id !== adId));
      } catch (error) {
        console.error("Error deleting ad:", error);
        alert("Failed to delete ad. Please try again.");
      }
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Redirect to profile page to add phone number
  const handleAddPhone = () => {
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[var(--font-poppins)] overflow-x-hidden">
      {/* Use the Navbar component */}
      <Navbar activePage="my-ads" />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6">
            <div className="text-center py-6">
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
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
                            {ad.currency} → {ad.target_currency}
                          </span>
                          <span className={`px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${
                            ad.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Created {new Date(ad.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getTimeRemaining(ad.expires_at) === "Expired" 
                              ? <span className="text-red-500 dark:text-red-400">Expired</span> 
                              : `Expires in: ${getTimeRemaining(ad.expires_at)}`}
                          </p>
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
                          {Number(ad.amount).toLocaleString()} {ad.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Rate</p>
                        <p className="font-medium text-gray-800 dark:text-white truncate">
                          1 {ad.currency} = {Number(ad.rate).toFixed(2)} {ad.target_currency}
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
        )}
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
                  onClick={() => {
                    setShowCreateModal(false);
                    setPhoneError(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {phoneError ? (
                <div className="text-center py-4">
                  <div className="text-red-500 dark:text-red-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm">You need to add a phone number to your profile before creating ads.</p>
                  </div>
                  <button
                    onClick={handleAddPhone}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition"
                  >
                    Go to Profile
                  </button>
                </div>
              ) : (
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
                  
                  {error && (
                    <div className="mt-3 text-red-500 dark:text-red-400 text-xs sm:text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="mt-4 sm:mt-6">
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full px-4 py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </span>
                      ) : "Create Ad"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
