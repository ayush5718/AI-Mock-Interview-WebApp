"use client";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Brain,
  Target,
  Zap,
  Star,
  Play,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

function Hero() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full opacity-10 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start lg:items-center">

          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Interview Practice
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Master Your
                </span>
                <br />
                <span className="text-gray-900">
                  Dream Job Interview
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Practice with AI-generated questions, get instant feedback, and boost your confidence.
                <span className="font-semibold text-blue-600"> Land your dream job</span> with personalized interview coaching.
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Brain, text: "AI-Generated Questions", color: "text-blue-600" },
                { icon: Mic, text: "Voice Recording", color: "text-purple-600" },
                { icon: Target, text: "Instant Feedback", color: "text-green-600" },
                { icon: TrendingUp, text: "Performance Tracking", color: "text-orange-600" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Free Forever Badge */}
            <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-green-200/50 shadow-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">100% Free Forever</span>
              <span className="text-gray-400">•</span>
              <Link href="/upgrade" className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors">
                Support Us
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Practicing Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group bg-white/80 backdrop-blur-sm">
                  <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  See How It Works
                </Button>
              </Link>

              {/* <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-blue-400 px-8 py-4 rounded-xl transition-all duration-300">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  See How It Works
                </Button>
              </Link> */}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">1000+ users practicing daily</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main Visual Container */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200">
              {/* Mock Interview Interface */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm font-medium text-gray-500">Mock Interview</div>
                </div>

                {/* Question Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">AI Question</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    "Tell me about a challenging project you worked on and how you overcame obstacles."
                  </p>
                </div>

                {/* Recording Interface */}
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -inset-4 border-2 border-red-300 rounded-full animate-ping"></div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-blue-600">3/5 Questions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-3/5 transition-all duration-500"></div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { label: "Avg Rating", value: "8.5/10", color: "text-green-600" },
                    { label: "Questions", value: "150+", color: "text-blue-600" },
                    { label: "Success Rate", value: "94%", color: "text-purple-600" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                <Zap className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Features Section - Part of the main content flow */}
        <div className="mt-16 lg:mt-20">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-6 lg:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Choose InterviewAI?</h2>
              <p className="text-gray-600">Everything you need to ace your next interview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Smart AI Questions</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Tailored questions based on your role and experience level for realistic practice</p>
              </div>

              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Instant Feedback</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Get detailed analysis and improvement suggestions immediately after each answer</p>
              </div>

              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Monitor your improvement with detailed performance analytics and insights</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">1000+</div>
                <div className="text-xs text-gray-500 font-medium">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">50K+</div>
                <div className="text-xs text-gray-500 font-medium">Questions Asked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">94%</div>
                <div className="text-xs text-gray-500 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
