"use client";
import { db } from "@/utils/db";
import { AiMockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import InterviewItemCard from "./InterviewItemCard";
interface Interview {
  id: number;
  jsonMockResp: string;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdBy: string;
  createdAt: string;
  mockId: string;
}
function InterviewList() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [interviewNumber, setinterviewNumber] = useState(0);
  const fetchPreviousInterview = async () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      try {
        const result = await db
          .select()
          .from(AiMockInterview)
          .where(
            eq(AiMockInterview.createdBy, user.primaryEmailAddress.emailAddress)
          )
          .orderBy(desc(AiMockInterview.id));
        setInterviews(result);
        console.log(result);
      } catch (error) {
        console.error("Error fetching previous interviews:", error);
      }
    } else {
      console.error("User email address is not available");
    }
  };

  useEffect(() => {
    fetchPreviousInterview();
  }, [user]);
  return (
    <div>
      <div className="font-bold text-2xl ">Previous Interview List</div>
      <h2 className="text-gray-500 ">
        You can see your past interview details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {interviews &&
          interviews.map((data, index) => (
            <InterviewItemCard key={data?.id} interviews={data} />
          ))}
      </div>
    </div>
  );
}

export default InterviewList;
