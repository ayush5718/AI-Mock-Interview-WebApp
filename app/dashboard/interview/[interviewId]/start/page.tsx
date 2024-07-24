"use client";
import { db } from "@/utils/db";
import { AiMockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";

import React, { useEffect, useState } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecAnswerSection from "./_components/RecAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  useEffect(() => {
    getInterviewDetails();
  }, [params.interviewId]);

  const getInterviewDetails = async () => {
    if (!params.interviewId) return;

    try {
      const result = await db
        .select()
        .from(AiMockInterview)
        .where(eq(AiMockInterview.mockId, params.interviewId));

      if (result.length > 0) {
        const jsonQuestions: InterviewQuestion[] = JSON.parse(
          result[0].jsonMockResp
        );
        setInterviewData(result[0]);
        setInterviewQuestions(jsonQuestions);
      }
    } catch (err) {
      console.log("Error fetching details of interview", err);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/*questions */}
        <QuestionSection
          mockInterviewQuestion={interviewQuestions || []}
          activeQuestionIndex={activeQuestionIndex}
        />
        {/*video/audio recording */}

        <RecAnswerSection
          mockInterviewQuestion={interviewQuestions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
        />
      </div>

      <div className="flex justify-end my-10 gap-5">
        {activeQuestionIndex > 0 && (
          <Button onClick={() => setQuestionIndex(activeQuestionIndex - 1)}>
            Previous Question
          </Button>
        )}
        {activeQuestionIndex != 4 && (
          <Button
            variant={"outline"}
            onClick={() => setQuestionIndex(activeQuestionIndex + 1)}
          >
            Next Question
          </Button>
        )}
        {activeQuestionIndex == 4 && (
          <Link
            href={"/dashboard/interview/" + interviewData?.mockId + "/feedback"}
          >
            <Button variant={"destructive"}>End Interview</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default StartInterview;
