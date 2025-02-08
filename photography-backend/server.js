require("dotenv").config({ path: "../.env" }); // Load from root
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const AWS = require("aws-sdk");
const multer = require("multer");
const cors = require("cors");
const express = require("express");
const app = express();
const port = 3001;
const { Client } = require('pg');
const { Pool } = require("pg");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "ap-south-1", // Useedd fallback if .env is not loaded
});


const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Your S3 bucket name
const BUCKET_NAME = "framefinder-photography-abey";


const allowedOrigins = [
  "http://localhost:3000", // ✅ Allow local development
  "https://photography-app-5osi.vercel.app", // ✅ Allow frontend in production
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // ✅ Set dynamic origin
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


app.use(express.json());

const s3 = new AWS.S3();
const client = new Client({
  connectionString: process.env.DATABASE_URL, // Use your Neon connection URL
});
client.connect();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});


const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is set in `.env`
  ssl: {
    rejectUnauthorized: false, // Required for managed databases like Neon.tech
  },
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
  
});

app.get("/", (req, res) => {
  res.send("Welcome to the backend!");
});



// get all images
app.get("/api/images", async (req, res) => {
  const bucketName = "framefinder-photography-abey"; // Your bucket name
  const prefix = "photos/"; // Folder prefix if images are stored in a folder
  const user_id = req.query.user_id; 


  const params = {
    Bucket: bucketName,
    Prefix: prefix,
  };

  try {
    // Fetch image list from S3
    const data = await s3.listObjectsV2(params).promise();

    let images = data.Contents.map((item) => ({
      url: `https://${bucketName}.s3.${s3.config.region}.amazonaws.com/${item.Key}`,
      title: item.Key.split("/").pop(),
      key: item.Key,
      likes: 0, // Default likes count
      liked: false, 
    }));



    // Fetch like counts for all images
    const likeCountsResult = await pool.query(
      "SELECT post_url, COUNT(*) as like_count FROM likes GROUP BY post_url"
    );

    // Convert database result to a map
    let likeCounts = {};
    likeCountsResult.rows.forEach((row) => {
      likeCounts[row.post_url] = parseInt(row.like_count, 10);
    });

    // Fetch user's liked images (if logged in)
    let likedImages = new Set();
    if (user_id) {
    
      const likesResult = await pool.query(
        "SELECT post_url FROM likes WHERE user_id = $1",
        [user_id]
      );
    
    
      likedImages = new Set(likesResult.rows.map((row) => row.post_url));
    
    }
    // Update images with like count and liked status
    images = images.map((img) => ({
      ...img,
      likes: likeCounts[img.key] || 0, // Assign like count or default to 0
      liked: likedImages.has(img.key), // Check if the user liked this image
    }));

    
    res.json({ success: true, message: "Fetched images with like counts", data: images });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

//upload a new image
app.post("/api/image/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `photos/${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    console.log("Uploading file:", uploadParams);
    await s3Client.send(new PutObjectCommand(uploadParams));

    const imageUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    console.log("Uploaded to:", imageUrl);

    // res.setHeader("Access-Control-Allow-Origin", allowedOrigins);
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});


// delete an image
app.delete("/api/images/:fileKey", async (req, res) => {
  const { fileKey } = req.params;

  if (!fileKey) {
    return res.status(400).json({ error: "File key is required" });
  }

  const fullKey = `photos/${fileKey}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME || "framefinder-photography-abey", // Use env variable
    Key: fullKey, // Use the key received from the frontend
  };

  try {
    await s3.deleteObject(params).promise();
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file from S3:", error);

    // Handle specific errors
    if (error.code === "NoSuchKey") {
      return res.status(404).json({ error: "File not found in S3" });
    } else if (error.code === "AccessDenied") {
      return res.status(403).json({ error: "Access denied to S3 bucket" });
    }

    // General error response
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// unlike an image
app.delete("/api/unlike", async (req, res) => {
  try {
    const { user_id, image_key } = req.body; // Extract JSON body

    if (!user_id || !image_key) {
      return res.status(400).json({ error: "Missing required fields: user_id or image_key" });
    }

    // ✅ Remove the like from the database
    const result = await pool.query(
      `DELETE FROM likes WHERE user_id = $1 AND post_url = $2 RETURNING *;`,
      [user_id, image_key]
    );

    if (result.rowCount > 0) {
      res.json({ success: true, message: "Unliked successfully", like: result.rows[0] });
    } else {
      res.status(400).json({ success: false, message: "Like not found" });
    }
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});


app.post("/api/like", async (req, res) => {
  const { user_id, image_key } = req.body; // Access JSON body

  if (!user_id || !image_key) {
    return res.status(400).json({ error: "Missing required fields: user_id or image_key" });
  }

  try {
    const result = await client.query(
      `INSERT INTO likes (user_id, post_url, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, post_url) DO NOTHING
       RETURNING *;`,
      [user_id, image_key]
    );

    if (result.rowCount > 0) {
      res.json({ success: true, message: "Liked successfully", like: result.rows[0] });
    } else {
      res.status(400).json({ success: false, message: "User has already liked this image" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});