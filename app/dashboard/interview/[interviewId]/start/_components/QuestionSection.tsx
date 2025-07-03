import { Lightbulb, Volume2, VolumeX, Brain, MessageCircle, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
// Define the props type for the QuestionSection component
// Define the props type for the QuestionSection component
interface QuestionSectionProps {
  mockInterviewQuestion: { question: string; answer?: string }[]; // Updated type to include optional answer field
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
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const textToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const speech = new SpeechSynthesisUtterance(text);
        speech.onend = () => {
          setIsSpeaking(false);
        };
        window.speechSynthesis.speak(speech);
        setIsSpeaking(true);
      }
    } else {
      alert("Sorry, your browser doesn't support text to speech");
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel(); // Cleanup speech synthesis on component unmount
    };
  }, []);

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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Interview Question</h3>
                <p className="text-sm text-gray-600">Question {activeQuestionIndex + 1} of {mockInterviewQuestion.length}</p>
              </div>
            </div>

            {/* Audio Button */}
            <Button
              onClick={() => textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 transition-all duration-200 ${
                isSpeaking
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isSpeaking ? 'Speaking...' : 'Listen'}
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
