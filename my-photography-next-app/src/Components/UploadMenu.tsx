import { useState } from "react";

interface UploadComponentProps {
  fetchImages: () => void;
  closeMenu: () => void;
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  fetchImages,
  closeMenu,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // ✅ Define event type correctly
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Optional chaining to avoid null errors
    if (file) {
      setSelectedFile(file);
    }
  };

  // ✅ Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      alert(`File uploaded successfully`);

      // ✅ Refresh images after upload
      fetchImages();

      // ✅ Close the upload menu
      closeMenu();
      // ✅ Reset file selection
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("File upload failed. Please try again.");
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

export default UploadComponent;
