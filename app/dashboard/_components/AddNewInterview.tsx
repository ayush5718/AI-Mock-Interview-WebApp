"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { Loader2 } from "lucide-react";
import { AiMockInterview } from "@/utils/schema";
import { db } from "@/utils/db";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";
interface FormState {
  jobPosition: String;
  jobDescription: String;
  jobExperience: Number;
}
interface AiMockInterview {
  id?: number;
  mockId: string;
  jsonMockResp: string;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdBy: string;
  createdAt: string;
}

function AddNewInterview() {
  const questionCount = process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT;
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { isSignedIn, user, isLoaded } = useUser();
  const route = useRouter();
  const [formData, setFormData] = useState<FormState>({
    jobPosition: "",
    jobDescription: "",
    jobExperience: 0,
  });
  const handleInputs = (e: any) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormData = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    console.log(formData);
    const inputPrompt =
      "job role:" +
      formData.jobPosition +
      "job Description:" +
      formData.jobDescription +
      "years of experience: " +
      formData.jobExperience +
      "depends on this information please give me " +
      questionCount +
      " interview question with answered in JSON format. Give question and answered as filed in jSON";

    const result = await chatSession.sendMessage(inputPrompt);
    const mockResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");

    // Use regex to extract the JSON part
    const jsonMatch = mockResp.match(/\[([\s\S]*?)\]/);
    const stringResponse = jsonMatch[0];
    setJsonResponse(stringResponse);

    if (stringResponse) {
      const resp = await db
        .insert(AiMockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: stringResponse,
          jobPosition: formData.jobPosition,
          jobDesc: formData.jobDescription,
          jobExperience: formData.jobExperience.toString(),
          createdBy: user?.primaryEmailAddress?.emailAddress || "",
          createdAt: moment().format("DD-MM-yyyy"),
        } as AiMockInterview)
        .returning({ mockId: AiMockInterview.mockId });

      console.log("inserted mock id", resp);
      if (resp) {
        setOpenDialog(false);
        route.push("/dashboard/interview/" + resp[0].mockId);
      }
    } else {
      console.log("ERROr not inserted some erroor");
    }

    if (jsonMatch) {
      try {
        const jsonFormat = JSON.parse(jsonMatch[0]);
        console.log(jsonFormat);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    } else {
      console.error("No valid JSON found in the response");
    }

    console.log(user?.fullName);

    setLoading(false);
  };
  // console.log(jsonResponse);
  return (
    <div>
      <div
        className="font-bold border rounded p-10 shadow-md bg-secondary text-center hover:scale-105 transition-all mt-6 "
        onClick={() => setOpenDialog(true)}
      >
        + Add New
      </div>

      <Dialog open={openDialog}>
        {/* <DialogTrigger>Open</DialogTrigger> */}
        <DialogContent className="md:max-w-2xl max-w-80 rounded-lg md:h-7/8  overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job Interview
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={handleFormData}>
                <h2>
                  Add details about your interview like job descrption
                  position/role and years of experience.
                </h2>

                <div className="mt-6">
                  <label>Job role/position</label>
                  <Input
                    name="jobPosition"
                    placeholder="Ex: Full-stack Developer"
                    required
                    onChange={handleInputs}
                  />
                </div>
                <div className="mt-2">
                  <label>Job Descrption/Tech stack in short</label>
                  <Textarea
                    name="jobDescription"
                    placeholder="React, Mysql, Angular etc..."
                    required
                    onChange={handleInputs}
                  />
                </div>
                <div className="mt-2">
                  <label>Years of Experience</label>
                  <Input
                    name="jobExperience"
                    placeholder="Ex: 2"
                    type="number"
                    required
                    max="50"
                    onChange={handleInputs}
                  />
                </div>
                <div className="flex gap-4 mt-5 justify-end">
                  <Button type="button" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={"destructive"}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" /> Generating
                        Interview
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
