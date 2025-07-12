import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export interface ResumeData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
  skills: string[];
  experience: Array<{
    title: string;
    duration?: string;
  }>;
  education: string[];
  projects: string[];
  activities: string[];
}

export async function parsePDFResume(file: File): Promise<ResumeData> {
  try {
    console.log('Starting PDF parsing for file:', file.name, 'Size:', file.size);

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('Array buffer created, size:', arrayBuffer.byteLength);

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true,
      verbosity: 0 // Reduce console noise
    });

    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);

    let fullText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${pdf.numPages}`);

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Extract text items and join them
        const pageText = textContent.items
          .map((item: any) => {
            // Handle different types of text items
            if (item && typeof item === 'object') {
              if ('str' in item) {
                return item.str;
              } else if ('chars' in item) {
                return item.chars;
              }
            }
            return '';
          })
          .filter((text: string) => text && text.trim().length > 0)
          .join(' ');

        if (pageText.trim()) {
          fullText += pageText + '\n';
          console.log(`Page ${pageNum} extracted ${pageText.length} characters`);
        }

      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    console.log('Total extracted text length:', fullText.length);

    if (!fullText.trim()) {
      throw new Error('No readable text content found in PDF. The PDF might be image-based or corrupted.');
    }

    // Parse the extracted text
    const resumeData = extractResumeData(fullText);
    console.log('Resume data extracted:', resumeData);

    return resumeData;

  } catch (error) {
    console.error('PDF parsing error:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Invalid PDF file. Please ensure the file is a valid PDF document.');
      } else if (error.message.includes('password')) {
        throw new Error('Password-protected PDFs are not supported. Please upload an unprotected PDF.');
      } else if (error.message.includes('No readable text')) {
        throw new Error('This PDF appears to be image-based. Please upload a text-based PDF or use the text input option.');
      }
    }

    throw new Error('Failed to parse PDF. Please try the text input option instead.');
  }
}

export function extractResumeData(text: string): ResumeData {
  const resumeData: ResumeData = {
    personalInfo: extractPersonalInfo(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    projects: extractProjects(text),
    activities: extractActivities(text)
  };

  return resumeData;
}

function extractPersonalInfo(text: string) {
  const info: any = {};
  
  // Extract email
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailMatch) info.email = emailMatch[0];
  
  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) info.phone = phoneMatch[0];
  
  // Extract name (usually at the beginning)
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes('http')) {
      info.name = firstLine;
    }
  }
  
  return info;
}

function extractSkills(text: string): string[] {
  const skillKeywords = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    // Frontend Frameworks/Libraries
    'React', 'Angular', 'Vue', 'Svelte', 'jQuery', 'Next.js', 'Nuxt.js', 'Gatsby',
    // Backend Frameworks
    'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails', 'FastAPI',
    // Styling
    'HTML', 'CSS', 'SASS', 'SCSS', 'Bootstrap', 'Tailwind', 'Material-UI', 'Styled Components',
    // Databases
    'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'DynamoDB',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform',
    // Version Control & Tools
    'Git', 'GitHub', 'GitLab', 'Jira', 'Agile', 'Scrum', 'Kanban',
    // Data Science & AI
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
    // APIs & Architecture
    'REST API', 'GraphQL', 'Microservices', 'DevOps', 'Serverless',
    // Mobile
    'React Native', 'Flutter', 'iOS', 'Android',
    // Testing
    'Jest', 'Cypress', 'Selenium', 'Unit Testing', 'Integration Testing'
  ];

  const foundSkills = skillKeywords.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });

  return [...new Set(foundSkills)]; // Remove duplicates
}

function extractExperience(text: string): Array<{ title: string; duration?: string }> {
  const experiences = [];
  const lines = text.split('\n');
  
  // Look for experience patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for job titles or company patterns
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
  
  return experiences.slice(0, 5); // Limit to 5 experiences
}

function extractEducation(text: string): string[] {
  const education = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.match(/\b(bachelor|master|phd|degree|university|college|institute)\b/i) ||
        line.match(/\b(b\.?s|m\.?s|b\.?a|m\.?a|b\.?tech|m\.?tech)\b/i)) {
      education.push(line);
    }
  }
  
  return education.slice(0, 3); // Limit to 3 education entries
}

function extractProjects(text: string): string[] {
  const projects = [];
  const lines = text.split(/[\n\r]+/);

  // Look for project section headers
  const projectSectionKeywords = [
    'projects', 'portfolio', 'work samples', 'key projects', 'notable projects',
    'personal projects', 'academic projects', 'side projects'
  ];

  let inProjectSection = false;
  let currentProject = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Check if we're entering a project section
    if (projectSectionKeywords.some(keyword => lowerLine.includes(keyword))) {
      inProjectSection = true;
      continue;
    }

    // Check for project indicators
    const projectIndicators = [
      /\b(project|portfolio|github|built|developed|created|designed|implemented)\b/i,
      /\b(app|application|website|system|platform|tool)\b/i,
      /\b(using|with|technologies|stack)\b/i
    ];

    if (projectIndicators.some(pattern => pattern.test(line))) {
      if (currentProject && currentProject.length > 20) {
        projects.push(currentProject.trim());
      }
      currentProject = line;
      inProjectSection = true;
    } else if (inProjectSection && line.length > 15) {
      // Continue building current project description
      currentProject += ' ' + line;
    } else if (line.length === 0 || lowerLine.match(/\b(experience|education|skills|certifications)\b/)) {
      // End of project section
      if (currentProject && currentProject.length > 20) {
        projects.push(currentProject.trim());
      }
      currentProject = '';
      if (lowerLine.match(/\b(experience|education|skills|certifications)\b/)) {
        inProjectSection = false;
      }
    }
  }

  // Add the last project if exists
  if (currentProject && currentProject.length > 20) {
    projects.push(currentProject.trim());
  }

  // Clean up and deduplicate projects
  const cleanedProjects = projects
    .filter(project => project.length > 30) // Ensure substantial content
    .map(project => project.replace(/\s+/g, ' ').trim()) // Clean whitespace
    .filter((project, index, arr) => arr.indexOf(project) === index); // Remove duplicates

  return cleanedProjects.slice(0, 5); // Limit to 5 projects
}

function extractActivities(text: string): string[] {
  const activities = [];
  const activityKeywords = [
    'volunteer', 'leadership', 'club', 'society', 'organization', 'community',
    'sports', 'music', 'art', 'dance', 'drama', 'debate', 'competition',
    'hackathon', 'conference', 'workshop', 'certification', 'award'
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
  
  return [...new Set(activities)].slice(0, 5); // Remove duplicates and limit to 5
}
