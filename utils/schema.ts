import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const AiMockInterview = pgTable("AiMockInterview", {
  id: serial("id").primaryKey(),
  jsonMockResp: text("jsonMockResp").notNull(),
  jobPosition: varchar("jobPosition").notNull(),
  jobDesc: varchar("jobDesc").notNull(),
  jobExperience: varchar("jobExperience").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt").notNull(),
  mockId: varchar("mockId").notNull(),
});

export const UserAnswer = pgTable("UserAnswer", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockId").notNull(),
  question: varchar("question").notNull(),
  correctAnswer: text("correctAnswer"),
  userAnswer: text("userAnswer"),
  feedback: varchar("feedback"),
  rating: varchar("rating"),
  userEmail: varchar("userEmail"),
  createadAt: varchar("createdAt"),
});
