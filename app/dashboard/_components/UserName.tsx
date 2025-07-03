"use client";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { motion } from "framer-motion";

function UserName() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌅";
    if (hour < 17) return "☀️";
    return "🌙";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
        <span className="text-gray-900">{getGreeting()}, </span>
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {user?.firstName || user?.fullName || "Champion"}
        </span>
        <span className="ml-1 sm:ml-2">{getEmoji()}</span>
      </h1>
    </motion.div>
  );
}

export default UserName;
