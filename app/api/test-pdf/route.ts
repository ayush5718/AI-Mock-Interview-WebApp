import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for pdf-parse compatibility
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Testing PDF parsing library...');

    // Test if pdf-parse is working
    const pdf = require('pdf-parse');
    console.log('PDF library loaded successfully');

    return NextResponse.json({
      success: true,
      message: 'PDF parsing library is available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('PDF library test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'PDF parsing library not available',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Use /api/parse-resume for PDF parsing',
    endpoint: '/api/parse-resume',
    method: 'POST',
    contentType: 'multipart/form-data',
    field: 'resume'
  });
}
