"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/utils/db";
import { AiMockInterview, UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import { Trash2, Play, BarChart3, Calendar, Briefcase, Clock, Star, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InterviewItemCardProps {
  interviews: any;
  onDelete?: () => void; // Callback to refresh the list after deletion
  viewMode?: string; // grid or list view mode
}

function InterviewItemCard({ interviews, onDelete, viewMode = "grid" }: InterviewItemCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  function capitalizeFirstLetter(str: string | undefined) {
    if (!str) return ""; // Return an empty string if str is undefined
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const uppercase = capitalizeFirstLetter(interviews?.jobPosition);

  const onStart = () => {
    router.push("/dashboard/interview/" + interviews?.mockId);
  };

  const onFeedback = () => {
    router.push("/dashboard/interview/" + interviews?.mockId + "/feedback");
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);

    try {
      console.log("=== DELETING INTERVIEW ===", interviews?.mockId);

      // First, delete all user answers associated with this interview
      await db
        .delete(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, interviews?.mockId));

      console.log("=== DELETED USER ANSWERS ===");

      // Then, delete the interview itself
      await db
        .delete(AiMockInterview)
        .where(eq(AiMockInterview.mockId, interviews?.mockId));

      console.log("=== DELETED INTERVIEW ===");

      toast.success("Interview deleted successfully!");

      // Call the callback to refresh the list
      if (onDelete) {
        onDelete();
      }

    } catch (error) {
      console.error("=== ERROR DELETING INTERVIEW ===", error);
      toast.error("Failed to delete interview. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
  if (viewMode === "list") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 relative group"
        >
          {/* Delete button for list view */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-3 right-3 h-8 w-8 p-0 bg-gray-100 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                disabled={isDeleting}
                title="Delete Interview"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600">🗑️ Delete Interview</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Are you sure you want to delete the interview for <strong>"{uppercase}"</strong>?
                  <br />
                  <br />
                  This will permanently delete:
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>The interview questions and setup</li>
                    <li>All your recorded answers</li>
                    <li>Your feedback and ratings</li>
                  </ul>
                  <br />
                  <span className="text-red-500 font-medium">This action cannot be undone.</span>
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Interview
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center justify-between pr-12">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{uppercase}</h3>
              </div>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{interviews?.jobDesc}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{interviews?.jobExperience} years</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{interviews?.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Button
                size="sm"
                variant="outline"
                onClick={onFeedback}
                className="border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors rounded-xl"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Feedback
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                size="sm"
                onClick={onStart}
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  // Grid view (default)
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group relative bg-white rounded-2xl border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 relative">
          {/* Delete button */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white border-0"
                disabled={isDeleting}
                title="Delete Interview"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Interview
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete <strong>"{uppercase}"</strong>?
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-2">This will permanently delete:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li>• Interview questions & setup</li>
                    <li>• All recorded answers</li>
                    <li>• Feedback & ratings</li>
                  </ul>
                </div>
                <p className="text-red-500 font-medium text-sm mt-3">⚠️ This action cannot be undone.</p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Keep It
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </div>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Header Content */}
        <div className="text-white">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-white/80" />
            <h3 className="font-bold text-lg truncate pr-8">{uppercase}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{interviews?.jobExperience}y exp</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{interviews?.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Tech Stack */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {interviews?.jobDesc}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onFeedback}
            className="flex-1 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors rounded-xl"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Feedback</span>
            <span className="sm:hidden">📊</span>
          </Button>
          <Button
            onClick={onStart}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Play className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Start</span>
            <span className="sm:hidden">▶️</span>
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>Ready to practice</span>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}

export default InterviewItemCard;
