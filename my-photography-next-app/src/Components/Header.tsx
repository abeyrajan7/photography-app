"use client"; // Add this at the very top

import React from "react";
import "./Header.css";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="header-bar">
      <h1 className="site-title">Frame Finder</h1>
      <ul className="nav-items">
        <li
          onClick={() => handleNavigation("/about")}
          style={{ cursor: "pointer", color: "blanchedalmond" }}
        >
          About
        </li>
        <li
          onClick={() => handleNavigation("/gallery")}
          style={{ cursor: "pointer", color: "blanchedalmond" }}
        >
          Galary
        </li>
        <li style={{ cursor: "pointer", color: "blanchedalmond" }}>Contact</li>
      </ul>
    </div>
  );
}
