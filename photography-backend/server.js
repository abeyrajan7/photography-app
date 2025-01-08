const AWS = require("aws-sdk");

// Configure AWS SDK
AWS.config.update({
  accessKeyId: "AKIAWOOXUJBRAAO2X55B",
  secretAccessKey: "83kzURMTq0GoLHJDl3GIFpX72S9rZkTK8mHGC64k",
  region: "ap-south-1", // e.g., "us-east-1"
});


const express = require("express");
const app = express();
const port = 3001;

// Your S3 bucket name
const BUCKET_NAME = "framefinder-photography-abey";
const cors = require("cors");
app.use(cors());
const s3 = new AWS.S3();
app.use(express.json());

// API Endpoint to Fetch Images
app.get("/api/images", async (req, res) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: "photos/", // Specify the folder
    };

    // Fetch the list of objects in the `photos/` folder
    const data = await s3.listObjectsV2(params).promise();
    
    // Generate URLs for each object
    const images = data.Contents.map((item) => {
      return {
        key: item.Key,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${item.Key}`, // Public URL of the object
      };
    });

    res.json({ success: true, data: images });
  } catch (error) {
    console.error("Error fetching images from S3:", error);
    res.status(500).json({ success: false, message: "Error fetching images" });
  }
});

// API EndPoint to Delete Images
// app.delete("*", (req, res) => {
//   res.status(404).send("Route not found");
//   next();
// });
app.delete("/api/images/:fileKey", async (req, res) => {
  console.log('here1');
  console.log("S3 Key to delete:", req.params);
  const { fileKey } = req.params; // Extract the key from the URL
  console.log("Received fileKey for deletion:", fileKey); // Debugging

  const fullKey = `photos/${fileKey}`;
  console.log("Processed fileKey for deletion:", fullKey);
  if (!fileKey) {
    return res.status(400).json({ error: "File key is required" });
  }

  const params = {
    Bucket: "framefinder-photography-abey",
    Key: fullKey, // Use the key received from the frontend
  };

  try {
    await s3.deleteObject(params).promise();
    res.status(200).json({ message: "File deleted successfully" });
    
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    if (error.code === "NoSuchKey") {
      return res.status(404).json({ error: "File not found in S3" });
    }
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});