"use client";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";

function Header() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    console.log(path);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="flex justify-between items-center p-6">
      <Image src={"/logo.svg"} width={60} height={100} alt="logo" />

      {/* Hamburger icon for smaller screens */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="text-gray-600 focus:outline-none focus:text-gray-800"
        >
          {menuOpen ? (
            <XIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Menu items for smaller screens */}
      <ul
        className={`md:flex md:flex-row md:items-center md:gap-6 text-xl md:flex-row ${
          menuOpen ? "flex flex-col items-start" : "hidden"
        }`}
      >
        <li
          className={`font-bold hover:text-blue-500 cursor-pointer ${
            path == "/dashboard" && "text-blue-500"
          }`}
        >
          <Link href={"/dashboard"}>Dashboard</Link>
        </li>
        <li
          className={`font-bold hover:text-blue-500 cursor-pointer ${
            path == "/dashboard/questions" && "text-blue-500"
          }`}
        >
          <Link href={"/dashboard/questions"}>Questions</Link>
        </li>
        <li
          className={`font-bold hover:text-blue-500 cursor-pointer ${
            path == "/dashboard/how" && "text-blue-500"
          }`}
        >
          <Link href={"/dashboard/how"}>How It Works ?</Link>
        </li>
        <li
          className={`font-bold hover:text-blue-500 cursor-pointer ${
            path == "/dashboard/upgrade" && "text-blue-500"
          }`}
        >
          <Link href={"/dashboard/upgrade"}>Upgrade</Link>
        </li>
      </ul>

      <UserButton />
    </div>
  );
}

export default Header;
