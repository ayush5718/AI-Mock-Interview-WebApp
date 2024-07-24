"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { AiMockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
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
function Interview({ params }: any) {
  const route = useRouter();
  const [interviewData, setInterviewData] = useState<Result | null>(null);
  const [webCamEnable, setWebCamEnable] = useState(false);

  useEffect(() => {
    getInterviewDetails();
  }, [params]);

  const getInterviewDetails = async () => {
    // no interview no fetching of data will happen
    if (!params.interviewId) return; //

    // try and catch for error handling
    try {
      const result = await db
        .select()
        .from(AiMockInterview)
        .where(eq(AiMockInterview.mockId, params.interviewId));

      // Log the result and set it in the state
      console.log(result);
      if (result.length > 0) {
        setInterviewData(result[0]);
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
    }
  };

  function capitalizeFirstLetter(str: string | undefined) {
    if (!str) return ""; // Return an empty string if str is undefined
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const navigateToInterview = () => {
    route.push("/dashboard/interview/" + params.interviewId + "/start");
  };
  return (
    <div className="my-10 flex justify-center flex-col items-center">
      <h2 className="text-center text-2xl font-bold text-blue-500">
        Let&apos;s Get Started
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col my-5 order-1">
          <div className="flex flex-col rounded-lg border p-5">
            <h2 className="text-lg">
              <strong>Job Role/Position:</strong>
              {capitalizeFirstLetter(interviewData?.jobPosition)}
            </h2>
            <h2 className="text-lg">
              <strong>Job Description/Tech Stack:</strong>
              {interviewData?.jobDesc}
            </h2>
            <h2 className="text-lg">
              <strong>Years of Experience:</strong>
              {interviewData?.jobExperience}
            </h2>
          </div>
          <div className="p-5 border rounded-lg border-yellow-400 bg-yellow-100 my-4">
            <h2 className="flex items-center text-yellow-500">
              <Lightbulb /> <strong>Information</strong>
            </h2>
            <h2>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
          </div>
        </div>
        <div className="flex flex-col  items-end md:order-2">
          {webCamEnable ? (
            <Webcam
              onUserMedia={() => setWebCamEnable(true)}
              onUserMediaError={() => {
                setWebCamEnable(false);
              }}
              mirrored={true}
              style={{
                width: 1000,
                height: 330,
              }}
            />
          ) : (
            <>
              <WebcamIcon className=" my-7 h-72 w-full bg-secondary p-20 rounded-lg border" />
              <Button
                onClick={() => setWebCamEnable(true)}
                variant={"default"}
                className="w-full"
              >
                Enable Web Camera and Microphone
              </Button>
            </>
          )}

          <Button
            className="mt-2 my-6 mx-2 md:w-1/4 w-full"
            variant={"destructive"}
            onClick={navigateToInterview}
          >
            Start Interview
          </Button>
        </div>
      </div>

      {/* <Webcam /> */}
    </div>
  );
}

export default Interview;
