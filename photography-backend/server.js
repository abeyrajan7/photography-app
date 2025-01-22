require('dotenv').config();

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "ap-south-1", // Use fallback if .env is not loaded
});

console.log("AWS_REGION:", process.env.AWS_REGION);
const express = require("express");
const app = express();
const port = 3001;

// Your S3 bucket name
const BUCKET_NAME = "framefinder-photography-abey";
const cors = require("cors");
app.use(cors());
const s3 = new AWS.S3();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the backend!");
});

app.get("/api/images", async (req, res) => {
  console.log("Here in server.js");
  const bucketName = "framefinder-photography-abey"; // Replace with your bucket name
  const prefix = "photos/"; // Folder prefix if your images are stored in a folder

  const params = {
    Bucket: bucketName,
    Prefix: prefix,
  };

  try {
    // Fetch the list of objects in the S3 bucket
    const data = await s3.listObjectsV2(params).promise();

    // Map the results to generate URLs
    const images = data.Contents.map((item) => ({
      url: `https://${bucketName}.s3.${s3.config.region}.amazonaws.com/${item.Key}`,
      title: item.Key.split("/").pop(), // Use the file name as the title
      key: item.Key,
    }));

    // Return the images as a response
    res.json({
      message: "List of images",
      data: images,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images from S3" });
  }
});




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