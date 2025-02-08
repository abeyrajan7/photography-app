import React, { useState } from "react";
import "web-streams-polyfill";
import dotenv from "dotenv";
dotenv.config();

interface UploadMenuProps {
  closeMenu: () => void;
  fetchImages: () => Promise<void>;
}
const API_URL = "https://photography-app-azure.vercel.app";
// const API_URL = "http://localhost:3001";

const UploadMenu: React.FC<UploadMenuProps> = ({ closeMenu, fetchImages }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert("Only JPG and PNG files are allowed.");
        event.target.value = ""; // Clear the file input
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please choose a file before uploading.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile); // ✅ Ensure the key matches backend Multer field

    try {
      console.log("Uploading to:", `${API_URL}/api/image/upload`);
      const response = await fetch(`${API_URL}/api/image/upload`, {
        method: "POST",
        body: formData,
        mode: "cors", // ✅ Ensure CORS is properly handled
        credentials: "include", // ✅ Include credentials if needed
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Uploaded to:", data.url);
      alert("File uploaded successfully!");
      await fetchImages();
      closeMenu();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Upload error:", error.message);
        alert("Upload failed: " + error.message);
      } else {
        console.error("Upload error:", error);
        alert("Upload failed: Unknown error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="file-input"
          style={{
            cursor: "pointer",
            color: "#007BFF",
            textDecoration: "underline",
          }}
        >
          Choose File
        </label>
        <input
          id="file-input"
          type="file"
          accept=".jpg,.png"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
      <div>{selectedFile && <p>Selected File: {selectedFile.name}</p>}</div>
      <button
        onClick={handleUpload}
        style={{ marginRight: "10px" }}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      <button onClick={closeMenu}>Close</button>
    </div>
  );
};

export default UploadMenu;
