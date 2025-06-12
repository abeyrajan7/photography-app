"use client";

import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const API_URL = "http://localhost:3001";

  const handleNavigation = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  async function saveUserEmail(email: string) {
    try {
      await fetch(`${API_URL}/api/saveUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error("Error saving email:", error);
    }
  }

  async function handleLogout() {
    if (session?.user?.email) saveUserEmail(session.user.email);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-red-900 to-black text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-wide">Frame Finder</h1>
          </div>

          <div className="hidden md:flex gap-6 text-sm font-medium">
            <button
              onClick={() => handleNavigation("/gallery")}
              className={`hover:text-green-400 transition-colors ${
                pathname === "/gallery" ? "text-green-400" : ""
              }`}
            >
              Photography
            </button>

            {!session && (
              <button
                onClick={() => handleNavigation("/login")}
                className={`hover:text-green-400 transition-colors ${
                  pathname === "/login" ? "text-green-400" : ""
                }`}
              >
                Login
              </button>
            )}

            {session && (
              <button
                onClick={handleLogout}
                className="hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:text-gray-300"
            >
              <FaBars size={20} />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black text-white px-4 py-2 space-y-2">
          <button
            onClick={() => handleNavigation("/gallery")}
            className="block w-full text-left hover:text-green-400"
          >
            Photography
          </button>

          {!session && (
            <button
              onClick={() => handleNavigation("/login")}
              className="block w-full text-left hover:text-green-400"
            >
              Login
            </button>
          )}

          {session && (
            <button
              onClick={handleLogout}
              className="block w-full text-left hover:text-red-400"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
