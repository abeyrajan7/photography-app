import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ✅ Initialize S3 Client (Uses Secure Environment Variables)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    console.log("🟢 Received upload request");

    // ✅ Get Form Data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      console.error("🚨 No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("✅ File received:", file.name);

    // ✅ Convert File to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // ✅ Upload File to S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `photos/${Date.now()}-${file.name}`, // Unique filename
      Body: fileBuffer,
      ContentType: file.type, // Set MIME type
    };

    await s3.send(new PutObjectCommand(params));
    console.log("✅ File uploaded to S3:", params.Key);

    // ✅ Construct the S3 URL
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: imageUrl, // Return the S3 URL to frontend
    });
  } catch (error) {
    console.error("🚨 Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// ✅ Required for handling file uploads in the App Router
export const config = {
  api: {
    bodyParser: false,
  },
};
