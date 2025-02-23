"use client";
import { SignIn, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";

import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
const navigation = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "How it Works", href: "/how" },
  { name: "Upgrade", href: "/upgrade" },
  { name: "Questions", href: "question" },
];
function Header() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleSignin = () => {
    router.push("/dashboard");
  };
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <Link href={"/"} className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <Image
                width={0}
                height={0}
                alt=""
                src={"/logo.svg"}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <h2 className="text-sm font-semibold leading-6 text-gray-900">
              {isSignedIn ? (
                <UserButton />
              ) : (
                <button onClick={handleSignin}>Log in &rarr;</button>
              )}
            </h2>
          </div>
        </nav>
        <Dialog
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
          className="lg:hidden"
        >
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href={"/"} className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <Image
                  width={0}
                  height={0}
                  alt="logo"
                  src={"/logo.svg"}
                  className="h-8 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <h2 className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    {isSignedIn ? (
                      <>
                        <div className="flex items-center gap-2">
                          <UserButton />
                          <span className="font-bold text-lg text-gray-600">
                            {" "}
                            {user.fullName}
                          </span>
                        </div>
                      </>
                    ) : (
                      <button onClick={handleSignin}>Log in &rarr;</button>
                    )}
                  </h2>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
    </div>
  );
}

export default Header;
