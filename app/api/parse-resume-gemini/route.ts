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
    
    const prompt = `
    Analyze this resume PDF and generate exactly 15 comprehensive interview questions for a ${jobPosition} position.

    Please analyze the resume content and create:
    
    ROUND 1 - TECHNICAL ROUND (8 questions):
    Generate questions similar to these examples (DO NOT ask users to write code):

    Examples of GOOD technical questions:
    - "Can you explain how you used React.js in your [specific project name]?"
    - "How does JWT work in your authentication system?"
    - "Why did you choose MongoDB over SQL for your projects?"
    - "What is the difference between useState and useEffect in React?"
    - "How would you optimize API calls in a React frontend?"
    - "Can you explain how Socket.io enables real-time communication?"
    - "What happens in the backend when a user registers in your app?"
    - "How do you handle errors in Node.js and Express.js?"
    - "What's the difference between SQL and NoSQL databases?"
    - "In your projects, how did you implement authentication securely?"

    Focus on:
    - Explaining concepts and technologies from their resume
    - How they implemented specific features in their projects
    - Understanding of technologies they've used
    - Problem-solving approaches they've taken
    - NO CODE WRITING QUESTIONS

    ROUND 2 - HR ROUND (7 questions):
    Generate questions similar to these examples:

    Examples of GOOD HR questions:
    - "Tell me about yourself in 2-3 sentences."
    - "Why did you choose web development as your focus area?"
    - "What was the biggest challenge you faced during your internship?"
    - "Where do you see yourself in the next 2 years?"
    - "Why should we hire you for this ${jobPosition} role?"
    - "What motivates you to work in technology?"
    - "How do you stay updated with new technologies?"
    - "Tell me about a project you're most proud of."
    - "How do you handle tight deadlines and pressure?"
    - "What interests you most about this ${jobPosition} position?"

    Focus on:
    - Career motivation and goals
    - Personal experiences and challenges
    - Interest in the role and company
    - Soft skills and personality
    - Short, conversational questions

    Return EXACTLY 15 questions in this JSON format:
    [
      {
        "question": "Your technical question here based on resume content",
        "answer": "Expected answer or key points to look for",
        "round": "Technical",
        "questionNumber": 1
      },
      {
        "question": "Your HR question here based on resume content",
        "answer": "Expected answer or key points to look for",
        "round": "HR", 
        "questionNumber": 1
      }
    ]

    Make sure to:
    1. Reference specific skills, projects, and experiences from the resume
    2. Create realistic scenarios based on their background
    3. Return exactly 8 Technical questions followed by 7 HR questions
    4. Make questions challenging but appropriate for their experience level
    5. Return valid JSON format only
    `;

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
