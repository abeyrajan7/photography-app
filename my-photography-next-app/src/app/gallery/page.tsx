"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faPlus } from "@fortawesome/free-solid-svg-icons";
import UploadMenu from "../../Components/UploadMenu";
import "./page.css";

export default function Gallery() {
  type ImageData = {
    key: string;
    url: string;
    title?: string;
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<ImageData | null>(
    null
  );
  const [isPortrait, setIsPortrait] = useState(false); // State to track orientation
  const [loadedImages, setLoadedImages] = useState<ImageData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const API_URL =
    "https://photography-backend-3qsvzkqrq-abeys-projects.vercel.app";

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/images`);
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Fetched data:", data); // Verify the response in the console
      setLoadedImages(data.data); // Update the state with the image array
      console.log("Loaded Images:", loadedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

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
        `http://localhost:3001/api/images/${fileName}`
      );
      const response = await fetch(
        `http://localhost:3001/api/images/${fileName}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      }

      alert("Photo deleted successfully!");
      setLoadedImages((prevImages: ImageData[]) =>
        prevImages.filter((img: ImageData) => img.key !== fileKey)
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
                  <FontAwesomeIcon icon={faHeart} /> 23
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
                    abeyrajan7: This a n amazong picture.
                  </li>
                </ul>
                <ul className="delete-option">
                  <li onClick={() => handleDelete(selectedPicture?.key || "")}>
                    {/* <FontAwesomeIcon icon={faTrash} />  */}
                    Delete
                  </li>
                  <li>Like</li>
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
    </div>
  );
}
