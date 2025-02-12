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
                  ⚠️ Google Sign-In does not work in Instagram/LinkedIn in-app
                  browser. Please open this page in **Chrome, Safari, or Edge**.
                </p>
                <button
                  onClick={() => {
                    window.location.href =
                      "https://photography-app-5osi.vercel.app";
                  }}
                >
                  Open in Browser
                </button>
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
