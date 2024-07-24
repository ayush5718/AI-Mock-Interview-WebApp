"use client";
import { Button } from "@/components/ui/button";
import { index } from "drizzle-orm/mysql-core";
import Image from "next/image";
import React, { useEffect, useState, useReducer } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic } from "lucide-react";
import { toast } from "sonner";
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
  mockInterviewQuestion: { question: string; answer: string }[]; // Adjust as needed
  activeQuestionIndex: number;
  interviewData: { mockId: string };
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
      results.forEach((result) => {
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
      const feedbackPrompt = `
        Question: ${mockInterviewQuestion[activeQuestionIndex].question}
        Answer: ${state.userRecordedAnswer}
        Please provide a JSON response with two fields: "rating" and "feedback". 
        - "rating": A number from 1 to 5 indicating the quality of the answer honestly.
        - "feedback": A short text (3 to 5 lines) providing feedback and areas for improvement.
        Ensure the response is in valid JSON format.
        `;

      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "")
        .trim();

      try {
        const parsedJson = JSON.parse(mockJsonResp);
        console.log(parsedJson);
        const resp = await db.insert(UserAnswer).values({
          mockIdRef: interviewData?.mockId,
          question: mockInterviewQuestion[activeQuestionIndex]?.question,
          correctAnswer: mockInterviewQuestion[activeQuestionIndex]?.answer,
          userAnswer: state.userRecordedAnswer,
          feedback: parsedJson?.feedback,
          rating: parsedJson?.rating,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          createadAt: moment().format("DD-MM-yyyy"),
        });
        if (resp) {
          toast.success("User answer recorded successfully");
          dispatch({ type: "RESET" });
        } else {
          toast.error("Try again answer not recorded successfully");
        }
        setResults([]);
      } catch (error) {
        console.error("Failed to parse JSON response:", error);
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

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  const startsStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center bg-gray-200 h-full">
        <Image
          src={"/webcam.png"}
          width={200}
          height={200}
          alt="webcam"
          className="absolute"
        />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>

      <div className="flex justify-center flex-col gap-5">
        <Button
          className="mt-5"
          variant={`${isRecording ? "destructive" : "default"}`}
          onClick={startsStopRecording}
        >
          {isRecording ? (
            <>
              <h2 className="flex items-center justify-center">
                <Mic />
                Recording...
              </h2>
            </>
          ) : (
            "Record Answer"
          )}
        </Button>
      </div>
    </div>
  );
}

export default RecAnswerSection;
