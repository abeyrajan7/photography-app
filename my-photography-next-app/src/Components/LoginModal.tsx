import { signIn } from "next-auth/react";
import "./LoginModal.css";
import { useState, useEffect } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    let userAgent: string = navigator.userAgent || ""; // Default fallback for all browsers
    setIsAndroid(/Android/i.test(userAgent));
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));

    // Properly type `userAgentData`
    const uaData = (
      navigator as Navigator & {
        userAgentData?: {
          getHighEntropyValues?: (
            keys: string[]
          ) => Promise<{ platform?: string }>;
        };
      }
    ).userAgentData;

    if (uaData?.getHighEntropyValues) {
      uaData
        .getHighEntropyValues(["platform"])
        .then((data) => {
          if (data.platform) {
            userAgent += data.platform;
          }
        })
        .catch(() => {}); // Catch errors silently
    }

    // Detect in-app browsers (Instagram, Facebook, LinkedIn)
    if (
      userAgent.includes("Instagram") ||
      userAgent.includes("FBAN") || // Facebook App
      userAgent.includes("FBAV") || // Facebook App
      userAgent.includes("LinkedInApp") // LinkedIn App
    ) {
      setShowWarning(true);
    }
  }, []);

  const openInChrome = () => {
    const url = "https://photography-app-5osi.vercel.app";
    const chromeIntent = `intent://${url.replace(
      "https://",
      ""
    )}#Intent;scheme=https;package=com.android.chrome;end;`;

    if (isAndroid) {
      window.location.href = chromeIntent; // Opens in Chrome on Android
    } else {
      window.open(url, "_blank"); // Fallback for other users
    }
  };

  const openInSafari = () => {
    const url = "https://photography-app-5osi.vercel.app";
    if (isIOS) {
      window.location.href = url; // Safari automatically opens
    } else {
      window.open(url, "_blank"); // Fallback for other users
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://photography-app-5osi.vercel.app");
    alert("Link copied to clipboard!");
  };

  if (!isOpen) return null;

  return (
    <>
      {showWarning ? (
        <div className="flex flex-col gap-3 items-center">
          {isAndroid && (
            <button
              onClick={openInChrome}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              Open in Google Chrome
            </button>
          )}
          {isIOS && (
            <button
              onClick={openInSafari}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-900 transition-all"
            >
              Open in Safari
            </button>
          )}
          {!isAndroid && !isIOS && (
            <button
              onClick={() =>
                window.open("https://photography-app-5osi.vercel.app", "_blank")
              }
              className="bg-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-orange-700 transition-all"
            >
              Open in Default Browser
            </button>
          )}
          <button
            onClick={copyLink}
            className="bg-gray-400 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-500 transition-all"
          >
            Copy Link
          </button>
        </div>
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96 login">
            <h2 className="text-lg font-bold mb-4">Login Required</h2>
            <p className="mb-4">
              You need to log in with Google to like this image.
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => signIn("google")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Login with Google
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
