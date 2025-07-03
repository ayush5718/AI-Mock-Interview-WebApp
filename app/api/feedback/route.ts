import { db } from "@/utils/db";
import { UserFeedback } from "@/utils/schema";
import { NextRequest, NextResponse } from "next/server";
import moment from "moment";

export async function POST(req: NextRequest) {
  try {
    const { userName, userEmail, feedbackType, feedbackText } = await req.json();

    // Validate required fields
    if (!feedbackType || !feedbackText) {
      return NextResponse.json(
        { error: "Feedback type and text are required" },
        { status: 400 }
      );
    }

    // Validate feedback type
    const validTypes = ['general', 'feature', 'bug', 'improvement'];
    if (!validTypes.includes(feedbackType)) {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 }
      );
    }

    // Insert feedback into database
    const result = await db.insert(UserFeedback).values({
      userName: userName || null,
      userEmail: userEmail || null,
      feedbackType,
      feedbackText,
      status: "pending",
      priority: "medium",
      createdAt: moment().format("DD-MM-yyyy HH:mm:ss"),
    });

    return NextResponse.json(
      { 
        message: "Feedback submitted successfully",
        success: true 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // This endpoint could be used by admins to view feedback
    // For now, we'll just return a simple response
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    let query = db.select().from(UserFeedback);
    
    // Add filters if provided
    // Note: This is a simplified version. In production, you'd want proper filtering
    const feedbacks = await query;

    return NextResponse.json({
      feedbacks,
      count: feedbacks.length
    });

  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
