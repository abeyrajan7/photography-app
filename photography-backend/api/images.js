const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "GET") {
    console.log("Here in images.js");
    try {
      const params = { Bucket: "framefinder-photography-abey", Prefix: "photos/" };
      const data = await s3.listObjectsV2(params).promise();
      const images = data.Contents.map((item) => ({
        url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${item.Key}`,
        title: item.Key.split("/").pop(),
        key: item.Key,
      }));
      
      res.status(200).json({ message: "List of images", data: images });
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
