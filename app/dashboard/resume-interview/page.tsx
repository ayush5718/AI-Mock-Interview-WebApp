"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ResumeUpload from "../_components/ResumeUpload";

function ResumeInterviewPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Page Title */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              Resume-Based Interview
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
              AI-Powered Resume Interview
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your resume and get 15 personalized interview questions tailored to your skills, projects, and experience
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-full text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-full text-sm">
                <FileText className="w-4 h-4 text-green-600" />
                <span>PDF Support</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-full text-sm">
                <span className="w-4 h-4 text-purple-600 font-bold">15</span>
                <span>Personalized Questions</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resume Upload Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <ResumeUpload />
        </motion.div>

      </div>
    </div>
  );
}

export default ResumeInterviewPage;
