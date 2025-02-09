"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faPlus } from "@fortawesome/free-solid-svg-icons";
import UploadMenu from "../../Components/UploadMenu";
import LoginModal from "../../Components/LoginModal";
import { useSession } from "next-auth/react";
import "./page.css";

export default function Gallery() {
  type CommentData = {
    user: string;
    comment: string; // ✅ Changed from "comments" to "comment" to match JSON
    id?: number;
  };

  type ImageData = {
    key: string;
    url: string;
    title?: string;
    likes?: number;
    liked?: boolean;
    comments: CommentData[]; // ✅ Ensures `comments` is always an array
  };

  const [displayModalOpen, setDisplayModalOpen] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<ImageData | null>(
    null
  );
  const [isPortrait, setIsPortrait] = useState(false); // State to track orientation
  const [loadedImages, setLoadedImages] = useState<ImageData[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  // const API_URL = "https://photography-app-azure.vercel.app";
  const API_URL = "http://localhost:3001";
  // const API_URL = "https://photography-app-azure.vercel.app";

  const { data: session } = useSession();
  const loggedInUser = session?.user?.email;

  const handleSendComment = async (imageKey: string) => {
    if (!newComment.trim()) return; // ✅ Prevent empty comments
    if (!session) {
      console.log("User is not logged in, opening login modal...");
      setDisplayModalOpen(false);
      setIsLoginModalOpen(true); // Show login modal if not logged in
      return;
    }

    const userEmail = session?.user?.email as string; // ✅ Type assertion

    if (!userEmail) {
      console.error("Error: User is not logged in.");
      alert("You need to be logged in to add a comment.");
      return;
    }
    const username = userEmail.split("@")[0];
    const newCommentObj = { user: username, comment: newComment };

    setSelectedPicture((prev) =>
      prev ? { ...prev, comments: [...prev.comments, newCommentObj] } : prev
    );

    setNewComment(""); // ✅ Clear input box
    setIsCommentBoxOpen(false); // ✅ Close comment box

    try {
      const response = await fetch(`http://localhost:3001/api/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_key: imageKey,
          user_email: session?.user?.email,
          comment: newComment,
        }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      setNewComment(""); // ✅ Clear input
      setIsCommentBoxOpen(false); // ✅ Close modal after submitting
    } catch (error) {
      console.error("Error submitting comment:", error);
      setSelectedPicture((prev) =>
        prev ? { ...prev, comments: prev.comments.slice(0, -1) } : prev
      );
    }
  };

  async function handleUnlike(imageKey: string) {
    if (!session) {
      setDisplayModalOpen(false);
      setIsLoginModalOpen(true); // Show login modal if not logged in
      return;
    }

    const userEmail = session.user?.email;
    if (!userEmail) {
      console.error("Error: Email is not available in the session.");
      return;
    }

    // ✅ Step 1: Optimistically Update State (Update UI instantly)
    setLoadedImages((prevImages) =>
      prevImages.map((img) =>
        img.key === imageKey
          ? {
              ...img,
              likes: (img.likes || 0) + (img.liked ? -1 : 1),
              liked: !img.liked,
            }
          : img
      )
    );

    // ✅ Step 1.1: Also update the `selectedPicture` in modal
    if (selectedPicture?.key === imageKey) {
      setSelectedPicture((prev) =>
        prev
          ? {
              ...prev,
              likes: (prev.likes || 0) + (prev.liked ? -1 : 1),
              liked: !prev.liked,
            }
          : null
      );
    }

    try {
      // ✅ Step 2: Send API Request to Update Backend
      const response = await fetch(`${API_URL}/api/unlike`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userEmail, image_key: imageKey }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!data.success) {
        throw new Error("Unlike request failed");
      }
    } catch (error) {
      console.error("Error updating Unlike:", error);

      // ❌ Step 3: Rollback UI if API Fails
      setLoadedImages((prevImages) =>
        prevImages.map((img) =>
          img.key === imageKey
            ? {
                ...img,
                likes: (img.likes || 0) - (img.liked ? -1 : 1),
                liked: !img.liked,
              }
            : img
        )
      );

      // ❌ Step 3.1: Rollback `selectedPicture` if API Fails
      if (selectedPicture?.key === imageKey) {
        setSelectedPicture((prev) =>
          prev
            ? {
                ...prev,
                likes: (prev.likes || 0) - (prev.liked ? -1 : 1),
                liked: !prev.liked,
              }
            : null
        );
      }
    }
  }

  async function handleCommentDelete(commentId: number, imageKey: string) {
    try {
      console.log("🚀 Deleting comment ID:", commentId);

      // ✅ Optimistically update UI: Remove comment from `selectedPicture`
      setSelectedPicture((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.filter(
                (comment) => comment.id !== commentId
              ),
            }
          : prev
      );

      // ✅ Also update `loadedImages` to remove the comment
      setLoadedImages((prevImages) =>
        prevImages.map((img) =>
          img.key === imageKey
            ? {
                ...img,
                comments: img.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : img
        )
      );

      // ✅ Step 2: Send DELETE request to backend
      const response = await fetch(`${API_URL}/api/comment/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      console.log("✅ Comment deleted successfully!");
    } catch (error) {
      console.error("🚨 Error deleting comment:", error);

      // ❌ Rollback UI if API request fails
      fetchImages(); // ✅ Re-fetch all images to restore the correct state
    }
  }

  async function handleLikes(imageKey: string) {
    if (!session) {
      console.log("User is not logged in, opening login modal...");
      setDisplayModalOpen(false);
      setIsLoginModalOpen(true); // Show login modal if not logged in
      return;
    }

    const userEmail = session.user?.email;
    if (!userEmail) {
      console.error("Error: Email is not available in the session.");
      return;
    }

    // ✅ Step 1: Optimistically Update State (Update UI instantly)
    setLoadedImages((prevImages) =>
      prevImages.map((img) =>
        img.key === imageKey
          ? {
              ...img,
              likes: (img.likes || 0) + (img.liked ? -1 : 1),
              liked: !img.liked,
            }
          : img
      )
    );

    // ✅ Step 1.1: Also update the `selectedPicture` in modal
    if (selectedPicture?.key === imageKey) {
      setSelectedPicture((prev) =>
        prev
          ? {
              ...prev,
              likes: (prev.likes || 0) + (prev.liked ? -1 : 1),
              liked: !prev.liked,
            }
          : null
      );
    }

    try {
      // ✅ Step 2: Send API Request to Update Backend
      const response = await fetch(`${API_URL}/api/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userEmail, image_key: imageKey }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error("Like request failed");
      }
    } catch (error) {
      console.error("Error updating like:", error);

      // ❌ Step 3: Rollback UI if API Fails
      setLoadedImages((prevImages) =>
        prevImages.map((img) =>
          img.key === imageKey
            ? {
                ...img,
                likes: (img.likes || 0) + (img.liked ? -1 : 1),
                liked: !img.liked,
              }
            : img
        )
      );

      // ❌ Step 3.1: Rollback `selectedPicture` if API Fails
      if (selectedPicture?.key === imageKey) {
        setSelectedPicture((prev) =>
          prev
            ? {
                ...prev,
                likes: (prev.likes || 0) + (prev.liked ? -1 : 1),
                liked: !prev.liked,
              }
            : null
        );
      }
    }
  }

  const fetchImages = async (userEmail?: string | null | undefined) => {
    try {
      // const userEmail = session?.user?.email;
      const url = userEmail
        ? `${API_URL}/api/images?user_id=${encodeURIComponent(userEmail)}`
        : `${API_URL}/api/images`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setLoadedImages([...data.data]); // Ensure a fresh state update

      setTimeout(() => {}, 1000);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    // setClientSession(session);
    fetchImages(session?.user?.email || null);
  }, [session]); // Runs whenever session updates

  //modal functions
  const openModal = (img: ImageData) => {
    const image = new Image();
    image.src = img.url;
    image.onload = () => {
      setIsPortrait(image.height > image.width); // Check orientation
      setSelectedPicture(img);
      setDisplayModalOpen(true);
    };
  };

  const closeModal = () => {
    setDisplayModalOpen(false);
    setIsCommentBoxOpen(false);
    setSelectedPicture(null);
  };

  const openUploadMenu = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadMenu = () => {
    setIsUploadModalOpen(false);
  };

  const handleComment = () => {
    if (!session) {
      console.log("User is not logged in, opening login modal...");
      setDisplayModalOpen(false);
      setIsLoginModalOpen(true);
      return;
    }

    const userEmail = session.user?.email;
    if (!userEmail) {
      console.error("Error: Email is not available in the session.");
      return;
    }
    setIsCommentBoxOpen(true);
  };
  const handleDelete = async (fileKey: string) => {
    if (!fileKey) {
      console.error("File key is undefined. Cannot proceed with delete.");
      alert("No file selected for deletion.");
      return;
    }

    // Extract only the file name
    const fileName = fileKey.split("/").pop(); // This removes "photos/" and keeps "DSC_1862.JPG"

    setNewComment(""); // ✅ Clear input box
    setIsCommentBoxOpen(false); // ✅ Close comment box

    try {
      const response = await fetch(`${API_URL}/api/images/${fileName}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      }

      alert("Photo deleted successfully!");
      setLoadedImages(
        (prevImages: ImageData[]) =>
          prevImages.filter((img: ImageData) => img.key !== fileKey) //here
      );
      setDisplayModalOpen(false);
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  return (
    <div className="photo-gallery">
      {loadedImages.length > 0 ? (
        loadedImages.map((img: ImageData, index) => (
          <div className="photo" key={index}>
            <figure className="hover-effect">
              <img
                src={img.url}
                onClick={() => openModal(img)}
                alt={`Photo ${index + 1}`}
              />
              {/* {interactions.map(() => {})} */}
              <figcaption className="interactions">
                <span>
                  <FontAwesomeIcon
                    icon={faHeart}
                    className={img.liked ? "liked-icon" : "unliked-icon"} // Change color based on liked status
                  />{" "}
                  {img.likes}
                </span>
                <span>
                  <FontAwesomeIcon icon={faComment} /> 12
                </span>
              </figcaption>
            </figure>
          </div>
        ))
      ) : (
        <p>Loading images...</p>
      )}
      {displayModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className={`display-modal ${isPortrait ? "portrait" : "landscape"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section */}
            <img src={selectedPicture?.url} alt="Selected" />

            {/* Interaction Section */}
            <div
              className={`interaction-section ${
                isPortrait ? "portrait" : "landscape"
              }`}
            >
              {/* <h2 className="picture-caption">
                {selectedPicture?.title || " "}
              </h2> */}
              <div className="comments comments-options">
                <p className="comments-title">Comments</p>
                <ul
                  className={`user-comments ${
                    isPortrait ? "portrait" : "landscape"
                  }`}
                >
                  {selectedPicture?.comments &&
                  selectedPicture.comments.length > 0 ? (
                    selectedPicture.comments.map((comment, index) => (
                      <li
                        key={index}
                        className={
                          isPortrait ? "comment-text" : "landscape-comment-text"
                        }
                      >
                        <strong>{comment.user.split("@")[0]}:</strong>{" "}
                        {comment.comment}
                        {comment.id !== undefined &&
                          comment.user === loggedInUser && (
                            <p
                              className="comment-delete-btn"
                              onClick={() =>
                                handleCommentDelete(
                                  comment.id as number,
                                  selectedPicture.key
                                )
                              }
                            >
                              delete-comment
                            </p>
                          )}
                      </li>
                    ))
                  ) : (
                    <li className="no-comments">No comments yet.</li>
                  )}
                </ul>
              </div>
              <div
                className={`options ${isPortrait ? "portrait" : "landscape"}`}
              >
                <ul
                  className={`delete-option like-delete ${
                    isPortrait ? "portrait" : "landscape"
                  }`}
                >
                  {selectedPicture?.liked ? (
                    <li
                      onClick={() => handleUnlike(selectedPicture?.key || "")}
                      className="likes"
                    >
                      {/* onClick={() => handleLikes(selectedPicture?.key || "")}> */}
                      Unlike ({selectedPicture?.likes || 0})
                    </li>
                  ) : (
                    <li
                      onClick={() => handleLikes(selectedPicture?.key || "")}
                      className="likes"
                    >
                      Like ({selectedPicture?.likes || 0})
                    </li>
                  )}
                  <li onClick={handleComment}>Comment</li>
                  <li onClick={() => handleDelete(selectedPicture?.key || "")}>
                    {/* <FontAwesomeIcon icon={faTrash} />  */}
                    Delete
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <UploadMenu
              // loadedImages={loadedImages}
              // setLoadedImages={setLoadedImages}
              fetchImages={fetchImages} // Pass fetchImages here
              closeMenu={closeUploadMenu}
            />
          </div>
        </div>
      )}

      <div className="btn-parent">
        <button className="add-btn fas fa-plus" onClick={openUploadMenu}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {/* Render Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {isCommentBoxOpen && (
        <div className="comment-modal">
          <textarea
            className="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <div className="comment-buttons">
            <button
              onClick={() => handleSendComment(selectedPicture?.key || "")}
            >
              Send
            </button>
            <button onClick={() => setIsCommentBoxOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
