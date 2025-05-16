"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ConfirmEmail() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { verifyOtp, resendVerification } = useAuth();

  useEffect(() => {
    // Get email from localStorage if available
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const parsedInfo = JSON.parse(userInfo);
        if (parsedInfo.email) {
          setEmail(parsedInfo.email);
        }
      }
    } catch (err) {
      console.error("Error retrieving email:", err);
    }
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // If pasting multiple characters, only take the first one
      value = value.charAt(0);
    }
    
    // Only allow numbers
    if (value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input if current input is filled
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace - move to previous input if current is empty
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setIsVerifying(false);
      return;
    }

    try {
      // Call the verifyOtp function from AuthContext
      const { success, error } = await verifyOtp(email, otpValue);
      
      if (!success) {
        throw new Error(error || "Invalid OTP. Please try again.");
      }
      
      // Show success message
      setSuccess(true);
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setIsResending(true);
    
    try {
      if (!email) {
        throw new Error("Email address not found. Please go back to sign in.");
      }
      
      // Call the resendVerification function from AuthContext
      const { success, error } = await resendVerification(email);
      
      if (!success) {
        throw new Error(error || "Failed to resend verification code. Please try again.");
      }
      
      // Show success message
      alert("A new verification code has been sent to your email.");
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError(err.message || "Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-[var(--font-raleway)]">
          Zhet
        </h1>
        <h2 className="mt-4 text-center text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
          Verify Your Email
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 text-green-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6">
                Email verified successfully! Redirecting...
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 text-indigo-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">
                We&apos;ve sent a verification code to:
              </p>
              
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-6">
                {email || "your email address"}
              </p>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-md p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 text-red-400 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleVerifyOtp}>
                <div className="mb-6">
                  <label htmlFor="otp-0" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter verification code
                  </label>
                  <div className="flex justify-center space-x-2 sm:space-x-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                      />
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? "Verifying..." : "Verify Email"}
                </button>
              </form>
              
              <p className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Didn&apos;t receive the code?{" "}
                <button 
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
                  onClick={handleResendOtp}
                  disabled={isResending}
                >
                  {isResending ? "Sending..." : "Resend code"}
                </button>
              </p>
              
              <div className="mt-6">
                <Link 
                  href="/auth/signin" 
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

