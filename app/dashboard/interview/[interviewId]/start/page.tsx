"use client";
import { db } from "@/utils/db";
import { AiMockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";

import React, { useEffect, useState, useCallback } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecAnswerSection from "./_components/RecAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  Target,
  Brain,
  CheckCircle,
  Circle,
  ArrowLeft
} from "lucide-react";

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

interface InterviewQuestion {
  question: string;
  answer: string;
}

interface StartInterviewProps {
  params: {
    interviewId: string;
  };
}

function StartInterview({ params }: StartInterviewProps) {
  const [interviewData, setInterviewData] = useState<Result | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<
    InterviewQuestion[]
  >([]);
  const [activeQuestionIndex, setQuestionIndex] = useState<number>(0);
  const [startTime] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const getInterviewDetails = useCallback(async () => {
    if (!params.interviewId) return;

    try {
      const result = await db
        .select()
        .from(AiMockInterview)
        .where(eq(AiMockInterview.mockId, params.interviewId));

      console.log("=== DATABASE RESULT ===", result);

      if (result.length > 0) {
        console.log("=== RAW JSON FROM DATABASE ===", result[0].jsonMockResp);

        try {
          const jsonQuestions: InterviewQuestion[] = JSON.parse(
            result[0].jsonMockResp
          );
          console.log("=== SUCCESSFULLY PARSED QUESTIONS ===", jsonQuestions);
          console.log("=== TOTAL QUESTIONS COUNT ===", jsonQuestions.length);

          // Log each question individually
          jsonQuestions.forEach((q, index) => {
            console.log(`=== QUESTION ${index + 1} ===`, q.question);
            console.log(`=== ANSWER ${index + 1} ===`, q.answer);
          });

          setInterviewData(result[0]);
          setInterviewQuestions(jsonQuestions);
        } catch (parseError) {
          console.error("=== JSON PARSE ERROR IN START PAGE ===", parseError);
          console.log("=== PROBLEMATIC JSON STRING ===", result[0].jsonMockResp);
        }
      } else {
        console.log("=== NO INTERVIEW DATA FOUND FOR ID ===", params.interviewId);
      }
    } catch (err) {
      console.error("=== DATABASE ERROR ===", err);
    }
  }, [params.interviewId]);

  useEffect(() => {
    getInterviewDetails();
  }, [getInterviewDetails]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = () => {
    const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalQuestions = interviewQuestions.length;
  const progress = totalQuestions > 0 ? ((activeQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-16 lg:top-0 z-40"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button & Title */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Mock Interview
                </h1>
                <p className="text-sm text-gray-600">
                  {interviewData?.jobPosition} • {interviewData?.jobExperience} years
                </p>
              </div>
            </div>

            {/* Timer & Progress */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{getElapsedTime()}</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {activeQuestionIndex + 1}/{totalQuestions}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-6">
        {/* Mobile Layout - Single Screen */}
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-gray-200/50 shadow-lg  flex flex-col"
          >
            {/* Question Section - Compact */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{activeQuestionIndex + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Question {activeQuestionIndex + 1}</h3>
                  <p className="text-xs text-gray-600">{interviewQuestions.length} total questions</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-2">
                <p className="text-gray-800 text-sm leading-relaxed font-medium">
                  {interviewQuestions[activeQuestionIndex]?.question}
                </p>
              </div>
            </div>

            {/* Video Preview - Small Box */}
            <div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden aspect-video  mb-3">
                <Webcam
                  mirrored={true}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Recording Indicator */}
                {/* Add recording indicator here if needed */}
              </div>
            </div>

            {/* Recording Controls - Bottom */}
            <div>
              <RecAnswerSection
                mockInterviewQuestion={interviewQuestions}
                activeQuestionIndex={activeQuestionIndex}
                interviewData={interviewData || { mockId: "" }}
                mobileMode={true}
              />
            </div>
          </motion.div>
        </div>

        {/* Desktop Layout - Full Information */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          {/* Question Section - Shows first on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="order-1 lg:order-1"
          >
            <QuestionSection
              mockInterviewQuestion={interviewQuestions || []}
              activeQuestionIndex={activeQuestionIndex}
            />
          </motion.div>

          {/* Recording Section - Shows second on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="order-2 lg:order-2"
          >
            <RecAnswerSection
              mockInterviewQuestion={interviewQuestions}
              activeQuestionIndex={activeQuestionIndex}
              interviewData={interviewData || { mockId: "" }}
              mobileMode={false}
            />
          </motion.div>
        </div>

        {/* Navigation Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Question Navigation Pills */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {interviewQuestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                      activeQuestionIndex === index
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {activeQuestionIndex > 0 && (
                  <Button
                    onClick={() => setQuestionIndex(activeQuestionIndex - 1)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                )}

                {activeQuestionIndex < totalQuestions - 1 ? (
                  <Button
                    onClick={() => setQuestionIndex(activeQuestionIndex + 1)}
                    size="sm"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Link href={`/dashboard/interview/${interviewData?.mockId}/feedback`}>
                    <Button
                      size="sm"
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Finish Interview</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default StartInterview;
