// // src/app/api/images/route.js (App Directory)
// import AWS from "aws-sdk";

// const s3 = new AWS.S3({
//   region: "ap-south-1",
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// export default async  function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "https://photography-app-5osi.vercel.app"); // Allow your frontend
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   res.setHeader("Access-Control-Allow-Credentials", "true");

//   if (req.method === "OPTIONS") {
//     // Preflight request handling
//     res.status(200).end();
//     return;
//   }

//   if (req.method === "GET") {
//     try {
//       const params = {
//         Bucket: "your-s3-bucket-name",
//         Prefix: "photos/", // Folder containing images in S3
//       };
//       console.log("here");
//       const data = await s3.listObjectsV2(params).promise();
//       console.log("S3 Data Contents:", data.Contents);

//       if (!data.Contents || data.Contents.length === 0) {
//         console.warn("No files found in S3 bucket.");
//         return res.status(200).json({ message: "List of images", data: [] });
//       }
      
//       const images = data.Contents.map((item) => ({
//         url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${item.Key}`,
//         title: item.Key.split("/").pop(), // Use the file name as the title
//       }));

//       res.status(200).json({ message: "List of images", data: images });
//     } catch (error) {
//       console.error("Error fetching images:", error);
//       res.status(500).json({ error: "Failed to fetch images" });
//     }
//   } else {
//     res.setHeader("Allow", ["GET"]);
//     res.status(405).json({ error: "Method not allowed" });
//   }
// }