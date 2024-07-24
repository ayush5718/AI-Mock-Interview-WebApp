"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { ChevronsUpDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface FeedbackData {
  id: number;
  mockIdRef: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  feedback: string;
  rating: string;
  userEmail: string;
  createdAt: string;
}

function Feedback({ params }: any) {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);

  const getFeedback = async () => {
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId))
        .orderBy(UserAnswer.id);
      setFeedbackList(result as FeedbackData[]);
    } catch (err) {
      console.log("Error fetching feedback details", err);
    }
  };
  useEffect(() => {
    getFeedback();
  }, []);
  // if (feedbackList.length < 5) {
  //   toast.error("you have not recorded the answer please record again");
  // }

  let sum: number = 0;
  feedbackList.map((data: FeedbackData) => {
    sum = sum + parseInt(data.rating);
  });
  const totalRating = sum / 5;

  return (
    feedbackList && (
      <div>
        {feedbackList == 0 ? (
          <h2>No Interview question recored</h2>
        ) : (
          <>
            <h2 className="mt-5 text-3xl font-bold text-green-500">
              Congratulations !
            </h2>
            <h2 className="text-2xl font-bold">
              Here is your Interview feedback
            </h2>
            <h2
              className={`${
                totalRating > 3 ? "text-green-600" : "text-red-600"
              } text-xl mt-10 font-bold`}
            >
              Your overall rating: <strong>{totalRating}/5</strong>
            </h2>
            <h2 className="text-sm text-gray-400">
              Find below interview question with correct answer, your answer and
              feedback for improvement
            </h2>

            <div className="py-5">
              {feedbackList &&
                feedbackList.map((data, index) => (
                  <Collapsible key={index} className=" mt-3">
                    <CollapsibleTrigger className="w-full flex justify-between gap-7 p-4 bg-secondary rounded mt-2 text-left">
                      {data?.question} <ChevronsUpDownIcon />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="flex flex-col gap-2">
                        <h2
                          className={`border text-red-600 rounded-lg p-2 my-4 ${
                            data?.rating > 3 ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          <strong>Rating:</strong>{" "}
                          <span
                            className={`${
                              data.rating > 3
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {data?.rating}/5
                          </span>
                        </h2>
                        <h2
                          className={`border p-5  rounded-lg ${
                            data?.rating > 3
                              ? "text-green-600 bg-green-50"
                              : "text-red-600 bg-red-50"
                          }`}
                        >
                          <strong>Your Answer: </strong>
                          <span> {data?.userAnswer}</span>
                        </h2>
                        <h2 className="border p-5  text-green-500 rounded-lg bg-green-50">
                          <strong>Correct Answer: </strong>
                          {data?.correctAnswer}
                        </h2>

                        <h2 className="text-blue-600 bg-blue-50 p-5 rounded-lg">
                          <strong>Feedback: </strong> {data?.feedback}
                        </h2>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
            </div>
          </>
        )}

        <Button className="mb-2" onClick={() => router.push("/dashboard")}>
          Go Home
        </Button>
      </div>
    )
  );
}

export default Feedback;
