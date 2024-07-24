import Image from "next/image";
import Link from "next/link";
import React from "react";

function Hero() {
  return (
    <div className="flex justify-center items-center w-full">
      <Link
        href={"/dashboard"}
        className="mt-8 inline-block rounded-lg flex justify-center items-center bg-indigo-600 px-12 py-3 text-4xl font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-yellow-400"
      >
        Get Started Today
      </Link>
    </div>
  );
}

export default Hero;
