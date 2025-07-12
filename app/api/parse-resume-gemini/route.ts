import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  console.log('=== GEMINI PDF ANALYSIS API CALLED ===');
  
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const jobPosition = formData.get('jobPosition') as string;
    
    console.log('File:', file ? file.name : 'Not found');
    console.log('Job position:', jobPosition);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!jobPosition) {
      return NextResponse.json({ error: 'Job position is required' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Convert file to buffer and then to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    
    console.log('📄 PDF Details:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type
    });
    console.log('🚀 Sending PDF to Gemini AI for resume analysis...');

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an expert interviewer. Carefully analyze this resume PDF and create exactly 15 personalized interview questions for a ${jobPosition} position.

IMPORTANT: Read the resume content thoroughly and create questions that specifically reference:
- Exact project names mentioned in the resume
- Specific technologies and programming languages used
- Company names and job titles from work experience
- Educational background and achievements
- Skills and certifications listed

TECHNICAL QUESTIONS (8 questions):
Create questions like:
- "I see you worked on [specific project name from resume]. Can you explain how you implemented [specific technology]?"
- "Your resume mentions experience with [specific technology]. How did you use it in [specific project]?"
- "Tell me about the [specific project] you built. What challenges did you face?"
- "I notice you used [specific tech stack] in your projects. Why did you choose this combination?"

HR QUESTIONS (7 questions):
Create questions like:
- "I see you worked at [specific company]. What was your biggest achievement there?"
- "Your resume shows you studied [specific field]. What motivated you to pursue this?"
- "Tell me about your experience with [specific activity/project mentioned]."
- "How did you balance [specific activities mentioned] with your studies/work?"

CRITICAL REQUIREMENTS:
1. Questions MUST reference specific details from the resume
2. Use actual project names, company names, technologies mentioned
3. Make questions conversational and specific to their background
4. DO NOT create generic questions
5. Return exactly 8 Technical + 7 HR questions

Return ONLY this JSON format:
[
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "Technical", "questionNumber": 1},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "Technical", "questionNumber": 2},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "Technical", "questionNumber": 3},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "Technical", "questionNumber": 4},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "Technical", "questionNumber": 5},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "Technical", "questionNumber": 6},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "Technical", "questionNumber": 7},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "Technical", "questionNumber": 8},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "HR", "questionNumber": 1},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "HR", "questionNumber": 2},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "HR", "questionNumber": 3},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "HR", "questionNumber": 4},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "HR", "questionNumber": 5},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "HR", "questionNumber": 6},
  {"question": "Specific question referencing resume content", "answer": "Expected answer focusing on their experience", "round": "HR", "questionNumber": 7}
]`;

    // Send the PDF and prompt to Gemini with retry logic
    let result;
    let text;

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} - Sending to Gemini...`);

        result = await model.generateContent([
          {
            inlineData: {
              data: base64Data,
              mimeType: "application/pdf"
            }
          },
          prompt
        ]);

        const response = result.response;
        text = response.text();

        console.log('Gemini response received successfully');
        break; // Success, exit retry loop

      } catch (retryError: any) {
        console.error(`Attempt ${attempt} failed:`, retryError);

        if (attempt === maxRetries) {
          // Last attempt failed, throw the error
          throw retryError;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log('Gemini response received');
    console.log('Response length:', text.length);

    // Parse the JSON response from Gemini
    const cleanResponse = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let questions;
    try {
      // Try to find JSON in the response
      const jsonStart = cleanResponse.indexOf('[');
      const jsonEnd = cleanResponse.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = cleanResponse.substring(jsonStart, jsonEnd + 1);
        questions = JSON.parse(jsonString);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', text);
      throw new Error('Failed to parse interview questions from AI response');
    }

    if (!questions || questions.length < 10) {
      throw new Error(`Expected at least 10 questions, got ${questions?.length || 0}`);
    }

    const technicalCount = questions.filter((q: any) => q.round === 'Technical').length;
    const hrCount = questions.filter((q: any) => q.round === 'HR').length;

    console.log(`🎉 Successfully generated ${questions.length} resume-based questions:`);
    console.log(`   📋 Technical Questions: ${technicalCount}`);
    console.log(`   👥 HR Questions: ${hrCount}`);
    console.log(`   📄 Based on resume: ${file.name}`);

    return NextResponse.json({
      success: true,
      questions: questions,
      questionsJson: JSON.stringify(questions),
      metadata: {
        questionCount: questions.length,
        technicalQuestions: technicalCount,
        hrQuestions: hrCount,
        resumeAnalyzed: true,
        fileName: file.name
      }
    });

  } catch (error) {
    console.error('Error in Gemini PDF analysis:', error);
    
    let errorMessage = 'Failed to analyze PDF with AI';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error';
      } else if (error.message.includes('quota')) {
        errorMessage = 'AI service quota exceeded';
      } else {
        errorMessage = `AI analysis failed: ${error.message}`;
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
