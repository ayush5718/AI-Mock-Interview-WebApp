"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function InterviewItemCard({ interviews }: any) {
  const router = useRouter();
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
  return (
    <div className="w-full h-full p-5 h-32 bg-secondary rounded-lg">
      <h2 className="text-blue-700 text-lg">
        <strong> {uppercase}</strong>
      </h2>

      <h2 className="text-gray-500 text-sm">
        {interviews?.jobExperience} Years of Experience
      </h2>
      <h2 className="text-gray-500 text-xs">
        Created At: {interviews?.createdAt}
      </h2>
      <div className="flex my-4 justify-between items-center">
        <Button size={"sm"} variant={"outline"} onClick={onFeedback}>
          Feedback
        </Button>
        <Button className="bg-blue-600" size={"sm"} onClick={onStart}>
          Start
        </Button>
      </div>
    </div>
  );
}

export default InterviewItemCard;
