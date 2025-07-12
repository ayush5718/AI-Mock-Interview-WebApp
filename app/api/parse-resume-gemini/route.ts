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
    
    console.log('Sending PDF to Gemini AI...');

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Create 15 interview questions for ${jobPosition} from this resume:
8 Technical (explain skills/projects from resume, no coding)
7 HR (career goals, teamwork, challenges)
Return JSON: [{"question":"...","answer":"...","round":"Technical","questionNumber":1}]`;

    // Send the PDF and prompt to Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      },
      prompt
    ]);

    const response = result.response;
    const text = response.text();
    
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

    console.log(`Successfully generated ${questions.length} questions`);

    return NextResponse.json({
      success: true,
      questions: questions,
      questionsJson: JSON.stringify(questions),
      metadata: {
        questionCount: questions.length,
        technicalQuestions: questions.filter((q: any) => q.round === 'Technical').length,
        hrQuestions: questions.filter((q: any) => q.round === 'HR').length
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
