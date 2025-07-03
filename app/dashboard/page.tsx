"use client";

import React from "react";
import { motion } from "framer-motion";
import AddNewInterview from "./_components/AddNewInterview";
import UserName from "./_components/UserName";
import InterviewList from "./_components/InterviewList";
import { Sparkles, Target, TrendingUp, Zap, Star } from "lucide-react";

function Dashboard() {
  const quickStats = [
    {
      icon: Target,
      label: "Practice Sessions",
      value: "12",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      icon: TrendingUp,
      label: "Avg Score",
      value: "8.5/10",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      icon: Zap,
      label: "Streak",
      value: "5 days",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      icon: Star,
      label: "Level",
      value: "Pro",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Your Dashboard
          </div>

          <UserName />

          <p className="text-base sm:text-lg text-gray-600 mt-4 max-w-2xl mx-auto px-4">
            Ready to level up your interview game? 🚀 Let's create some magic together!
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className={`${stat.bgColor} p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${stat.textColor} leading-tight`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium leading-tight">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Create New Interview Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 sm:mb-12"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-2 px-4">
              Start Your Next Interview
            </h2>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Create a personalized mock interview in seconds ⚡
            </p>
          </div>

          <div className="max-w-md mx-auto px-4">
            <AddNewInterview />
          </div>
        </motion.div>

        {/* Interview History */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <InterviewList />
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
