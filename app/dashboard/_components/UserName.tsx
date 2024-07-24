"use client";
import { useUser } from "@clerk/nextjs";
import React from "react";

function UserName() {
  const { isSignedIn, user, isLoaded } = useUser();
  return (
    <div>
      <h2>
        Welcome{" "}
        <span className="text-blue-500 font-bold">{user?.fullName}</span>
      </h2>
    </div>
  );
}

export default UserName;
