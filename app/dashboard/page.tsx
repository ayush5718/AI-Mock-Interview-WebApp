import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import UserName from "./_components/UserName";
import InterviewList from "./_components/InterviewList";
import Link from "next/link";

function Dashboard() {
  return (
    <div className="p-10 my-20">
      <h2 className="font-bold text-2xl">Dashboard</h2>

      <UserName />
      <h2 className="text-gray-500">Create and Start Your Ai Mock Interview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 cursor-pointer">
        <AddNewInterview />
      </div>

      {/* interview list */}
      <div className="my-8">
        <InterviewList />
      </div>
    </div>
  );
}

export default Dashboard;
