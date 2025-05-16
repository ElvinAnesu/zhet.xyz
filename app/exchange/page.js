"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function Exchange() {
  const [activeTab, setActiveTab] = useState("all");
  const [filteredAds, setFilteredAds] = useState([]);
  const [allAds, setAllAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const { user: authUser } = useAuth();

  // Fetch ads from Supabase
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current time
        const now = new Date().toISOString();
        
        // Fetch active ads that haven't expired
        const { data, error } = await supabase
          .from('exchange_ads')
          .select(`
            *,
            profiles:user_id (
              username,
              phone,
              rating,
              location
            )
          `)
          .eq('status', 'active')
          .gte('expires_at', now)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setAllAds(data || []);
        setFilteredAds(data || []);
      } catch (error) {
        console.error("Error fetching ads:", error);
        setError("Failed to load exchange ads. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAds();
  }, []);

  // Filter ads based on active tab and search query
  useEffect(() => {
    let filtered = allAds;
    
    // Filter by currency tab
    if (activeTab !== "all") {
      filtered = filtered.filter(ad => ad.currency === activeTab || ad.target_currency === activeTab);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ad => 
        (ad.profiles?.username && ad.profiles.username.toLowerCase().includes(query)) || 
        (ad.profiles?.location && ad.profiles.location.toLowerCase().includes(query)) || 
        (ad.description && ad.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredAds(filtered);
  }, [activeTab, searchQuery, allAds]);

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

  // Handle call button click
  const handleCall = (phone) => {
    if (!phone) {
      alert("Phone number not available");
      return;
    }
    
    window.location.href = `tel:${phone}`;
  };

  // Handle WhatsApp button click
  const handleWhatsApp = (phone) => {
    if (!phone) {
      alert("Phone number not available");
      return;
    }
    
    // Format phone number for WhatsApp (remove spaces and special characters)
    const formattedPhone = phone.replace(/\s+/g, "");
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
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

  // Render stars for rating
  const renderStars = (rating) => {
    if (!rating) return 'No ratings';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#halfGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
        
        <span className="ml-1 text-xs">({Number(rating).toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[var(--font-poppins)] overflow-x-hidden">
      {/* Use the Navbar component */}
      <Navbar activePage="exchange" />

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
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-10">
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredAds.length > 0 ? (
                filteredAds.map((ad) => (
                  <div key={ad.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center mb-2 md:mb-0">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-base flex-shrink-0">
                          {ad.profiles?.username ? ad.profiles.username.substring(0, 2).toUpperCase() : "??"}
                        </div>
                        <div className="ml-2 sm:ml-3 min-w-0">
                          <div className="flex items-center flex-wrap">
                            <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-800 dark:text-white mr-2">
                              {ad.profiles?.username || "Anonymous"}
                            </h3>
                            {ad.profiles?.rating && renderStars(ad.profiles.rating)}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ad.profiles?.location || "Unknown location"}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getTimeRemaining(ad.expires_at) === "Expired" ? 
                              <span className="text-red-500 dark:text-red-400">Expired</span> : 
                              `Expires in: ${getTimeRemaining(ad.expires_at)}`}
                          </p>
                        </div>
                        <div className="flex ml-2 sm:ml-4">
                          <button
                            onClick={() => handleCall(ad.profiles?.phone)}
                            className="px-2 sm:px-3 py-1 bg-green-600 text-white text-xs sm:text-sm rounded-l hover:bg-green-700 transition flex items-center"
                            disabled={!ad.profiles?.phone}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </button>
                          <button
                            onClick={() => handleWhatsApp(ad.profiles?.phone)}
                            className="px-2 sm:px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded-r hover:bg-blue-700 transition flex items-center"
                            disabled={!ad.profiles?.phone}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            WhatsApp
                          </button>
                        </div>
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
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No ads found for this currency.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
