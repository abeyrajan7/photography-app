"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faPlus,
  faTimes,
  faArrowLeft,
  faArrowRight,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import UploadMenu from "../../Components/UploadMenu";
import LoginModal from "../../Components/LoginModal";
import { useSession, signIn } from "next-auth/react";

export default function Gallery() {
  type CommentData = {
    user: string;
    comment: string;
    id: number;
  };

  type ImageData = {
    key: string;
    url: string;
    title?: string;
    likes?: number;
    liked?: boolean;
    comments: CommentData[];
  };

  const [displayModalOpen, setDisplayModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<ImageData[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const API_URL = "https://photography-app-azure.vercel.app";

  const { data: session } = useSession();
  const loggedInUser = session?.user?.email || "";

  const fetchImages = async (userEmail?: string | null | undefined) => {
    try {
      const url = userEmail
        ? `${API_URL}/api/images?user_id=${encodeURIComponent(userEmail)}`
        : `${API_URL}/api/images`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      setLoadedImages([...data.data]);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    if (loadedImages.length === 0 && session !== undefined) {
      fetchImages(session?.user?.email || null);
    }
  }, [session, loadedImages.length]);

  const openModal = (index: number) => {
    const image = new Image();
    image.src = loadedImages[index].url;
    image.onload = () => {
      setSelectedIndex(index);
      setDisplayModalOpen(true);
    };
  };

  const closeModal = useCallback(() => {
    setDisplayModalOpen(false);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  const handleSendComment = async (imageKey: string) => {
    if (!newComment.trim()) return;
    if (!loggedInUser) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: loggedInUser,
          comment: newComment,
          image_key: imageKey,
        }),
      });
      if (response.ok) {
        await fetchImages(session?.user?.email || null);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/comment/${commentId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchImages(session?.user?.email || null);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleLikeToggle = async (imageKey: string, isLiked: boolean) => {
    if (!loggedInUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const endpoint = isLiked ? "/api/unlike" : "/api/like";
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: loggedInUser, image_key: imageKey }),
      });
      if (response.ok) {
        await fetchImages(session?.user?.email || null);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const showPrev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? loadedImages.length - 1 : prev - 1
    );
  };

  const showNext = () => {
    setSelectedIndex((prev) =>
      prev === loadedImages.length - 1 ? 0 : prev + 1
    );
  };

  const selectedPicture = loadedImages[selectedIndex];

  const bossEmails = [
    process.env.NEXT_PUBLIC_BOSS_EMAIL_1,
    process.env.NEXT_PUBLIC_BOSS_EMAIL_2,
  ];

  const isBoss =
    session?.user?.email && bossEmails.includes(session.user.email);

  const handleDeleteImage = async (imageKey: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    const fileKey = imageKey.replace(/^photos\//, ""); // remove prefix

    try {
      const response = await fetch(`${API_URL}/api/images/${fileKey}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchImages(session?.user?.email || null);
        setDisplayModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="pt-20 px-4 bg-neutral-900 min-h-screen">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {loadedImages.map((img, index) => (
          <div
            key={index}
            className="break-inside-avoid relative overflow-hidden rounded-lg shadow-md hover:shadow-xl cursor-pointer group"
          >
            <img
              src={img.url}
              alt={`Photo ${index + 1}`}
              className="w-full h-auto object-cover rounded-lg transition-opacity duration-300"
              onClick={() => openModal(index)}
            />
            <div className="absolute bottom-0 left-0 w-full bg-black/70 text-white px-3 py-2 text-sm flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => handleLikeToggle(img.key, img.liked || false)}
              >
                <FontAwesomeIcon
                  icon={faHeart}
                  className={img.liked ? "text-red-500" : "text-white/50"}
                />
                {img.likes}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faComment} />
                {img.comments?.length || 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isBoss ? (
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-white text-black text-3xl shadow-md flex items-center justify-center hover:bg-black hover:text-white transition-all"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      ) : (
        <button
          onClick={() => alert("Sorry, only Bosses are allowed to upload.")}
          className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-white text-black text-3xl shadow-md flex items-center justify-center opacity-50 cursor-not-allowed"
          title="Only bosses can upload"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}

      {displayModalOpen && selectedPicture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 px-2">
          <div
            className="absolute left-2 sm:left-5 text-white text-2xl cursor-pointer"
            onClick={showPrev}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <div
            className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={closeModal}
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            <img
              src={selectedPicture.url}
              alt={selectedPicture.title || "Image"}
              className="rounded-lg max-h-[60vh] w-full object-contain mb-4"
            />
            <div className="text-white mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">Likes: {selectedPicture.likes}</p>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() =>
                    handleLikeToggle(
                      selectedPicture.key,
                      selectedPicture.liked || false
                    )
                  }
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    className={
                      selectedPicture.liked ? "text-red-500" : "text-white/50"
                    }
                  />
                </button>
              </div>
              <p className="mb-2 font-semibold">Comments:</p>
              <ul className="space-y-3 max-h-40 overflow-y-auto">
                {selectedPicture.comments.map((comment, idx) => (
                  <li
                    key={idx}
                    className="bg-white/10 p-3 rounded-lg shadow text-sm border border-white/20 relative"
                  >
                    <p className="text-teal-300 font-semibold">
                      {comment.user}
                    </p>
                    <p className="text-white mt-1">{comment.comment}</p>
                    {comment.user === loggedInUser && (
                      <button
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <textarea
                className="w-full p-3 border rounded text-black focus:outline-none focus:ring focus:border-blue-500"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
              />
              <div className="flex justify-between items-center gap-2 mt-2">
                {!loggedInUser && (
                  <button
                    className="text-blue-300 underline text-sm"
                    onClick={() => signIn("google")}
                  >
                    Login to comment
                  </button>
                )}
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => handleSendComment(selectedPicture.key)}
                >
                  Send
                </button>
                {isBoss && (
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={() => handleDeleteImage(selectedPicture.key)}
                  >
                    Delete Photo
                  </button>
                )}
              </div>
            </div>
          </div>
          <div
            className="absolute right-2 sm:right-5 text-white text-2xl cursor-pointer"
            onClick={showNext}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <UploadMenu
            fetchImages={fetchImages}
            closeMenu={() => setIsUploadModalOpen(false)}
          />
        </div>
      )}

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </div>
  );
}
