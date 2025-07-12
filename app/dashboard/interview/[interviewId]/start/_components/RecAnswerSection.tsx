"use client";
import { Button } from "@/components/ui/button";
import { index } from "drizzle-orm/mysql-core";
import Image from "next/image";
import React, { useEffect, useState, useReducer } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { chatSession } from "@/utils/GeminiAIModal";
import { UserAnswer } from "@/utils/schema";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

// Define types for reducer state and actions
// Define a type for the speech result
interface SpeechResult {
  transcript: string;
}

interface State {
  userRecordedAnswer: string;
  results: SpeechResult[];
}

interface RecAnswerSectionProps {
  mockInterviewQuestion: {
    question: string;
    answer: string;
    round?: string;
    questionNumber?: number;
  }[];
  activeQuestionIndex: number;
  interviewData: { mockId: string };
  mobileMode?: boolean;
}

type Action =
  | { type: "ADD_TRANSCRIPT"; payload: string }
  | { type: "RESET" }
  | { type: "SET_RESULTS"; payload: SpeechResult[] };

// Reducer function to handle state updates
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TRANSCRIPT":
      return {
        ...state,
        userRecordedAnswer: state.userRecordedAnswer + action.payload,
      };
    case "RESET":
      return { ...state, userRecordedAnswer: "" };
    case "SET_RESULTS":
      return { ...state, results: action.payload };
    default:
      return state;
  }
};

function RecAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  mobileMode = false,
}: RecAnswerSectionProps) {
  const initialState: State = { userRecordedAnswer: "", results: [] };
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useUser();

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  // Handle speech-to-text results
  useEffect(() => {
    if (results) {
      results.forEach((result: any) => {
        // Ensure `result` is typed correctly and handle as needed
        if (typeof result === "object" && "transcript" in result) {
          dispatch({ type: "ADD_TRANSCRIPT", payload: result.transcript });
        } else if (typeof result === "string") {
          dispatch({ type: "ADD_TRANSCRIPT", payload: result });
        }
      });
    }
  }, [results]);

  // Update user answer in DB if recording has stopped and there is enough recorded data
  useEffect(() => {
    const updateUserAnswerInDb = async () => {
      const currentQuestion = mockInterviewQuestion[activeQuestionIndex];
      const questionRound = currentQuestion?.round || "General";

      const feedbackPrompt = `
        You are an experienced and empathetic interviewer evaluating a candidate's response. Focus on CONTENT and UNDERSTANDING rather than grammar or speech patterns.

        Question Type: ${questionRound} Round Question
        Question: ${currentQuestion?.question}
        Candidate's Answer: ${state.userRecordedAnswer}
        Expected Answer: ${currentQuestion?.answer}

        ROUND-SPECIFIC EVALUATION FOR ${questionRound.toUpperCase()} ROUND:
        ${questionRound === "Technical" ? `
        - Technical accuracy and understanding of concepts
        - Problem-solving approach and methodology
        - Knowledge of relevant technologies/tools
        - Ability to explain technical concepts
        - Practical experience and implementation details
        ` : questionRound === "HR" ? `
        - Communication skills and clarity of thought
        - Self-awareness and reflection
        - Cultural fit and motivation
        - Leadership and teamwork examples
        - Career goals and growth mindset
        ` : `
        - Overall understanding of the topic
        - Relevant experience and examples
        - Clear communication of ideas
        - Problem-solving approach
        `}

        EVALUATION CRITERIA:
        1. Does the candidate demonstrate understanding of the core concepts?
        2. Are the key points covered, even if not perfectly articulated?
        3. Is the answer relevant to the question asked?
        4. Consider that this might be from speech-to-text, so ignore minor grammar issues, repetitions, or incomplete sentences.
        5. Be encouraging and constructive - this is a learning experience.

        RATING SCALE (1-10) - BE GENEROUS AND ENCOURAGING:
        - 9-10: Exceptional understanding, comprehensive answer with excellent depth
        - 7-8: Very good understanding, covers most key points well (DEFAULT for good answers)
        - 5-6: Good understanding, covers basic concepts adequately
        - 3-4: Fair understanding, shows some knowledge but has gaps
        - 1-2: Poor understanding, answer is mostly irrelevant or incorrect

        RATING GUIDELINES - BE VERY LENIENT AND ENCOURAGING:
        - **DEFAULT to 8-9 for answers that show ANY understanding or effort**
        - **Give 7-8 even for basic attempts that show some knowledge**
        - **COMPLETELY IGNORE speech-to-text errors, grammar mistakes, incomplete sentences**
        - **Give credit for ANY relevant knowledge, experience, or attempt to answer**
        - **Be extremely generous - this is practice, not a real interview**
        - **Give credit for practical examples, personal experiences, or project mentions**
        - **Focus on encouragement and building confidence**
        - **Rate based ONLY on CONTENT and UNDERSTANDING, never on articulation**
        - **If they mention any relevant technology or concept, give at least 7/10**
        - **Only give below 6 if the answer is completely off-topic or empty**

        Please provide a JSON response with two fields:
        - "rating": A number from 1 to 10 based on CONTENT UNDERSTANDING (be very encouraging - default to 8-9 for any reasonable attempt)
        - "feedback": Positive, encouraging feedback (2-3 sentences) that:
          * Starts with what they did well or got right
          * Provides one specific, actionable suggestion for improvement
          * Ends with encouragement and confidence building
          * Uses supportive language like "Great job mentioning...", "You're on the right track...", "Keep it up!"

        Remember: This is practice - focus on building confidence and encouraging learning, not perfect answers.
        `;

      console.log("=== FEEDBACK PROMPT SENT ===", feedbackPrompt);

      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "")
        .trim();

      console.log("=== RAW FEEDBACK RESPONSE ===", mockJsonResp);

      try {
        const parsedJson = JSON.parse(mockJsonResp);
        console.log("=== PARSED FEEDBACK ===", parsedJson);
        console.log("=== RATING GIVEN ===", parsedJson?.rating);
        console.log("=== FEEDBACK TEXT ===", parsedJson?.feedback);

        // Ensure rating is within valid range (1-10)
        let finalRating = parsedJson?.rating || 5; // Default to middle rating
        if (finalRating < 1) finalRating = 1;
        if (finalRating > 10) finalRating = 10;

        const resp = await db.insert(UserAnswer).values({
          mockIdRef: interviewData?.mockId,
          question: mockInterviewQuestion[activeQuestionIndex]?.question,
          correctAnswer: mockInterviewQuestion[activeQuestionIndex]?.answer,
          userAnswer: state.userRecordedAnswer,
          feedback: parsedJson?.feedback || "Good effort! Keep practicing to improve your interview skills.",
          rating: finalRating.toString(),
          userEmail: user?.primaryEmailAddress?.emailAddress,
          createadAt: moment().format("DD-MM-yyyy"),
        });
        if (resp) {
          toast.success("User answer recorded successfully");
          dispatch({ type: "RESET" });
          setResults([]); // Reset the speech recognition results
        } else {
          toast.error("Try again answer not recorded successfully");
        }
      } catch (error) {
        console.error("=== FAILED TO PARSE FEEDBACK JSON ===", error);
        console.log("=== PROBLEMATIC FEEDBACK RESPONSE ===", mockJsonResp);

        // Fallback: Save with default values if JSON parsing fails
        const resp = await db.insert(UserAnswer).values({
          mockIdRef: interviewData?.mockId,
          question: mockInterviewQuestion[activeQuestionIndex]?.question,
          correctAnswer: mockInterviewQuestion[activeQuestionIndex]?.answer,
          userAnswer: state.userRecordedAnswer,
          feedback: "Your answer has been recorded. Keep practicing to improve your interview skills!",
          rating: "5", // Default neutral rating out of 10
          userEmail: user?.primaryEmailAddress?.emailAddress,
          createadAt: moment().format("DD-MM-yyyy"),
        });
        if (resp) {
          toast.success("User answer recorded successfully");
          dispatch({ type: "RESET" });
          setResults([]); // Reset the speech recognition results
        }
      }
    };

    if (!isRecording && state.userRecordedAnswer.length > 10) {
      updateUserAnswerInDb();
    }
  }, [
    isRecording,
    state.userRecordedAnswer,
    mockInterviewQuestion,
    activeQuestionIndex,
    interviewData,
    setResults,
    user,
  ]);

  // Error handling for speech recognition
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Speech Recognition Error
        </h3>
        <p className="text-red-700 mb-4">
          {error}
        </p>
        <div className="bg-white rounded-lg p-4 text-left">
          <h4 className="font-medium text-gray-900 mb-2">Try:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Refreshing the page</li>
            <li>• Using Google Chrome</li>
            <li>• Checking microphone permissions</li>
          </ul>
        </div>
      </div>
    );
  }

  const startsStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  // Mobile Mode - Simplified Layout
  if (mobileMode) {
    return (
      <div className="space-y-1">
        {/* Recording Status - Compact */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
              isRecording
                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}>
              {isRecording ? (
                <Square className="w-2.5 h-2.5 text-white" />
              ) : (
                <Mic className="w-2.5 h-2.5 text-white" />
              )}
            </div>
            <span className="text-xs font-medium text-gray-900">
              {isRecording ? 'Recording...' : 'Ready'}
            </span>
          </div>
          {isRecording && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-red-500 rounded-full"
            />
          )}
        </div>

        {/* Recording Button - Compact and Prominent */}
        <Button
          onClick={startsStopRecording}
          disabled={false}
          className={`w-full py-3 text-sm font-semibold transition-all duration-200 ${
            isRecording
              ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              <span>Start Recording</span>
            </>
          )}
        </Button>

        {/* Live Transcript - Compact */}
        {(isRecording || state.userRecordedAnswer || results.length > 0) && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                {isRecording ? 'Live Transcript' : 'Your Answer'}
              </span>
            </div>
            <div className="text-xs text-gray-700 max-h-16 overflow-y-auto">
              {isRecording ? (
                <div>
                  {interimResult || "Start speaking to see live transcript..."}
                </div>
              ) : (
                <div>
                  {state.userRecordedAnswer || "No answer recorded yet."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Mode - Full Layout
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Video Preview Section - Shows first on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg order-1 lg:order-2"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Video Preview</h3>
            <p className="text-sm text-gray-600">Practice your body language and presentation</p>
          </div>
        </div>

        {/* Webcam Container */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden aspect-video">
          <Image
            src="/webcam.png"
            width={200}
            height={200}
            alt="webcam frame"
            className="absolute inset-0 w-full h-full object-cover opacity-20 z-10"
          />
          <Webcam
            mirrored={true}
            className="absolute inset-0 w-full h-full object-cover z-20"
          />

          {/* Recording Indicator Overlay */}
          {isRecording && (
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-2 h-2 bg-white rounded-full"
              />
              <span className="text-xs font-medium">REC</span>
            </div>
          )}
        </div>

        {/* Video Tips */}
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200/50">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-700 text-xs leading-relaxed">
                <strong>Pro Tips:</strong> Maintain eye contact with the camera, sit up straight, and ensure good lighting.
                Your body language is as important as your verbal response!
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recording Controls Card - Shows second on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg order-2 lg:order-1"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isRecording
                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}>
              {isRecording ? (
                <Square className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isRecording ? 'Recording in Progress' : 'Ready to Record'}
              </h3>
              <p className="text-sm text-gray-600">
                {isRecording ? 'Speak clearly and take your time' : 'Click to start recording your answer'}
              </p>
            </div>
          </div>

          {isRecording && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={startsStopRecording}
            disabled={false}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold transition-all duration-200 ${
              isRecording
                ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </>
            )}
          </Button>

          {(state.userRecordedAnswer || results.length > 0) && !isRecording && (
            <Button
              onClick={() => {
                dispatch({ type: "RESET" });
                setResults([]);
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>

        {/* Enhanced Live Transcript */}
        {(isRecording || state.userRecordedAnswer || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {isRecording ? 'Live Transcript' : 'Your Answer'}
              </span>
              {error && (
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                  Error: {error}
                </span>
              )}
            </div>
            <div className="text-gray-700 text-sm leading-relaxed">
              {isRecording ? (
                <div>
                  <div className="font-medium text-gray-900">
                    {interimResult || "Start speaking to see live transcript..."}
                  </div>
                </div>
              ) : (
                <div>
                  {state.userRecordedAnswer || "No answer recorded yet."}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>


    </div>
  );
}

export default RecAnswerSection;
