"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Loader2,
  Brain,
  Sparkles,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { AiMockInterview } from "@/utils/schema";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

interface ResumeUploadProps {
  onClose?: () => void;
}

function ResumeUpload({ onClose }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [showTextInput, setShowTextInput] = useState(false); // Default to PDF upload
  const [resumeText, setResumeText] = useState("");
  const [pdfPreview, setPdfPreview] = useState<string>("");
  const [isValidatingPdf, setIsValidatingPdf] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFile = droppedFiles.find(file => file.type === "application/pdf");
    
    if (pdfFile) {
      if (pdfFile.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      setFile(pdfFile);
      toast.success("Resume uploaded successfully!");

      // Validate and preview PDF content
      validateAndPreviewPDF(pdfFile);
    } else {
      toast.error("Please upload a PDF file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      setFile(selectedFile);
      toast.success("Resume uploaded successfully!");

      // Validate and preview PDF content
      validateAndPreviewPDF(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPdfPreview("");
  };

  const validateAndPreviewPDF = async (file: File) => {
    setIsValidatingPdf(true);
    try {
      // Enhanced validation with PDF content check
      const preview = [];
      preview.push(`✅ PDF File: ${file.name}`);
      preview.push(`📄 Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);

      // Quick check for PDF compatibility
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const pdfContent = textDecoder.decode(uint8Array.slice(0, Math.min(2000, uint8Array.length)));

        // Look for text indicators in PDF
        const hasTextContent = pdfContent.includes('/Text') || pdfContent.includes('BT') || pdfContent.includes('ET');

        if (hasTextContent) {
          preview.push(`🤖 Compatible with AI analysis`);
          preview.push(`📝 Will generate personalized questions based on resume content`);
          toast.success("PDF ready for AI analysis!");
        } else {
          preview.push(`⚠️ PDF might be image-based or scanned`);
          preview.push(`🔄 AI will create questions based on job position if analysis fails`);
          toast.warning("PDF might be image-based. AI will try to analyze it, but may fall back to generic questions.");
        }
      } catch (contentError) {
        preview.push(`🤖 Ready for AI analysis`);
        preview.push(`📝 Will generate questions based on resume content or job position`);
        toast.success("PDF ready for AI analysis!");
      }

      setPdfPreview(preview.join('\n'));

    } catch (error) {
      console.error('PDF validation failed:', error);
      const preview = [];
      preview.push(`⚠️ PDF validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      preview.push(`🔄 Will create questions based on job position instead`);
      setPdfPreview(preview.join('\n'));
      toast.warning("PDF validation failed. Will create interview questions based on your job position.");
    } finally {
      setIsValidatingPdf(false);
    }
  };

  const generateQuestionsFromPDF = async (file: File, jobPosition: string): Promise<string> => {
    try {
      console.log('Starting Gemini PDF analysis for:', file.name);

      // Validate file
      if (!file.type.includes('pdf')) {
        throw new Error('File must be a PDF');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Create FormData to send file to server
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobPosition', jobPosition);

      console.log('Sending PDF to Gemini AI for analysis...');

      // Send to Gemini API
      const response = await fetch('/api/parse-resume-gemini', {
        method: 'POST',
        body: formData,
      });

      console.log('Gemini response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(errorData.error || `Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Gemini analysis successful:', result);

      if (!result.success) {
        throw new Error(result.error || 'Gemini analysis failed');
      }

      return result.questionsJson;

    } catch (error) {
      console.error('Error with Gemini PDF analysis:', error);

      // Re-throw with more specific error message
      if (error instanceof Error) {
        throw new Error(`Gemini PDF analysis failed: ${error.message}`);
      } else {
        throw new Error('Gemini PDF analysis failed: Unknown error occurred');
      }
    }
  };

  const parseResumeText = async (text: string): Promise<any> => {
    try {
      const { extractResumeData } = await import('@/utils/pdfParser');
      return extractResumeData(text);
    } catch (error) {
      console.error('Error parsing resume text:', error);
      return {
        personalInfo: {},
        skills: [],
        experience: [],
        education: [],
        projects: [],
        activities: []
      };
    }
  };

  const generateResumeBasedQuestions = async (resumeData: any, position: string) => {
    // Create a comprehensive prompt that works with any amount of resume data
    const hasSkills = resumeData.skills?.length > 0;
    const hasExperience = resumeData.experience?.length > 0;
    const hasProjects = resumeData.projects?.length > 0;
    const hasEducation = resumeData.education?.length > 0;
    const hasActivities = resumeData.activities?.length > 0;

    const inputPrompt = `Create 15 ${position} interview questions:
Skills: ${hasSkills ? resumeData.skills.slice(0, 3).join(', ') : 'General skills'}
8 Technical, 7 HR questions
JSON: [{"question":"...","answer":"...","round":"Technical","questionNumber":1}]`;

    try {
      const result = await chatSession.sendMessage(inputPrompt);
      const response = result.response.text().replace("```json", "").replace("```", "");
      const firstBracket = response.indexOf('[');
      const lastBracket = response.lastIndexOf(']');

      if (firstBracket !== -1 && lastBracket !== -1) {
        const jsonString = response.substring(firstBracket, lastBracket + 1);
        const questions = JSON.parse(jsonString);

        if (questions.length >= 10) {
          return jsonString;
        } else {
          throw new Error(`Expected at least 10 questions, got ${questions.length}`);
        }
      } else {
        throw new Error("Invalid JSON format in response");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  };

  const handleStartInterview = async () => {
    if (!jobPosition.trim()) {
      toast.error("Please enter the job position");
      return;
    }

    if (!file && !resumeText.trim()) {
      toast.error("Please upload your resume or enter resume details");
      return;
    }

    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error("Please sign in to continue");
      return;
    }

    setIsProcessing(true);

    try {
      let resumeData;
      let questionsJson;

      if (resumeText.trim()) {
        // Use text input - generate questions from text
        toast.info("Analyzing your resume details...");
        resumeData = await parseResumeText(resumeText);
        toast.success("Resume text analyzed successfully!");

        // Generate questions using the existing method
        toast.info("Generating personalized interview questions...");
        questionsJson = await generateResumeBasedQuestions(resumeData, jobPosition);

      } else if (file) {
        // Use PDF file - send directly to Gemini
        try {
          toast.info("Sending PDF to AI for analysis and question generation...", { duration: 5000 });

          // Generate questions directly from PDF using Gemini
          questionsJson = await generateQuestionsFromPDF(file, jobPosition);

          toast.success("PDF analyzed successfully! Generated personalized questions based on your resume.");
          console.log("Questions generated from PDF");

        } catch (pdfError) {
          console.error("PDF analysis failed:", pdfError);

          // Show user-friendly error message
          const errorMessage = pdfError instanceof Error ? pdfError.message : 'Unknown error';

          if (errorMessage.includes('overloaded') || errorMessage.includes('503')) {
            toast.error("AI service is temporarily busy");
            toast.info("💡 Tip: Try using the 'Enter Text Instead' option for faster results!");

            // Auto-suggest text input
            setTimeout(() => {
              toast.info("Click 'Enter Text Instead' button above to continue", { duration: 8000 });
            }, 2000);

            setIsProcessing(false);
            return; // Don't proceed with fallback, let user choose text input

          } else if (errorMessage.includes('string did not match the expected pattern')) {
            toast.error("PDF format not supported by AI analysis");
            toast.info("Don't worry! Creating interview questions based on your job position instead...");
          } else if (errorMessage.includes('file format')) {
            toast.error("PDF file format issue detected");
            toast.info("Generating interview questions for your role instead...");
          } else {
            toast.error("PDF analysis temporarily unavailable");
            toast.info("Creating interview based on job position instead...");
          }

          // Fallback to position-based questions
          resumeData = {
            personalInfo: {},
            skills: [],
            experience: [],
            education: [],
            projects: [],
            activities: []
          };

          // Generate questions using fallback method
          questionsJson = await generateResumeBasedQuestions(resumeData, jobPosition);
        }
      } else {
        // No input provided - use position-based questions
        resumeData = {
          personalInfo: {},
          skills: [],
          experience: [],
          education: [],
          projects: [],
          activities: []
        };

        // Generate questions using fallback method
        toast.info("Generating interview questions based on job position...");
        questionsJson = await generateResumeBasedQuestions(resumeData, jobPosition);
      }
      
      const mockId = uuidv4();
      const result = await db.insert(AiMockInterview).values({
        mockId: mockId,
        jsonMockResp: questionsJson,
        jobPosition: jobPosition,
        jobDesc: `Resume-based interview for ${jobPosition} role - Technical & HR Rounds`,
        jobExperience: "15 questions (8 Technical + 7 HR)",
        createdBy: user.primaryEmailAddress.emailAddress,
        createdAt: moment().format("DD-MM-yyyy"),
      });

      if (result) {
        toast.success("Interview created successfully! 🎉");
        router.push(`/dashboard/interview/${mockId}`);
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("Failed to create interview. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">AI Resume Analysis</h2>
                <p className="text-blue-100 text-xs sm:text-sm">Upload your resume to generate personalized interview questions</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-white hover:bg-white/20 p-1 sm:p-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-medium text-gray-700">
              Job Position *
            </Label>
            <Input
              id="position"
              placeholder="e.g., Frontend Developer, Data Scientist, Product Manager..."
              value={jobPosition}
              onChange={(e) => setJobPosition(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Label className="text-sm font-medium text-gray-700">
                How would you like to provide your resume?
              </Label>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant={!showTextInput ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTextInput(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm w-full sm:w-auto"
                >
                  📄 Upload PDF Resume
                </Button>
                <Button
                  type="button"
                  variant={showTextInput ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTextInput(true)}
                  className="bg-gray-500 hover:bg-gray-600 text-xs sm:text-sm w-full sm:w-auto"
                >
                  ✏️ Enter Text Instead
                </Button>
              </div>
            </div>

            {!showTextInput ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Upload Your Resume (PDF)
                </Label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-8 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : file
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {file ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                        <div className="text-center sm:text-left">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">{file.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-red-500 hover:text-red-700 p-1 sm:p-2"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Resume uploaded successfully!</span>
                      </div>

                      {/* PDF Preview */}
                      {(pdfPreview || isValidatingPdf) && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {isValidatingPdf ? "Validating PDF..." : "Content Preview:"}
                          </h4>
                          {isValidatingPdf ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Analyzing PDF content...</span>
                            </div>
                          ) : (
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-20 overflow-y-auto">
                              {pdfPreview}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Drop your resume here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          AI will analyze your resume and create personalized questions
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          💡 Supports PDF files up to 10MB (text-based PDFs work best)
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/test-pdf');
                              const result = await response.json();
                              if (result.success) {
                                toast.success("PDF parsing service is working!");
                              } else {
                                toast.error("PDF parsing service issue: " + result.error);
                              }
                            } catch (error) {
                              toast.error("Failed to test PDF service");
                            }
                          }}
                          className="text-xs mt-2"
                        >
                          Test PDF Service
                        </Button>
                      </div>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="resume-upload"
                      />
                      <Label
                        htmlFor="resume-upload"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Enter Your Resume Content
                </Label>
                <Textarea
                  placeholder="Paste your resume content here (skills, experience, projects, education)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full min-h-[200px] resize-none"
                  rows={8}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    💡 Include your skills, experience, projects, education, and activities
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setResumeText(`SKILLS: JavaScript, React, Node.js, Python, MongoDB, AWS, Git, Docker

EXPERIENCE:
• Senior Software Developer at TechCorp (2022-2024) - Led development of microservices architecture, improved system performance by 40%
• Full Stack Developer at InnovateLab (2020-2022) - Built scalable web applications serving 100K+ users
• Frontend Developer Intern at StartupXYZ (2019-2020) - Developed responsive UI components

PROJECTS:
• E-commerce Platform - Built full-stack application with React, Node.js, MongoDB, and Stripe integration. Implemented real-time inventory management and order tracking.
• Social Media Dashboard - Created analytics dashboard using React, D3.js, and REST APIs. Features include data visualization and automated reporting.
• Task Management System - Developed collaborative project management tool with real-time updates using Socket.io and Express.js.

EDUCATION:
• Bachelor's in Computer Science, University of Technology (2016-2020) - GPA: 3.8/4.0

ACTIVITIES:
• Led university coding club with 50+ members, organized weekly workshops
• Participated in 5 hackathons, won 2nd place in TechHack 2023
• Volunteer coding instructor for underprivileged students`)}
                    className="text-xs"
                  >
                    Use Demo Data
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              What You Will Get
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>15 personalized questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>2 rounds (Technical + HR)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Project-based questions</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span>{showTextInput ? 'Text-based analysis' : 'PDF resume analysis'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartInterview}
              disabled={(!file && !resumeText.trim()) || !jobPosition.trim() || isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">Processing</span>
                </>
              ) : (
                <>
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="hidden sm:inline">Start Interview</span>
                  <span className="sm:hidden">Start</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;
