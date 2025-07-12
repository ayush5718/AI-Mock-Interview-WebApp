import { Lightbulb, Volume2, VolumeX, Brain, MessageCircle, Sparkles, Play, Pause } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
// Define the props type for the QuestionSection component
// Define the props type for the QuestionSection component
interface QuestionSectionProps {
  mockInterviewQuestion: {
    question: string;
    answer?: string;
    round?: string;
    questionNumber?: number;
  }[];
  activeQuestionIndex: number;
}
// Define the type for a single question
interface Question {
  question: string;
  // Add other fields if needed
}

function QuestionSection({
  mockInterviewQuestion,
  activeQuestionIndex,
}: QuestionSectionProps) {

  const { speak, stop, speaking, supported } = useSpeechSynthesis({
    onEnd: () => {
      console.log("Speech ended");
    },
    onStart: () => {
      console.log("Speech started");
    },
    onError: (error) => {
      console.error("Speech error:", error);
    }
  });

  // Add logging to see what questions are received
  console.log("=== QUESTION SECTION PROPS ===");
  console.log("mockInterviewQuestion:", mockInterviewQuestion);
  console.log("activeQuestionIndex:", activeQuestionIndex);
  console.log("Total questions:", mockInterviewQuestion?.length || 0);

  if (mockInterviewQuestion && mockInterviewQuestion.length > 0) {
    console.log("=== CURRENT ACTIVE QUESTION ===");
    console.log("Question:", mockInterviewQuestion[activeQuestionIndex]?.question);
    console.log("Answer:", mockInterviewQuestion[activeQuestionIndex]?.answer);
  }

  // Determine current round and progress
  const currentQuestion = mockInterviewQuestion?.[activeQuestionIndex];
  const isResumeBasedInterview = mockInterviewQuestion?.some(q => q.round);
  const currentRound = currentQuestion?.round || "General";
  const technicalQuestions = mockInterviewQuestion?.filter(q => q.round === "Technical") || [];
  const hrQuestions = mockInterviewQuestion?.filter(q => q.round === "HR") || [];

  let roundProgress = "";
  if (isResumeBasedInterview) {
    if (currentRound === "Technical") {
      const techIndex = technicalQuestions.findIndex(q => q.question === currentQuestion?.question);
      roundProgress = `Technical Round: ${techIndex + 1} of ${technicalQuestions.length}`;
    } else if (currentRound === "HR") {
      const hrIndex = hrQuestions.findIndex(q => q.question === currentQuestion?.question);
      roundProgress = `HR Round: ${hrIndex + 1} of ${hrQuestions.length}`;
    }
  } else {
    roundProgress = `Question ${activeQuestionIndex + 1} of ${mockInterviewQuestion?.length || 0}`;
  }

  // Stop speech when question changes (no auto-play)
  useEffect(() => {
    // Just stop any ongoing speech when question changes
    stop();
  }, [activeQuestionIndex, stop]);

  const handleSpeakQuestion = () => {
    if (mockInterviewQuestion && mockInterviewQuestion[activeQuestionIndex]?.question) {
      const currentQuestion = mockInterviewQuestion[activeQuestionIndex].question;

      if (speaking) {
        stop();
      } else {
        speak(currentQuestion);
      }
    }
  };

  // Cleanup effect to stop speech on component unmount
  useEffect(() => {
    return () => {
      stop(); // Use our hook's stop function for proper cleanup
      window.speechSynthesis.cancel(); // Additional cleanup
    };
  }, [stop]);

  return (
    mockInterviewQuestion && (
      <div className="space-y-6">
        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={activeQuestionIndex}
          className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg"
        >
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentRound === "Technical"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                  : currentRound === "HR"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : "bg-gradient-to-r from-blue-600 to-purple-600"
              }`}>
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isResumeBasedInterview ? `${currentRound} Round` : "Interview Question"}
                </h3>
                <p className="text-sm text-gray-600">{roundProgress}</p>
              </div>
            </div>

            {/* Round Badge */}
            {isResumeBasedInterview && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentRound === "Technical"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}>
                {currentRound} Round
              </div>
            )}

            {/* Audio Button */}
            <Button
              onClick={handleSpeakQuestion}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 transition-all duration-200 ${
                speaking
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
              disabled={!supported}
              title={speaking ? 'Stop reading' : 'Listen to question'}
            >
              {speaking ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {speaking ? 'Stop' : 'Listen'}
              </span>
            </Button>
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200/50">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-gray-800 text-lg leading-relaxed font-medium">
                  {mockInterviewQuestion[activeQuestionIndex]?.question}
                </p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/50">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">💡 Interview Tips</h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  {process.env.NEXT_PUBLIC_QUESTION_NOTE ||
                   "Take your time to think before answering. Speak clearly and provide specific examples from your experience. Remember, this is practice - focus on improving your communication skills!"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question Progress Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Question Progress
            </h4>
            <span className="text-sm text-gray-600">
              {activeQuestionIndex + 1}/{mockInterviewQuestion.length} completed
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {mockInterviewQuestion.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index <= activeQuestionIndex
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  );
}

export default QuestionSection;
