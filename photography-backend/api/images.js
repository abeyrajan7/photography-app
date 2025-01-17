export default async function handler(req, res) {
    if (req.method === "GET") {
      res.json({ message: "List of images" });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  }