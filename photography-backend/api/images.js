export default function handler(req, res) {
  if (req.method === "GET") {
    const images = [
      { id: 1, url: "https://example.com/image1.jpg", title: "Image 1" },
      { id: 2, url: "https://example.com/image2.jpg", title: "Image 2" },
      { id: 3, url: "https://example.com/image3.jpg", title: "Image 3" },
    ];
    res.status(200).json({ data: images });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}