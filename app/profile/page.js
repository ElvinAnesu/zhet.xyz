"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    country: "Zimbabwe",
    phone: "",
    preferredCurrencies: [],
    username: "",
    email: "",
    bio: "",
    preferredCurrency: "USD"
  });
  
  const router = useRouter();
  const { user: authUser, signOut, sessionChecked } = useAuth();

  // Add state for phone confirmation dialog
  const [showPhoneConfirmation, setShowPhoneConfirmation] = useState(false);
  const [pendingCountryChange, setPendingCountryChange] = useState(null);

  // Add a function to format the phone number with the correct country code
  const formatPhoneWithCountryCode = (phone, country) => {
    // Remove any non-digit characters except +
    const digitsOnly = phone.replace(/[^\d+]/g, '');
    
    // Get the appropriate country code
    const countryCode = country === 'Tanzania' ? '+255' : '+263';
    
    // If the number already starts with the country code, return it as is
    if (digitsOnly.startsWith(countryCode)) {
      return digitsOnly;
    }
    
    // If the number starts with + but not the correct country code, replace it
    if (digitsOnly.startsWith('+')) {
      return countryCode + digitsOnly.substring(digitsOnly.indexOf('+') + 1);
    }
    
    // If the number starts with 0, replace the 0 with the country code
    if (digitsOnly.startsWith('0')) {
      return countryCode + digitsOnly.substring(1);
    }
    
    // Otherwise, prepend the country code
    return countryCode + digitsOnly;
  };

  // Fetch user profile data and avatar
  useEffect(() => {
    async function fetchUserProfile() {
      if (!authUser) {
        // Don't redirect immediately, wait for session check to complete
        if (sessionChecked) {
          router.push('/auth/signin');
        }
        return;
      }

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Extract country from location if it exists
          let country = "Zimbabwe"; // Default
          
          if (data.location) {
            if (data.location === "Tanzania" || data.location === "Zimbabwe") {
              country = data.location;
            } else {
              // Try to extract country from "City, Country" format
              const locationParts = data.location.split(', ');
              if (locationParts.length >= 2) {
                const lastPart = locationParts[locationParts.length - 1];
                if (lastPart === "Tanzania" || lastPart === "Zimbabwe") {
                  country = lastPart;
                }
              }
            }
          }
          
          // Format the phone number with the correct country code
          const formattedPhone = data.phone ? formatPhoneWithCountryCode(data.phone, country) : "";
          
          setUser(data);
          setFormData({
            fullName: data.full_name || "",
            country: country,
            phone: formattedPhone,
            preferredCurrencies: data.preferred_currencies || [],
            username: data.username || "",
            email: data.email || "",
            bio: data.bio || "",
            preferredCurrency: data.preferred_currencies?.[0] || "USD"
          });
          
          // Fetch avatar if exists
          if (data.avatar_url) {
            downloadAvatar(data.avatar_url);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [authUser, router, sessionChecked]);

  const downloadAvatar = async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);
        
      if (error) {
        throw error;
      }
      
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.error('Error downloading avatar:', error);
    }
  };

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

  // Update the handleInputChange function to handle country changes with confirmation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'country') {
      // When country changes, check if there's an existing phone number
      if (formData.phone && formData.phone.trim() !== '') {
        // Get current country code
        const currentCountryCode = formData.country === 'Tanzania' ? '+255' : '+263';
        const newCountryCode = value === 'Tanzania' ? '+255' : '+263';
        
        // If phone number starts with current country code, show confirmation
        if (formData.phone.startsWith(currentCountryCode) && currentCountryCode !== newCountryCode) {
          setShowPhoneConfirmation(true);
          setPendingCountryChange(value);
          return;
        }
      }
      
      // No phone number or already using the new country code, proceed with change
      const formattedPhone = formData.phone ? formatPhoneWithCountryCode(formData.phone, value) : "";
      setFormData({
        ...formData,
        [name]: value,
        phone: formattedPhone
      });
    } else if (name === 'phone') {
      // Format the phone number as the user types
      const formattedPhone = formatPhoneWithCountryCode(value, formData.country);
      setFormData({
        ...formData,
        [name]: formattedPhone
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Add function to handle country change confirmation
  const handleCountryChangeConfirm = () => {
    // User confirmed country change, clear phone number
    setFormData({
      ...formData,
      country: pendingCountryChange,
      phone: ""
    });
    setShowPhoneConfirmation(false);
    setPendingCountryChange(null);
  };

  // Add function to handle country change cancellation
  const handleCountryChangeCancel = () => {
    setShowPhoneConfirmation(false);
    setPendingCountryChange(null);
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

  const handleProfilePictureChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      setUploadingAvatar(true);
      setSaveError("");
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${authUser.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: filePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setUser({
        ...user,
        avatar_url: filePath
      });
      
      // Download and display the new avatar
      downloadAvatar(filePath);
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      if (error.message?.includes("row-level security") || error.message?.includes("Unauthorized")) {
        setSaveError("Permission denied. Please contact support to enable profile picture uploads.");
      } else {
        setSaveError("Failed to upload profile picture. Please try again.");
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError("");
    
    try {
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.fullName,
          phone: formData.phone,
          location: formData.country,
          bio: formData.bio,
          preferred_currencies: formData.preferredCurrencies.length > 0 ? 
            formData.preferredCurrencies : [formData.preferredCurrency],
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);
      
      if (error) {
        throw error;
      }
      
      // Update local user state
      setUser({
        ...user,
        username: formData.username,
        full_name: formData.fullName,
        phone: formData.phone,
        location: formData.country,
        bio: formData.bio,
        preferred_currencies: formData.preferredCurrencies.length > 0 ? 
          formData.preferredCurrencies : [formData.preferredCurrency]
      });
      
      // Show success message
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError(error.message || "Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Add a function to render stars based on rating
  const renderStars = (rating) => {
    if (!rating) return 'No ratings yet';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
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
          <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 dark:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {/* Numeric rating */}
        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[var(--font-poppins)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[var(--font-poppins)] overflow-x-hidden">
      {/* Use the Navbar component */}
      <Navbar activePage="profile" />

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
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300 overflow-hidden">
                  {avatarUrl ? (
                    <Image 
                      src={avatarUrl} 
                      alt="Profile" 
                      width={112} 
                      height={112} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    formData.username ? formData.username.substring(0, 2).toUpperCase() : ""
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => document.getElementById('profile-picture-input').click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 shadow-md hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <input 
                  type="file" 
                  id="profile-picture-input" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={uploadingAvatar}
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

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs sm:text-sm cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
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
                  placeholder={formData.country === "Tanzania" ? "+255 XXX XXX XXX" : "+263 XX XXX XXXX"}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.country === "Tanzania" ? "Format: +255" : "Format: +263"}
                </p>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                >
                  <option value="Zimbabwe">Zimbabwe</option>
                  <option value="Tanzania">Tanzania</option>
                </select>
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
                value={formData.bio || ""}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-xs sm:text-sm"
                placeholder="Tell others a bit about yourself..."
                maxLength={200}
              ></textarea>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(formData.bio || "").length}/200 characters
              </p>
            </div>

            {/* User Stats (Read Only) */}
            {user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-700/30 p-3 rounded-md">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                  {renderStars(user.rating)}
                </div>
              </div>
            )}

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
              {saveError && (
                <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-2">
                  {saveError}
                </p>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Confirmation Dialog */}
      {showPhoneConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Change Country?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Changing your country will remove your current phone number. Do you want to continue?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCountryChangeCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCountryChangeConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm"
              >
                Change Country
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
