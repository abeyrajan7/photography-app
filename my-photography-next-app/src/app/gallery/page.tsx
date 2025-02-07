"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faPlus } from "@fortawesome/free-solid-svg-icons";
import UploadMenu from "../../Components/UploadMenu";
import LoginModal from "../../Components/LoginModal";
import { useSession } from "next-auth/react";
import "./page.css";

export default function Gallery() {
  type ImageData = {
    key: string;
    url: string;
    title?: string;
    likes?: number;
    liked?: boolean;
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<ImageData | null>(
    null
  );
  const [isPortrait, setIsPortrait] = useState(false); // State to track orientation
  const [loadedImages, setLoadedImages] = useState<ImageData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const API_URL = "https://photography-app-azure.vercel.app";
  // const API_URL = "http://localhost:3001";
  // const API_URL = "https://photography-app-azure.vercel.app";

  const { data: session } = useSession();
  // const [clientSession, setClientSession] = useState<typeof session | null>(
  //   null
  // );

  async function handleUnlike(imageKey: string) {
    console.log("User session:", session);

    if (!session) {
      setModalOpen(false);
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
      const response = await fetch("http://localhost:3001/api/unlike", {
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

  async function handleLikes(imageKey: string) {
    console.log("User session:", session);

    if (!session) {
      setModalOpen(false);
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
      const response = await fetch("http://localhost:3001/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userEmail, image_key: imageKey }),
      });

      const data = await response.json();
      console.log("API Response:", data);

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
      console.log("📢 Session Data:", session);

      // const userEmail = session?.user?.email;
      console.log("📢 Extracted userEmail:", userEmail);
      const url = userEmail
        ? `${API_URL}/api/images?user_id=${encodeURIComponent(userEmail)}`
        : `${API_URL}/api/images`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(data.data[0].likes);

      setLoadedImages([...data.data]); // Ensure a fresh state update

      setTimeout(() => {
        console.log("✅ State after update:", loadedImages);
      }, 1000);
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
      setModalOpen(true);
    };
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPicture(null);
  };

  const openUploadMenu = () => {
    setIsModalOpen(true);
  };

  const closeUploadMenu = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (fileKey: string) => {
    if (!fileKey) {
      console.error("File key is undefined. Cannot proceed with delete.");
      alert("No file selected for deletion.");
      return;
    }

    // Extract only the file name
    const fileName = fileKey.split("/").pop(); // This removes "photos/" and keeps "DSC_1862.JPG"

    try {
      console.log(
        "Sending DELETE request to:",
        process.env.NEXT_PUBLIC_API_URL,
        `${API_URL}/${fileName}`
      );
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
      setModalOpen(false);
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
      {modalOpen && (
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
              <h2 className="picture-caption">
                {selectedPicture?.title || " "}
              </h2>
              <div className="comments">
                <p className="comments-title">Comments</p>
                <ul>
                  <li
                    className={`${
                      isPortrait ? "comment-text" : "landscape-comment-text"
                    }`}
                  >
                    abeyrajan7: Great shot!
                  </li>
                  <li
                    className={`${
                      isPortrait ? "comment-text" : "landscape-comment-text"
                    }`}
                  >
                    abeyrajan7: This an amazing picture.
                  </li>
                </ul>
                <ul className="delete-option">
                  <li onClick={() => handleDelete(selectedPicture?.key || "")}>
                    {/* <FontAwesomeIcon icon={faTrash} />  */}
                    Delete
                  </li>
                  {selectedPicture?.liked ? (
                    <li
                      onClick={() => handleUnlike(selectedPicture?.key || "")}
                    >
                      {/* onClick={() => handleLikes(selectedPicture?.key || "")}> */}
                      Unlike ({selectedPicture?.likes || 0})
                    </li>
                  ) : (
                    <li onClick={() => handleLikes(selectedPicture?.key || "")}>
                      Like ({selectedPicture?.likes || 0})
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
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
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
