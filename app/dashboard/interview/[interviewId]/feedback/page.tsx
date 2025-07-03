"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState, useCallback } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  ChevronsUpDownIcon,
  Trophy,
  Star,
  TrendingUp,
  Target,
  Brain,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Download,
  Share2,
  RotateCcw,
  Award,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Calendar,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

interface FeedbackData {
  id: number;
  mockIdRef: string;
  question: string;
  correctAnswer: string | null;
  userAnswer: string | null;
  feedback: string | null;
  rating: string | null;
  userEmail: string | null;
  createadAt: string | null; // Note the corrected property name
}
function Feedback({ params }: any) {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const getFeedback = useCallback(async () => {
    try {
      // First, get all records for this interview
      const allResults = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId))
        .orderBy(UserAnswer.id);

      if (allResults.length === 0) {
        setFeedbackList([]);
        return;
      }

      // Group by date to find the most recent session
      const groupedByDate: { [key: string]: FeedbackData[] } = {};

      allResults.forEach((result) => {
        const date = result.createadAt || "unknown";
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(result as FeedbackData);
      });

      // Find the most recent date (assuming DD-MM-YYYY format)
      const dates = Object.keys(groupedByDate).filter(date => date !== "unknown");

      if (dates.length === 0) {
        // If no valid dates, take the most recent by ID
        setFeedbackList(allResults.slice(-5) as FeedbackData[]); // Take last 5 assuming that's the question count
        return;
      }

      // Sort dates to find the most recent (convert DD-MM-YYYY to comparable format)
      const sortedDates = dates.sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('-').map(Number);
        const [dayB, monthB, yearB] = b.split('-').map(Number);

        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);

        return dateB.getTime() - dateA.getTime(); // Most recent first
      });

      const mostRecentDate = sortedDates[0];
      const mostRecentAnswers = groupedByDate[mostRecentDate];

      console.log("=== FEEDBACK FILTERING DEBUG ===");
      console.log("All results count:", allResults.length);
      console.log("Grouped by date:", Object.keys(groupedByDate));
      console.log("Most recent date:", mostRecentDate);
      console.log("Most recent answers count:", mostRecentAnswers.length);

      setFeedbackList(mostRecentAnswers);
    } catch (err) {
      console.log("Error fetching feedback details", err);
    }
  }, [params.interviewId]);

  useEffect(() => {
    getFeedback();
  }, [getFeedback]);
  // if (feedbackList.length < 5) {
  //   toast.error("you have not recorded the answer please record again");
  // }

  let sum: number = 0;
  feedbackList.map((data: FeedbackData) => {
    sum += data.rating ? parseInt(data.rating) : 0;
  });
  const totalRating = feedbackList.length > 0 ? (sum / feedbackList.length) : 0; // Average rating out of 10

  // Helper functions
  const getPerformanceLevel = (rating: number) => {
    if (rating >= 8) return {
      label: "Excellent",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      textColor: "text-green-700",
      icon: Trophy,
      emoji: "🏆"
    };
    if (rating >= 6) return {
      label: "Good",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      textColor: "text-blue-700",
      icon: Star,
      emoji: "⭐"
    };
    if (rating >= 4) return {
      label: "Fair",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50",
      textColor: "text-yellow-700",
      icon: TrendingUp,
      emoji: "📈"
    };
    return {
      label: "Needs Work",
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-50 to-pink-50",
      textColor: "text-red-700",
      icon: Target,
      emoji: "🎯"
    };
  };

  const performance = getPerformanceLevel(totalRating);

  const getQuestionRatingInfo = (rating: string | null) => {
    const numRating = rating ? parseInt(rating) : 0;
    if (numRating >= 8) return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (numRating >= 6) return { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    if (numRating >= 4) return { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    return { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
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
                  Interview Results
                </h1>
                <p className="text-sm text-gray-600">
                  Your performance analysis and feedback
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {feedbackList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 shadow-lg max-w-md mx-auto">
              <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Interview Data Found</h2>
              <p className="text-gray-600 mb-6">It looks like no interview questions were recorded for this session.</p>
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Congratulations Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                Interview Complete
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                🎉 Congratulations!
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                You&apos;ve completed your mock interview. Here&apos;s your detailed performance analysis and personalized feedback.
              </p>
            </motion.div>

            {/* Overall Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className={`bg-gradient-to-r ${performance.bgColor} rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg`}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Score Display */}
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                      <div className={`w-12 h-12 bg-gradient-to-r ${performance.color} rounded-xl flex items-center justify-center`}>
                        <performance.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {totalRating.toFixed(1)}/10
                        </h2>
                        <p className={`text-sm font-medium ${performance.textColor}`}>
                          {performance.label} Performance
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {totalRating >= 8 ? "🎉 Outstanding! You're interview-ready!" :
                       totalRating >= 6 ? "👍 Great job! Minor improvements needed." :
                       totalRating >= 4 ? "📈 Good foundation, keep practicing!" :
                       "💪 Keep going! Practice makes perfect!"}
                    </p>
                  </div>

                  {/* Progress Visualization */}
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="mb-2 flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{Math.round((totalRating / 10) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-4 mb-2">
                      <motion.div
                        className={`h-4 rounded-full bg-gradient-to-r ${performance.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(totalRating / 10) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Performance Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Performance Insights</h3>
                    <p className="text-sm text-gray-600">AI-powered analysis of your interview</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
                  <p className="text-gray-700 leading-relaxed">
                    {totalRating >= 8 ? (
                      "🌟 Outstanding performance! You demonstrated excellent understanding across all areas and communicated your thoughts clearly. You're well-prepared for interviews at this level and show strong technical knowledge."
                    ) : totalRating >= 6 ? (
                      "✅ Good performance! You show solid understanding with room for minor improvements. Focus on the areas highlighted in the detailed feedback below to reach the next level."
                    ) : totalRating >= 4 ? (
                      "📈 Fair performance with good potential! You have a basic understanding but need to work on depth and clarity. Practice explaining concepts more thoroughly and consider reviewing the fundamentals."
                    ) : (
                      "🎯 Keep practicing! Focus on understanding the fundamentals and practice explaining your thought process clearly. Every expert was once a beginner - you're on the right path!"
                    )}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {feedbackList.filter(item => parseInt(item.rating || "0") >= 6).length}
                    </div>
                    <div className="text-sm text-green-700 font-medium">Strong Answers</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">
                      {feedbackList.filter(item => {
                        const rating = parseInt(item.rating || "0");
                        return rating >= 4 && rating < 6;
                      }).length}
                    </div>
                    <div className="text-sm text-yellow-700 font-medium">Fair Answers</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                      {feedbackList.filter(item => parseInt(item.rating || "0") < 4).length}
                    </div>
                    <div className="text-sm text-red-700 font-medium">Needs Work</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Detailed Feedback Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Detailed Question Analysis</h3>
                    <p className="text-sm text-gray-600">Review each question with personalized feedback</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {feedbackList.map((data, index) => {
                    const ratingInfo = getQuestionRatingInfo(data.rating);
                    const RatingIcon = ratingInfo.icon;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Collapsible>
                          <CollapsibleTrigger
                            className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl border border-gray-200 transition-all duration-200 group"
                            onClick={() => toggleExpanded(index)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-3 text-left flex-1">
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                                    Q{index + 1}
                                  </span>
                                  <div className={`p-1 rounded-full ${ratingInfo.bg}`}>
                                    <RatingIcon className={`w-3 h-3 ${ratingInfo.color}`} />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">
                                    {data.question}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className={`text-xs font-medium ${ratingInfo.color}`}>
                                      {data.rating}/10 • {
                                        parseInt(data.rating || "0") >= 8 ? "🌟 Excellent" :
                                        parseInt(data.rating || "0") >= 6 ? "✅ Good" :
                                        parseInt(data.rating || "0") >= 4 ? "⚡ Fair" :
                                        "📚 Needs Work"
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronsUpDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="mt-4 space-y-4">
                              {/* Rating Card */}
                              <div className={`p-4 rounded-xl border ${ratingInfo.border} ${ratingInfo.bg}`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <RatingIcon className={`w-4 h-4 ${ratingInfo.color}`} />
                                  <span className={`font-semibold ${ratingInfo.color}`}>
                                    Score: {data.rating}/10
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {parseInt(data.rating || "0") >= 8 ? "🌟 Excellent work!" :
                                     parseInt(data.rating || "0") >= 6 ? "✅ Well done!" :
                                     parseInt(data.rating || "0") >= 4 ? "⚡ Room for improvement" :
                                     "📚 Keep practicing!"}
                                  </span>
                                </div>
                              </div>

                              {/* Your Answer */}
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="w-4 h-4 text-blue-600" />
                                  <span className="font-semibold text-blue-800">Your Answer</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                  {data.userAnswer || "No answer provided"}
                                </p>
                              </div>

                              {/* Correct Answer */}
                              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold text-green-800">Ideal Answer</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                  {data.correctAnswer}
                                </p>
                              </div>

                              {/* AI Feedback */}
                              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Brain className="w-4 h-4 text-purple-600" />
                                  <span className="font-semibold text-purple-800">AI Feedback & Suggestions</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                  {data.feedback}
                                </p>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>

              <Button
                onClick={() => router.push(`/dashboard/interview/${params.interviewId}`)}
                variant="outline"
                className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-3 font-semibold rounded-xl transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Interview
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default Feedback;
