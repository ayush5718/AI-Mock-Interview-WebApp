"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Heart,
  Star,
  Gift,
  MessageSquare,
  Send,
  CheckCircle,
  Sparkles,
  Users,
  Zap,
  Shield,
  Headphones,
  Crown,
  QrCode,
  Coffee,
  ThumbsUp,
  Lightbulb,
  Bug,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

function PricingPage() {
  const [feedbackType, setFeedbackType] = useState("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName.trim() || null,
          userEmail: userEmail.trim() || null,
          feedbackType,
          feedbackText: feedbackText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const result = await response.json();

      toast.success("Thank you for your feedback! We really appreciate it 🙏");
      setFeedbackText("");
      setUserEmail("");
      setUserName("");
      setFeedbackType("general");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-32 left-10 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-xl -z-10"
          />
          <motion.div
            animate={{
              y: [0, 30, 0],
              rotate: [0, -5, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-48 right-20 w-32 h-32 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-xl -z-10"
          />
          <motion.div
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-xl -z-10"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              className="flex justify-center mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                </motion.div>
                100% Free Forever
              </Badge>
            </motion.div>
            <motion.h1
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              AI Mock Interview
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Practice interviews with AI, get instant feedback, and land your dream job.
              Completely free, forever. Built with ❤️ for the community.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Why We Need Your Support Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-2 border-orange-200/50 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                We Need Your Help to Keep Growing
              </CardTitle>
              <CardDescription className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Our platform is 100% free and always will be. But running an AI-powered service comes with real costs.
                Your support helps us cover these expenses and bring you amazing new features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Server Costs",
                    description: "AI processing requires powerful servers for generating questions and feedback"
                  },
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Storage & Database",
                    description: "Secure storage for your interview data and feedback history"
                  },
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: "API Costs",
                    description: "Advanced AI models for generating questions and providing feedback"
                  },
                  {
                    icon: <Sparkles className="w-6 h-6" />,
                    title: "New Features",
                    description: "Video analysis, industry-specific questions, and more exciting features"
                  }
                ].map((cost, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <Card className="h-full bg-white/80 backdrop-blur-sm border border-orange-200/50 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center text-white mb-4 mx-auto">
                          {cost.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{cost.title}</h3>
                        <p className="text-sm text-gray-600">{cost.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                  <strong>Every donation, no matter how small, makes a huge difference.</strong>
                  Help us keep the platform free for everyone while adding amazing new features!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>



        {/* Donation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="max-w-md w-full"
            >
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-48 h-48 mx-auto bg-white rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-purple-300 overflow-hidden shadow-sm">
                    <Image
                      src="https://i.ibb.co/fGKfdWQn/Whats-App-Image-2025-07-03-at-16-01-57-ae2d2183.jpg"
                      alt="QR Code Placeholder"
                      width={192}
                      height={192}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    <QrCode className="w-6 h-6 inline mr-2 text-purple-600" />
                    Scan to Support Us
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Every donation, no matter how small, helps us keep the platform free and add amazing new features for everyone.
                  </p>
                  <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                    Replace with your donation QR code
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                Help Us Improve
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your feedback is invaluable! Tell us what you love, what needs improvement,
                or suggest new features that would help you succeed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-white/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="bg-white/80"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>What type of feedback do you have?</Label>
                  <RadioGroup value={feedbackType} onValueChange={setFeedbackType}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2 p-3 rounded-lg border bg-white/60 hover:bg-white/80 transition-colors">
                        <RadioGroupItem value="general" id="general" />
                        <Label htmlFor="general" className="flex items-center gap-2 cursor-pointer">
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                          General Feedback
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border bg-white/60 hover:bg-white/80 transition-colors">
                        <RadioGroupItem value="feature" id="feature" />
                        <Label htmlFor="feature" className="flex items-center gap-2 cursor-pointer">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Feature Request
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border bg-white/60 hover:bg-white/80 transition-colors">
                        <RadioGroupItem value="bug" id="bug" />
                        <Label htmlFor="bug" className="flex items-center gap-2 cursor-pointer">
                          <Bug className="w-4 h-4 text-red-500" />
                          Bug Report
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border bg-white/60 hover:bg-white/80 transition-colors">
                        <RadioGroupItem value="improvement" id="improvement" />
                        <Label htmlFor="improvement" className="flex items-center gap-2 cursor-pointer">
                          <Plus className="w-4 h-4 text-blue-500" />
                          Improvement
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Your Feedback *</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us what you think! What features would you like to see? What areas need improvement? Your input helps us make the platform better for everyone."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-32 bg-white/80 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
              <p className="text-xl text-purple-100 mb-8">
                Join thousands of successful candidates who&apos;ve improved their interview skills with our AI platform.
              </p>
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
                onClick={() => window.location.href = '/dashboard'}
              >
                Start Practicing Now
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default PricingPage;
