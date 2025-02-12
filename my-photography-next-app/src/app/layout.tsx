"use client"; // This remains since you are using hooks

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../Components/Header";
import Provider from "./SessionProvider";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;

    if (
      userAgent.includes("Instagram") || // Instagram WebView
      userAgent.includes("FBAN") || // Facebook WebView
      userAgent.includes("FBAV") || // Facebook WebView
      userAgent.includes("LinkedInApp") // LinkedIn WebView
    ) {
      setShowWarning(true);
    }
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <Header />
          <main className="main-body">
            {showWarning ? (
              <div className="warning-overlay">
                <p>
                  ⚠️ Google Sign-In does not work in Instagram/LinkedIn WebView.
                </p>
                <p>
                  Please open this page in <b>Chrome, Safari, or Edge.</b>
                </p>
                <button
                  onClick={() => {
                    window.open(
                      "https://photography-app-5osi.vercel.app",
                      "_blank"
                    );
                  }}
                >
                  Open in Browser
                </button>
                <p>or manually copy this link:</p>
                <input
                  type="text"
                  value="https://photography-app-5osi.vercel.app"
                  readOnly
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  style={{ width: "100%", padding: "5px", color: "black" }}
                />
              </div>
            ) : (
              children
            )}
          </main>
        </Provider>
      </body>
    </html>
  );
}
