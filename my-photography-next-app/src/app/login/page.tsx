"use client";

import { signIn } from "next-auth/react";
import React from "react";

export default function LoginPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Sign in with Google
        </h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/gallery" })}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M44.5 20H24v8.5h11.8C34.2 33.6 29.5 36.5 24 36.5c-7 0-12.8-5.8-12.8-12.8S17 10.9 24 10.9c3.2 0 6.1 1.2 8.3 3.2l6.2-6.2C34.1 4.5 29.3 2.5 24 2.5 12.6 2.5 3.5 11.6 3.5 23S12.6 43.5 24 43.5 44.5 34.4 44.5 23c0-1-.1-2-.3-3z"
              fill="#FFC107"
            />
            <path
              d="M6.3 14.3l6.6 4.8C14.6 15.1 19 12.4 24 12.4c3.2 0 6.1 1.2 8.3 3.2l6.2-6.2C34.1 4.5 29.3 2.5 24 2.5 16.2 2.5 9.5 6.9 6.3 14.3z"
              fill="#FF3D00"
            />
            <path
              d="M24 43.5c5.3 0 10.1-1.9 13.9-5.1l-6.4-5.3c-2 1.5-4.6 2.4-7.5 2.4-5.4 0-10-3.5-11.6-8.3l-6.6 5C9.6 38.6 16.3 43.5 24 43.5z"
              fill="#4CAF50"
            />
            <path
              d="M44.5 20H24v8.5h11.8c-1 3-3 5.4-5.6 7.1l6.4 5.3C40.7 38 44.5 31.5 44.5 23c0-1-.1-2-.3-3z"
              fill="#1976D2"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          You will be redirected to authorize your Google account.
        </p>
      </div>
    </section>
  );
}
