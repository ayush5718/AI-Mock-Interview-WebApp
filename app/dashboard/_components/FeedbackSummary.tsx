"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Award, Target } from "lucide-react";
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
  createadAt: string | null;
}

interface FeedbackSummaryProps {
  interviewId: string;
  jobPosition: string;
  createdAt: string;
}

function FeedbackSummary({ interviewId, jobPosition, createdAt }: FeedbackSummaryProps) {
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [interviewId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, interviewId));
      setFeedbackList(result as FeedbackData[]);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-700">{jobPosition}</h3>
        <p className="text-sm text-gray-500 mt-1">No feedback available</p>
        <p className="text-xs text-gray-400">{createdAt}</p>
      </div>
    );
  }

  // Calculate statistics
  const totalRating = feedbackList.reduce((sum, item) => 
    sum + (item.rating ? parseInt(item.rating) : 0), 0
  ) / feedbackList.length;

  const getPerformanceLevel = (rating: number) => {
    if (rating >= 8) return { label: "Excellent", color: "bg-green-500", textColor: "text-green-700" };
    if (rating >= 6) return { label: "Good", color: "bg-blue-500", textColor: "text-blue-700" };
    if (rating >= 4) return { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-700" };
    return { label: "Needs Work", color: "bg-red-500", textColor: "text-red-700" };
  };

  const performance = getPerformanceLevel(totalRating);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{jobPosition}</h3>
          <p className="text-sm text-gray-500 mt-1">{createdAt}</p>
        </div>
        <Badge variant="outline" className={`${performance.textColor} border-current`}>
          {performance.label}
        </Badge>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{totalRating.toFixed(1)}/10</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600">{feedbackList.length} Questions</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full ${performance.color}`}
          style={{ width: `${(totalRating / 10) * 100}%` }}
        ></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {feedbackList.filter(item => parseInt(item.rating || "0") >= 6).length}
          </div>
          <div className="text-xs text-gray-500">Good+</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">
            {feedbackList.filter(item => {
              const rating = parseInt(item.rating || "0");
              return rating >= 4 && rating < 6;
            }).length}
          </div>
          <div className="text-xs text-gray-500">Fair</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">
            {feedbackList.filter(item => parseInt(item.rating || "0") < 4).length}
          </div>
          <div className="text-xs text-gray-500">Poor</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/dashboard/interview/${interviewId}/feedback`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        <Link href={`/dashboard/interview/${interviewId}`}>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Retake
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default FeedbackSummary;
