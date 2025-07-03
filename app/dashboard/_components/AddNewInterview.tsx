"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
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
import { Loader2, Sparkles, Rocket, Brain, Target, Plus, X } from "lucide-react";
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
  const [jsonResponse, setJsonResponse] = useState<string>("");
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
    console.log("=== FORM DATA ===", formData);

    const inputPrompt = `
Job Role: ${formData.jobPosition}
Job Description: ${formData.jobDescription}
Years of Experience: ${formData.jobExperience}

Based on this information, please generate exactly ${questionCount} interview questions with answers in valid JSON format.

Requirements:
1. Return ONLY a valid JSON array
2. Each object should have "question" and "answer" fields
3. Make sure all strings are properly escaped
4. Do not include any markdown formatting or code blocks
5. Ensure the JSON is complete and properly closed

Example format:
[
  {
    "question": "Your question here",
    "answer": "Your answer here"
  }
]

Generate the questions now:`;

    console.log("=== PROMPT SENT TO GEMINI ===", inputPrompt);

    const result = await chatSession.sendMessage(inputPrompt);
    const mockResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");

    console.log("=== RAW GEMINI RESPONSE ===", mockResp);

    // Better approach: find the first [ and last ] to get the complete JSON array
    const firstBracket = mockResp.indexOf('[');
    const lastBracket = mockResp.lastIndexOf(']');

    let stringResponse = "";
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      stringResponse = mockResp.substring(firstBracket, lastBracket + 1);
      console.log("=== EXTRACTED JSON STRING ===", stringResponse);
      setJsonResponse(stringResponse);

      // Test if the JSON is valid
      try {
        const testParse = JSON.parse(stringResponse);
        console.log("=== PARSED JSON QUESTIONS ===", testParse);
        console.log("=== NUMBER OF QUESTIONS GENERATED ===", testParse.length);

        // Log each question for verification
        testParse.forEach((q: any, index: number) => {
          console.log(`=== QUESTION ${index + 1} ===`, q.question);
          console.log(`=== ANSWER ${index + 1} ===`, q.answer);
        });
      } catch (parseError) {
        console.error("=== JSON PARSE ERROR ===", parseError);
        console.log("=== PROBLEMATIC JSON STRING ===", stringResponse);

        // Try to clean up the JSON and parse again
        try {
          // Remove any trailing incomplete content after the last }
          const cleanedJson = stringResponse.replace(/,\s*$/, '') + ']';
          console.log("=== ATTEMPTING TO CLEAN JSON ===", cleanedJson);
          const cleanedParse = JSON.parse(cleanedJson);
          console.log("=== CLEANED JSON PARSED SUCCESSFULLY ===", cleanedParse);
          stringResponse = cleanedJson; // Use the cleaned version
        } catch (cleanError) {
          console.error("=== CLEANING ALSO FAILED ===", cleanError);
        }
      }
    } else {
      console.error("=== NO VALID JSON BRACKETS FOUND ===");
      console.log("=== FULL RESPONSE FOR DEBUGGING ===", mockResp);
    }

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

    // Additional verification (this is redundant now but keeping for safety)
    if (stringResponse) {
      try {
        const jsonFormat = JSON.parse(stringResponse);
        console.log("=== FINAL VERIFICATION PARSE ===", jsonFormat);
      } catch (error) {
        console.error("=== FINAL VERIFICATION FAILED ===", error);
      }
    } else {
      console.error("=== NO VALID JSON EXTRACTED ===");
    }

    console.log(user?.fullName);

    setLoading(false);
  };
  // console.log(jsonResponse);
  return (
    <div className="w-full">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative group cursor-pointer"
        onClick={() => setOpenDialog(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-white rounded-2xl p-8 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Interview</h3>
            <p className="text-gray-600 text-sm mb-4">Start practicing with AI-generated questions</p>
            <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Let&apos;s Go!</span>
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog open={openDialog}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] rounded-2xl border-0 shadow-2xl overflow-hidden p-0">
          {/* Close Button */}
          <button
            onClick={() => setOpenDialog(false)}
            className="absolute right-3 top-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Compact Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Let&apos;s Set You Up! 🚀</h2>
                <p className="text-blue-100 text-xs sm:text-sm">Quick setup for your perfect interview</p>
              </div>
            </div>
          </div>

          {/* Form Content - Horizontal Layout */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleFormData} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">
                  Just 3 quick details and we&apos;ll create perfect questions for you! ✨
                </p>
              </div>

              {/* Form Fields - Grid Layout for Desktop, Stack for Mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Job Position */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Target className="w-4 h-4 text-blue-600" />
                    Target Role
                  </label>
                  <Input
                    name="jobPosition"
                    placeholder="Frontend Developer"
                    required
                    onChange={handleInputs}
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-xl p-3 text-sm transition-colors"
                  />
                  <p className="text-xs text-gray-500">💡 Be specific!</p>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Rocket className="w-4 h-4 text-green-600" />
                    Experience
                  </label>
                  <Input
                    name="jobExperience"
                    placeholder="2"
                    type="number"
                    required
                    max="50"
                    min="0"
                    onChange={handleInputs}
                    className="border-2 border-gray-200 focus:border-green-500 rounded-xl p-3 text-sm transition-colors"
                  />
                  <p className="text-xs text-gray-500">⚡ Years of exp</p>
                </div>
              </div>

              {/* Tech Stack - Full Width */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Brain className="w-4 h-4 text-purple-600" />
                  Tech Stack & Skills
                </label>
                <Textarea
                  name="jobDescription"
                  placeholder="React, Node.js, Python, AWS, Machine Learning..."
                  required
                  onChange={handleInputs}
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-xl p-3 text-sm transition-colors min-h-[80px] resize-none"
                />
                <p className="text-xs text-gray-500">🔥 List main technologies for this role</p>
              </div>

              {/* Action Buttons - At the bottom after all fields */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {/* Cancel Button */}
                <Button
                  type="button"
                  onClick={() => setOpenDialog(false)}
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 px-6 font-medium transition-colors text-sm"
                >
                  Maybe Later
                </Button>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin w-4 h-4" />
                      <span className="hidden sm:inline">Creating...</span>
                      <span className="sm:hidden">...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Let&apos;s Go!</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
