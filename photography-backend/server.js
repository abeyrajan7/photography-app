require("dotenv").config({ path: "../.env" }); // Load from root
const { S3Client } = require("@aws-sdk/client-s3");
const AWS = require("aws-sdk");
// const multer = require("multer");
const cors = require("cors");
const express = require("express");
const app = express();
const port = 3001;
const { Client, Pool } = require("pg");

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_BUCKET_NAME ||
  !process.env.AWS_REGION
) {
  console.error("🚨 Missing AWS credentials in environment variables");
  throw new Error("AWS credentials are not set in environment variables.");
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "ap-south-1",
});

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

app.use(express.json());

app.use(cors());

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
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
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
      comments: [],
    }));
    // Fetch like counts for all images
    const likeCountsResult = await pool.query(
      "SELECT post_url, COUNT(*) as like_count FROM likes GROUP BY post_url"
    );

    // Fetch comments for all images
    const commentsResult = await pool.query(
      "SELECT id, image_key, user_email, comment FROM comments ORDER BY created_at DESC"
    );

    let commentsMap = {};
    commentsResult.rows.forEach((row) => {
      if (!commentsMap[row.image_key]) {
        commentsMap[row.image_key] = [];
      }
      commentsMap[row.image_key].push({
        id: row.id,
        user: row.user_email, // ✅ Store user email
        comment: row.comment, // ✅ Store comment text
      });
    });

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
      comments: commentsMap[img.key] || [],
    }));

    res.json({
      success: true,
      message: "Fetched images with like counts & comments",
      data: images,
    });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
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
      return res
        .status(400)
        .json({ error: "Missing required fields: user_id or image_key" });
    }

    // ✅ Remove the like from the database
    const result = await pool.query(
      `DELETE FROM likes WHERE user_id = $1 AND post_url = $2 RETURNING *;`,
      [user_id, image_key]
    );

    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: "Unliked successfully",
        like: result.rows[0],
      });
    } else {
      res.status(400).json({ success: false, message: "Like not found" });
    }
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

//add a comment
app.post("/api/comment", async (req, res) => {
  const { image_key, user_email, comment } = req.body;
  if (!image_key || !user_email || !comment) {
    return res
      .status(400)
      .json({ error: "Missing required fields: user_id or image_key" });
  }
  try {
    const result = await client.query(
      `INSERT INTO comments (image_key, user_email, comment, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *;`,
      [image_key, user_email, comment]
    );

    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: "commented successfully",
        like: result.rows[0],
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "User has already liked this image" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

//delete a comment
app.delete("/api/comment/:id", async (req, res) => {
  const commentId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM comments WHERE id = $1 RETURNING *",
      [commentId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("🚨 Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//save user
app.post("/api/saveUser", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await client.query(
      `INSERT INTO users (user_email, last_login, login_count)
       VALUES ($1, NOW(), 1)
       ON CONFLICT (user_email) 
       DO UPDATE SET last_login = NOW(), login_count = users.login_count + 1;`,
      [email]
    );

    res.status(200).json({ success: true, message: "User login recorded" });
  } catch (error) {
    console.error("🚨 Database error:", error);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

//like an image
app.post("/api/like", async (req, res) => {
  const { user_id, image_key } = req.body; // Access JSON body

  if (!user_id || !image_key) {
    return res
      .status(400)
      .json({ error: "Missing required fields: user_id or image_key" });
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
      res.json({
        success: true,
        message: "Liked successfully",
        like: result.rows[0],
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "User has already liked this image" });
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
