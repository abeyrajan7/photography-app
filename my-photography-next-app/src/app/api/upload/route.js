import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


// ✅ Ensure AWS Credentials Are Loaded
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) {
  console.error("🚨 Missing AWS credentials in environment variables");
  throw new Error("AWS credentials are not set in environment variables.");
}

// ✅ Initialize S3 Client (Uses Secure Environment Variables)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// export async function POST(req) {
//   try {
//     console.log("🟢 Received upload request");

//     // ✅ Get Form Data
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       console.error("🚨 No file uploaded");
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     console.log("✅ File received:", file.name);

//     // ✅ Convert File to Buffer
//     const fileBuffer = Buffer.from(await file.arrayBuffer());

//     // ✅ Upload File to S3
//     const params = {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: `photos/${Date.now()}-${file.name}`, // Unique filename
//       Body: fileBuffer,
//       ContentType: file.type, // Set MIME type
//     };

//     await s3.send(new PutObjectCommand(params));
//     console.log("✅ File uploaded to S3:", params.Key);

//     // ✅ Construct the S3 URL
//     const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

//     return NextResponse.json({
//       success: true,
//       message: "File uploaded successfully",
//       url: imageUrl, // Return the S3 URL to frontend
//     });
//   } catch (error) {
//     console.error("🚨 Upload Error:", error);
//     return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
//   }
// }


export async function GET(req) {
  try {
    console.log("🟢 Received request for presigned URL");

    // ✅ Get filename & type from query params
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");
    const fileType = searchParams.get("fileType");

    if (!filename || !fileType) {
      console.error("🚨 Missing filename or fileType in request");
      return NextResponse.json({ error: "Missing filename or fileType" }, { status: 400 });
    }

    console.log("🟢 Generating presigned URL for file:", filename);

    // ✅ Generate unique key for S3
    const s3Key = `photos/${Date.now()}-${filename}`;

    // ✅ Create a signed URL for direct upload
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
    });

    // ✅ FIX: Ensure `expiresIn` is a **number** (60 seconds)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    console.log("✅ Generated presigned URL:", uploadUrl);

    return NextResponse.json({
      success: true,
      uploadUrl, // Presigned URL for direct upload
      key: s3Key, // File path in S3
      fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
    });
  } catch (error) {
    console.error("🚨 Presigned URL Error:", error);
    return NextResponse.json({ error: "Failed to generate presigned URL", details: error.message }, { status: 500 });
  }
}
