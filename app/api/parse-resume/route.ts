import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Function to send PDF directly to Gemini and get interview questions
async function generateQuestionsFromPDF(buffer: Buffer, jobPosition: string): Promise<string> {
  try {
    console.log('Sending PDF directly to Gemini AI...');

    // Convert buffer to base64
    const base64Data = buffer.toString('base64');

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
    console.log('Response preview:', text.substring(0, 200));

    return text;

  } catch (error) {
    console.error('Error with Gemini PDF analysis:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('=== GEMINI PDF ANALYSIS API CALLED ===');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);

  try {
    console.log('Getting form data...');

    // Get the form data
    const formData = await request.formData();
    console.log('Form data received');

    const file = formData.get('resume') as File;
    const jobPosition = formData.get('jobPosition') as string;

    console.log('File from form data:', file ? 'Found' : 'Not found');
    console.log('Job position:', jobPosition);

    if (!file) {
      console.error('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!jobPosition) {
      console.error('No job position provided');
      return NextResponse.json({ error: 'Job position is required' }, { status: 400 });
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Buffer created, size:', buffer.length);

    // Send PDF directly to Gemini for analysis and question generation
    console.log('Sending PDF to Gemini AI for analysis...');
    const geminiResponse = await generateQuestionsFromPDF(buffer, jobPosition);

    console.log('Gemini analysis completed');

    // Parse the JSON response from Gemini
    const cleanResponse = geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

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
      console.log('Raw response:', geminiResponse);
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
    console.error('Error parsing PDF:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to parse PDF';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        errorMessage = 'Invalid PDF file. Please ensure the file is a valid PDF document.';
      } else if (error.message.includes('password')) {
        errorMessage = 'Password-protected PDFs are not supported.';
      } else if (error.message.includes('encrypted')) {
        errorMessage = 'Encrypted PDFs are not supported.';
      } else {
        errorMessage = `PDF parsing failed: ${error.message}`;
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to extract skills from text
function extractSkills(text: string): string[] {
  const skillKeywords = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    // Frontend
    'React', 'Angular', 'Vue', 'Svelte', 'jQuery', 'Next.js', 'Nuxt.js', 'Gatsby',
    // Backend
    'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails', 'FastAPI',
    // Styling
    'HTML', 'CSS', 'SASS', 'SCSS', 'Bootstrap', 'Tailwind', 'Material-UI',
    // Databases
    'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'SQLite', 'Oracle', 'DynamoDB',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform',
    // Tools
    'Git', 'GitHub', 'GitLab', 'Jira', 'Agile', 'Scrum',
    // Data Science
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas',
    // APIs
    'REST API', 'GraphQL', 'Microservices'
  ];

  const foundSkills = skillKeywords.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });

  return Array.from(new Set(foundSkills));
}

function extractExperience(text: string): any[] {
  const experiences: any[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.match(/\b(developer|engineer|analyst|manager|intern|consultant|specialist)\b/i) ||
        line.match(/\b(software|web|mobile|data|full.?stack|front.?end|back.?end)\b/i)) {
      
      const experience: any = { title: line };
      
      // Look for duration in nearby lines
      for (let j = Math.max(0, i-2); j < Math.min(lines.length, i+3); j++) {
        const nearbyLine = lines[j];
        if (nearbyLine.match(/\b(20\d{2}|19\d{2})\b/) || 
            nearbyLine.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i)) {
          experience.duration = nearbyLine.trim();
          break;
        }
      }
      
      experiences.push(experience);
    }
  }
  
  return experiences.slice(0, 5);
}

function extractEducation(text: string): string[] {
  const education: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.match(/\b(bachelor|master|phd|degree|university|college|institute)\b/i) ||
        line.match(/\b(b\.?s|m\.?s|b\.?a|m\.?a|b\.?tech|m\.?tech)\b/i)) {
      education.push(line.trim());
    }
  }
  
  return education.slice(0, 3);
}

function extractProjects(text: string): string[] {
  const projects: string[] = [];
  const lines = text.split('\n');
  
  let inProjectSection = false;
  let currentProject = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.match(/\b(project|portfolio|github|built|developed|created)\b/i)) {
      if (currentProject) {
        projects.push(currentProject);
      }
      currentProject = trimmedLine;
      inProjectSection = true;
    } else if (inProjectSection && trimmedLine.length > 20) {
      currentProject += ' ' + trimmedLine;
    } else if (trimmedLine.length === 0 && currentProject) {
      projects.push(currentProject);
      currentProject = '';
      inProjectSection = false;
    }
  }
  
  if (currentProject) {
    projects.push(currentProject);
  }
  
  return projects.slice(0, 5);
}

function extractActivities(text: string): string[] {
  const activities: string[] = [];
  const activityKeywords = [
    'volunteer', 'leadership', 'club', 'society', 'organization', 'community',
    'sports', 'music', 'art', 'hackathon', 'conference', 'workshop', 'certification', 'award'
  ];
  
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    for (const keyword of activityKeywords) {
      if (trimmedLine.toLowerCase().includes(keyword) && trimmedLine.length > 10) {
        activities.push(trimmedLine);
        break;
      }
    }
  }
  
  return Array.from(new Set(activities)).slice(0, 5);
}
