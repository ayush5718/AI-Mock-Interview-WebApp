import { SignUp } from "@clerk/nextjs";
import React from "react";

function page() {
  return (
    <div className="flex justify-center items-center my-20">
      <SignUp />
    </div>
  );
}

export default page;
