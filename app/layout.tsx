import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./dashboard/_components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InterviewAI - Master Your Dream Job Interview",
  description: "Practice mock interviews with AI-generated questions, get instant feedback, and boost your confidence. Land your dream job with personalized interview coaching.",
  keywords: "interview practice, AI interview, mock interview, job interview, interview preparation, career coaching",
  authors: [{ name: "InterviewAI Team" }],
  openGraph: {
    title: "InterviewAI - Master Your Dream Job Interview",
    description: "Practice mock interviews with AI-generated questions and get instant feedback",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
