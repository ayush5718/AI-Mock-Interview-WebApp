"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { AiMockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import {
  Lightbulb,
  WebcamIcon,
  Camera,
  Mic,
  Play,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Briefcase,
  Code,
  User,
  Shield,
  Sparkles,
  Target,
  Brain
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
interface Result {
  id: number;
  jsonMockResp: string;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdBy: string;
  createdAt: string;
  mockId: string;
}
function Interview({ params }: any) {
  const route = useRouter();
  const [interviewData, setInterviewData] = useState<Result | null>(null);
  const [webCamEnable, setWebCamEnable] = useState(false);

  const getInterviewDetails = useCallback(async () => {
    // no interview no fetching of data will happen
    if (!params.interviewId) return; //

    // try and catch for error handling
    try {
      const result = await db
        .select()
        .from(AiMockInterview)
        .where(eq(AiMockInterview.mockId, params.interviewId));

      // Log the result and set it in the state
      console.log(result);
      if (result.length > 0) {
        setInterviewData(result[0]);
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
    }
  }, [params.interviewId]);

  useEffect(() => {
    getInterviewDetails();
  }, [getInterviewDetails]);

  function capitalizeFirstLetter(str: string | undefined) {
    if (!str) return ""; // Return an empty string if str is undefined
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const navigateToInterview = () => {
    route.push("/dashboard/interview/" + params.interviewId + "/start");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Interview Setup
                </h1>
                <p className="text-sm text-gray-600">
                  Prepare for your mock interview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">AI Ready</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Let&apos;s Get Started
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Ready for Your Mock Interview?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review your interview details and set up your camera and microphone for the best experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interview Details Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Job Details Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Interview Details</h3>
                  <p className="text-sm text-gray-600">Your personalized mock interview</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Job Role/Position</h4>
                    <p className="text-gray-700">{capitalizeFirstLetter(interviewData?.jobPosition)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                  <Code className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {interviewData?.jobDesc?.includes("Resume-based interview") ? "Interview Type" : "Tech Stack & Skills"}
                    </h4>
                    <p className="text-gray-700">
                      {interviewData?.jobDesc?.includes("Resume-based interview")
                        ? "Resume-based personalized interview with 10 questions"
                        : interviewData?.jobDesc
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                  <User className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Experience Level</h4>
                    <p className="text-gray-700">{interviewData?.jobExperience} years of experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">📋 Important Information</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    {interviewData?.jobDesc?.includes("Resume-based interview")
                      ? (process.env.NEXT_PUBLIC_RESUME_INFORMATION || "Enable your camera and microphone for the best interview experience. This AI-powered mock interview has 10 personalized questions based on your resume. Take your time and speak clearly.")
                      : (process.env.NEXT_PUBLIC_INFORMATION || "Enable your camera and microphone for the best interview experience. This AI-powered mock interview will provide personalized feedback based on your responses. Take your time and speak clearly.")
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Camera Setup Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Camera Preview Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Camera & Audio Setup</h3>
                  <p className="text-sm text-gray-600">Test your equipment before starting</p>
                </div>
              </div>

              {/* Camera Preview */}
              <div className="mb-6">
                {webCamEnable ? (
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden aspect-video">
                    <Webcam
                      onUserMedia={() => setWebCamEnable(true)}
                      onUserMediaError={() => setWebCamEnable(false)}
                      mirrored={true}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs font-medium">Camera Active</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                    <WebcamIcon className="w-16 h-16 text-gray-400 mb-4" />
                    <h4 className="font-medium text-gray-600 mb-2">Camera Preview</h4>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                      Enable your camera to see yourself during the interview
                    </p>
                  </div>
                )}
              </div>

              {/* Setup Controls */}
              <div className="space-y-3">
                {!webCamEnable && (
                  <Button
                    onClick={() => setWebCamEnable(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Camera className="w-4 h-4" />
                      <Mic className="w-4 h-4" />
                      <span>Enable Camera & Microphone</span>
                    </div>
                  </Button>
                )}

                <Button
                  onClick={navigateToInterview}
                  disabled={!webCamEnable}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>Start Interview</span>
                  </div>
                </Button>
              </div>

              {/* Setup Status */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50">
                <div className="flex items-center gap-2">
                  {webCamEnable ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Ready to start!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">Please enable camera first</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Privacy & Security Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">🔒 Privacy & Security</h3>
                  <p className="text-green-700 text-sm leading-relaxed">
                    Your video and audio are processed locally and securely. We never store your recordings permanently.
                    Only your text responses are saved for feedback generation.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Interview;
