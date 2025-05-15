"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dummy user data
const dummyUser = {
  username: "john_doe",
  email: "john.doe@example.com",
  fullName: "John Doe",
  location: "Harare, Zimbabwe",
  phone: "+263 77 123 4567",
  preferredCurrencies: ["USD", "ZWG"],
  joinedDate: "January 2023",
  completedExchanges: 12,
  rating: 4.8
};

export default function Profile() {
  const [user, setUser] = useState(dummyUser);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: dummyUser.fullName,
    location: dummyUser.location,
    phone: dummyUser.phone,
    preferredCurrencies: [...dummyUser.preferredCurrencies],
    username: dummyUser.username,
    email: dummyUser.email,
    bio: "",
    preferredCurrency: dummyUser.preferredCurrencies[0] || "USD"
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (currency) => {
    const currentPreferences = [...formData.preferredCurrencies];
    if (currentPreferences.includes(currency)) {
      setFormData({
        ...formData,
        preferredCurrencies: currentPreferences.filter(c => c !== currency)
      });
    } else {
      setFormData({
        ...formData,
        preferredCurrencies: [...currentPreferences, currency]
      });
    }
  };

  const handleProfilePictureChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      // Here you would typically upload the file to a server
      // For now, we'll just create a local URL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        // In a real app, you would send this to your backend
        console.log("Profile picture selected:", file.name);
        // You could update the user state with the new picture URL
        // setUser({ ...user, profilePicture: event.target.result });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling profile picture change:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update user data
    setUser({
      ...user,
      ...formData
    });
    
    // Show success message
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
    
    // Exit edit mode
    setIsEditing(false);
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
            <Link href="/my-ads" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-1 py-1">
              My Ads
            </Link>
            <Link href="/profile" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 px-1 py-1">
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
              <Link href="/my-ads" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2 py-1 hover:border-l-4 hover:border-indigo-600 dark:hover:border-indigo-400">
                My Ads
              </Link>
              <Link href="/profile" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400 pl-2 py-1">
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
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 font-[var(--font-raleway)]">
            My Profile
          </h2>
          
          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <button 
                  type="button"
                  onClick={() => document.getElementById('profile-picture-input').click()}
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 shadow-md hover:bg-indigo-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input 
                  type="file" 
                  id="profile-picture-input" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Click on the camera icon to change your profile picture
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                  placeholder="Your username"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                  placeholder="Your full name"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                  placeholder="+1 (123) 456-7890"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                  placeholder="City, Country"
                />
              </div>

              {/* Preferred Currency */}
              <div>
                <label htmlFor="preferredCurrency" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Currency
                </label>
                <select
                  id="preferredCurrency"
                  name="preferredCurrency"
                  value={formData.preferredCurrency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="ZWG">ZWG</option>
                  <option value="TZS">TZS</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                placeholder="Tell others a bit about yourself..."
              ></textarea>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.bio.length}/200 characters
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                Save Changes
              </button>
              {saveSuccess && (
                <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm mt-2">
                  Profile updated successfully!
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
