import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Microphone Icon with AI Brain */}
          <path
            d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
            fill="currentColor"
          />
          <path
            d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H7V12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10H19Z"
            fill="currentColor"
          />
          <path
            d="M12 19V23H8V21H16V23H12V19Z"
            fill="currentColor"
          />
          {/* AI Brain Circuit Pattern */}
          <circle cx="12" cy="8" r="1" fill="rgba(255,255,255,0.8)" />
          <circle cx="10" cy="6" r="0.5" fill="rgba(255,255,255,0.6)" />
          <circle cx="14" cy="6" r="0.5" fill="rgba(255,255,255,0.6)" />
          <path
            d="M10.5 6.5L11.5 7.5M13.5 6.5L12.5 7.5"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          AI Interview Coach
        </span>
        <span className="text-xs text-gray-500 font-medium -mt-1">
          Resume-Powered Practice
        </span>
      </div>
    </div>
  );
}

export default Logo;
