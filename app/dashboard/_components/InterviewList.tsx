"use client";
import { db } from "@/utils/db";
import { AiMockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import InterviewItemCard from "./InterviewItemCard";
import FeedbackSummary from "./FeedbackSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Filter, BarChart3, Grid, List } from "lucide-react";
import moment from "moment";
interface Interview {
  id: number;
  jsonMockResp: string;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdBy: string;
  createdAt: string;
  mockId: string;
}
function InterviewList() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month, custom
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, position
  const [viewMode, setViewMode] = useState("grid"); // grid, list, feedback

  const fetchPreviousInterview = async () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      try {
        setLoading(true);
        const result = await db
          .select()
          .from(AiMockInterview)
          .where(
            eq(AiMockInterview.createdBy, user.primaryEmailAddress.emailAddress)
          )
          .orderBy(desc(AiMockInterview.id));
        setInterviews(result);
        console.log("=== FETCHED INTERVIEWS ===", result);
      } catch (error) {
        console.error("Error fetching previous interviews:", error);
        toast.error("Failed to load interviews");
      } finally {
        setLoading(false);
      }
    } else {
      console.error("User email address is not available");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousInterview();
  }, [user]);

  // Filtered and sorted interviews
  const filteredInterviews = useMemo(() => {
    let filtered = [...interviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(interview =>
        interview.jobPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.jobDesc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = moment();
      filtered = filtered.filter(interview => {
        const interviewDate = moment(interview.createdAt, "DD-MM-YYYY");
        switch (dateFilter) {
          case "today":
            return interviewDate.isSame(now, "day");
          case "week":
            return interviewDate.isSame(now, "week");
          case "month":
            return interviewDate.isSame(now, "month");
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return moment(a.createdAt, "DD-MM-YYYY").valueOf() - moment(b.createdAt, "DD-MM-YYYY").valueOf();
        case "position":
          return a.jobPosition.localeCompare(b.jobPosition);
        case "newest":
        default:
          return moment(b.createdAt, "DD-MM-YYYY").valueOf() - moment(a.createdAt, "DD-MM-YYYY").valueOf();
      }
    });

    return filtered;
  }, [interviews, searchTerm, dateFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = interviews.length;
    const thisMonth = interviews.filter(interview =>
      moment(interview.createdAt, "DD-MM-YYYY").isSame(moment(), "month")
    ).length;
    const thisWeek = interviews.filter(interview =>
      moment(interview.createdAt, "DD-MM-YYYY").isSame(moment(), "week")
    ).length;

    return { total, thisMonth, thisWeek };
  }, [interviews]);
  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            Your Interview Journey 🚀
          </h2>
          <p className="text-gray-600 mt-1">
            Track your progress and level up your skills
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="flex gap-3 mt-4 md:mt-0">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
            <div className="text-blue-600 text-xs font-semibold uppercase tracking-wide">Total</div>
            <div className="text-blue-800 text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 px-4 py-3 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
            <div className="text-green-600 text-xs font-semibold uppercase tracking-wide">This Month</div>
            <div className="text-green-800 text-2xl font-bold">{stats.thisMonth}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-3 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
            <div className="text-purple-600 text-xs font-semibold uppercase tracking-wide">This Week</div>
            <div className="text-purple-800 text-2xl font-bold">{stats.thisWeek}</div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by job position or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400 h-4 w-4" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="position">By Position</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="h-8 px-2"
            >
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="h-8 px-2"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              size="sm"
              variant={viewMode === "feedback" ? "default" : "ghost"}
              onClick={() => setViewMode("feedback")}
              className="h-8 px-2"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Feedback
            </Button>
          </div>
        </div>

        {/* Results Count and Quick Info */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-gray-500">
            Showing {filteredInterviews.length} of {interviews.length} interviews
            {searchTerm && (
              <span className="ml-2 text-blue-600">
                • Filtered by "{searchTerm}"
              </span>
            )}
            {dateFilter !== "all" && (
              <span className="ml-2 text-green-600">
                • {dateFilter === "today" ? "Today" :
                   dateFilter === "week" ? "This Week" :
                   dateFilter === "month" ? "This Month" : dateFilter}
              </span>
            )}
          </div>

          {viewMode === "feedback" && filteredInterviews.length > 0 && (
            <div className="text-sm text-gray-500">
              💡 Tip: Click "View Details" to see complete feedback for each interview
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading interviews...</span>
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-6">🚀</div>
          <h3 className="text-gray-700 text-2xl font-bold mb-3">Ready to Start Your Journey?</h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
            Your first interview is just one click away! Let's build that confidence together 💪
          </p>
          <div className="text-sm text-gray-500">
            ✨ Tip: Start with a role you're familiar with to get comfortable
          </div>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-gray-700 text-xl font-bold mb-2">Hmm, nothing here!</h3>
          <p className="text-gray-600 text-base mb-6">
            Try tweaking your filters or search terms to find what you're looking for 🎯
          </p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setDateFilter("all");
              setSortBy("newest");
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Reset Filters ✨
          </Button>
        </div>
      ) : viewMode === "feedback" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterviews.map((data) => (
            <FeedbackSummary
              key={data?.id}
              interviewId={data.mockId}
              jobPosition={data.jobPosition}
              createdAt={data.createdAt}
            />
          ))}
        </div>
      ) : (
        <div className={`${
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-3"
        }`}>
          {filteredInterviews.map((data) => (
            <InterviewItemCard
              key={data?.id}
              interviews={data}
              onDelete={fetchPreviousInterview}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Quick Actions Footer */}
      {filteredInterviews.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-blue-600 h-5 w-5 flex-shrink-0" />
              <span className="text-blue-800 font-medium">Quick Actions</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // You could implement bulk feedback viewing here
                  toast.success("Feature coming soon: Bulk feedback review!");
                }}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">View All Feedback</span>
                <span className="sm:hidden">All Feedback</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast.success("Feature coming soon: Export to PDF!");
                }}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewList;
