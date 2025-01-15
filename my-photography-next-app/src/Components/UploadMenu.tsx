import React, { useState } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const UploadMenu = ({ closeMenu, fetchImages }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Replace with your S3 bucket configuration
  const s3Config = {
    region: "ap-south-1",
    bucketName: "framefinder-photography-abey",
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID, // From .env.local
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY, // From .env.local
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
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

    const s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId || "",
        secretAccessKey: s3Config.secretAccessKey || "",
      },
    });

    const uploadParams = {
      Bucket: s3Config.bucketName,
      Key: `photos/${selectedFile.name}`,
      Body: selectedFile,
      ContentType: selectedFile.type,
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // Re-fetch images to update the gallery
      await fetchImages();

      alert("File uploaded successfully!");
      closeMenu(); // Close the upload modal
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
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
