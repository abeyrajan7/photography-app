import { signIn } from "next-auth/react";
import "./LoginModal.css";
import { useState, useEffect } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    let userAgent: string = navigator.userAgent || ""; 

    // Check if userAgentData exists (only in modern Chrome/Edge)
    const uaData = (
      navigator as Navigator & {
        userAgentData?: { getHighEntropyValues?: Function };
      }
    ).userAgentData;

    if (uaData && uaData.getHighEntropyValues) {
      uaData
        .getHighEntropyValues(["platform"])
        .then((data: { platform?: string }) => {
          userAgent += data.platform || "";
        })
        .catch(() => {});
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

  if (!isOpen) return null;

  return (
    <>
      {showWarning ? (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white text-center z-50 p-4">
          <p className="text-lg font-bold mb-4">
            ⚠️ Google Sign-In does not work in Instagram/LinkedIn WebView.
            <br />
            Please open this page in <b>Chrome, Safari, or Edge.</b>
          </p>
          <button
            className="bg-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-orange-700 transition-all"
            onClick={() => {
              window.open("https://photography-app-5osi.vercel.app", "_blank");
            }}
          >
            Open in Browser
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
