"use client"; // Add this at the very top

import React from "react";
import "./Header.css";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  // const { data: session } = useSession();
  // const API_URL = "http://localhost:3001";
  const API_URL = "https://photography-app-azure.vercel.app";

  async function saveUserEmail(email: string) {
    console.log("here");
    try {
      const response = await fetch(`${API_URL}/api/saveUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to store email in database");

      console.log("✅ Email saved successfully:", email);
    } catch (error) {
      console.error("🚨 Error saving email:", error);
    }
  }

  async function handleLogout() {
    if (session?.user?.email) {
      saveUserEmail(session.user.email); // ✅ Store email in Neon.ai
    }
    await signOut({ callbackUrl: "/" }); // Redirects user to home after logout
  }

  const handleNavigation = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  return (
    <div className="header-bar">
      <h1 className="site-title">Frame Finder</h1>
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <FaBars size={24} />
      </div>
      <ul className={`nav-items ${menuOpen ? "open" : ""}`}>
        <li
          onClick={() => handleNavigation("/about")}
          className={pathname === "/about" ? "active-tab" : ""}
        >
          About
        </li>
        <li
          onClick={() => handleNavigation("/gallery")}
          className={pathname === "/gallery" ? "active-tab" : ""}
        >
          Photography
        </li>
        {session && <li onClick={() => handleLogout()}>Logout</li>}
      </ul>
    </div>
  );
}
