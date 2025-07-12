"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Zap, Target, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "../dashboard/_components/Header";

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      title: "Upload Your Resume",
      subtitle: "PDF or text format",
      icon: "📄",
      description: "Upload your resume and our AI analyzes your skills, experience, and projects",
      visual: "role-selection",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "AI Generates 15 Questions",
      subtitle: "Personalized to your background",
      icon: "🤖",
      description: "Get 15 tailored interview questions based on your actual resume content",
      visual: "ai-generation",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "Practice & Record",
      subtitle: "Voice recording with video",
      icon: "🎤",
      description: "Answer questions naturally with voice recording and video preview",
      visual: "recording",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 4,
      title: "Get AI Feedback",
      subtitle: "Instant analysis & ratings",
      icon: "⚡",
      description: "Receive detailed AI feedback with ratings and improvement suggestions",
      visual: "feedback",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 5,
      title: "Track Your Progress",
      subtitle: "Monitor improvement",
      icon: "📈",
      description: "View your interview history and track performance over time",
      visual: "progress",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              How It Works
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 leading-tight">
              AI Interview Coach in
              <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                5 Simple Steps
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto px-4">
              Upload your resume, get personalized questions, practice with AI feedback. Land your dream job faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  Start Practicing Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-blue-500 px-8 py-3 rounded-xl font-semibold transition-all duration-200">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-20`}
              >
                {/* Content Side */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {step.id}
                    </div>
                    <div className="text-4xl">{step.icon}</div>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h2>

                  <p className="text-base sm:text-lg text-blue-600 font-semibold mb-4">
                    {step.subtitle}
                  </p>

                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                    {step.description}
                  </p>
                </div>

                {/* Visual Side */}
                <div className="flex-1 max-w-lg w-full">
                  <StepVisual step={step} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Personalized Questions?
            </h2>

            <p className="text-xl text-blue-100 mb-8">
              Upload your resume and start practicing with AI-generated questions tailored just for you
            </p>

            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200">
                Get Started Free
                <Zap className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Step Visual Component
function StepVisual({ step }: { step: any }) {
  const visuals = {
    "role-selection": <RoleSelectionVisual />,
    "ai-generation": <AIGenerationVisual />,
    "recording": <RecordingVisual />,
    "feedback": <FeedbackVisual />,
    "progress": <ProgressVisual />
  };

  return (
    <div className="relative w-full">
      <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-2xl sm:rounded-3xl blur-xl opacity-20`}></div>
      <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-100">
        {visuals[step.visual as keyof typeof visuals]}
      </div>
    </div>
  );
}

// Individual Visual Components
function RoleSelectionVisual() {
  return (
    <div className="space-y-4">
      {/* Resume Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50"
      >
        <div className="text-4xl mb-2">📄</div>
        <div className="text-sm font-medium text-blue-700 mb-1">Drop your resume here</div>
        <div className="text-xs text-blue-600">PDF or text format</div>
      </motion.div>

      {/* Analysis Preview */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600">AI Analysis Preview:</div>
        {["Skills: React, Node.js, Python", "Experience: 3 years", "Projects: E-commerce, Dashboard"].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 p-2 rounded-lg text-xs"
          >
            ✓ {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AIGenerationVisual() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">🤖</span>
        </div>
        <div className="text-sm font-medium text-purple-700">Generating 15 personalized questions...</div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {Array.from({length: 15}, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              i < 10 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i + 1}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200"
      >
        <div className="text-xs font-medium text-purple-700 mb-2">Sample Question:</div>
        <div className="text-sm text-gray-700">"Tell me about the React project mentioned in your resume..."</div>
      </motion.div>
    </div>
  );
}

function RecordingVisual() {
  return (
    <div className="text-center space-y-6">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
      >
        <div className="w-8 h-8 bg-white rounded-full"></div>
      </motion.div>
      
      <div className="space-y-2">
        {[1, 2, 3, 4].map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: [8, 16, 8] }}
            transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
            className="bg-gradient-to-r from-green-400 to-emerald-400 rounded mx-auto"
            style={{ width: `${20 + i * 10}px` }}
          ></motion.div>
        ))}
      </div>
    </div>
  );
}

function FeedbackVisual() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
        <div className="flex-1 h-2 bg-green-200 rounded"></div>
        <span className="text-sm font-bold text-green-600">8.5/10</span>
      </div>
      
      <div className="space-y-3">
        {["Content Quality", "Delivery", "Confidence"].map((metric, i) => (
          <div key={metric} className="flex items-center gap-3">
            <span className="text-sm font-medium w-20">{metric}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${70 + i * 10}%` }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressVisual() {
  return (
    <div className="space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="text-indigo-500"
            initial={{ strokeDasharray: "0 351.86" }}
            animate={{ strokeDasharray: "263.895 351.86" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-indigo-600">75%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        {["🏆", "⭐", "🎯"].map((emoji, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.2 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl"
          >
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-xs font-medium text-indigo-600">Level {i + 1}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
