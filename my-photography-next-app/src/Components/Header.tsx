"use client"; // Add this at the very top

import React from "react";
import "./Header.css";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("/about");
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  // const { data: session } = useSession();

  async function handleLogout() {
    await signOut({ callbackUrl: "/" }); // Redirects user to home after logout
  }

  const handleNavigation = (path: string) => {
    setActiveTab(path);
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
          className={activeTab === "/about" ? "active-tab" : ""}
        >
          About
        </li>
        <li
          onClick={() => handleNavigation("/gallery")}
          className={activeTab === "/gallery" ? "active-tab" : " "}
        >
          Photography
        </li>
        {session && <li onClick={() => handleLogout()}>Logout</li>}
      </ul>
    </div>
  );
}
