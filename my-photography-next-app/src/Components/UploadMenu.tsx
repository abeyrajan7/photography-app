import React, { useState } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import "web-streams-polyfill";
require("dotenv").config();

interface UploadMenuProps {
  closeMenu: () => void;
  fetchImages: () => Promise<void>;
}

const UploadMenu: React.FC<UploadMenuProps> = ({ closeMenu, fetchImages }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Replace with your S3 bucket configuration
  const s3Config = {
    bucketName: "framefinder-photography-abey",
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "ap-south-1",
  };

  console.log("AWS Region:", s3Config.region);

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

    const s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId || "",
        secretAccessKey: s3Config.secretAccessKey || "",
      },
    });

    const uploadParams = {
      Bucket: "framefinder-photography-abey",
      Key: `photos/${selectedFile.name}`, // Destination key in S3
      Body: new Uint8Array(await selectedFile.arrayBuffer()),
      ContentType: selectedFile.type, // MIME type of the file
    };

    console.log("Upload Parameters:", uploadParams);

    try {
      const command = new PutObjectCommand(uploadParams);
      console.log("Attempting to upload:", uploadParams);
      await s3Client.send(command);

      alert("File uploaded successfully!");
      await fetchImages();
      closeMenu();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error uploading file:", error);
        alert(`Upload failed: ${error.message}`);
      } else {
        console.error("Unexpected error:", error);
        alert("Upload failed: Unknown error");
      }
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
