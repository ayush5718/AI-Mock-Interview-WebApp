"use client";

import React from "react";
import { motion } from "framer-motion";
import AddNewInterview from "./_components/AddNewInterview";
import UserName from "./_components/UserName";
import InterviewList from "./_components/InterviewList";
import { Sparkles, Plus, History, TrendingUp, Target } from "lucide-react";

function Dashboard() {

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
            Ready to level up your interview game? 🚀 Let&apos;s create some magic together!
          </p>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Left Column - Create Interview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg h-fit">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-2">
                  Start New Interview
                </h2>
                <p className="text-sm text-gray-600">
                  Create a personalized mock interview in seconds ⚡
                </p>
              </div>

              <AddNewInterview />

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500">AI-Powered</p>
                    <p className="text-sm font-semibold text-gray-900">Questions</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-500">Instant</p>
                    <p className="text-sm font-semibold text-gray-900">Feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Interview History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                    Interview History
                  </h2>
                  <p className="text-sm text-gray-600">
                    Track your progress and review past interviews
                  </p>
                </div>
              </div>

              <InterviewList />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
