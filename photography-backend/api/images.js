export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://photography-app-5osi.vercel.app"); // Allow your frontend
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    // Preflight request handling
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({ message: "List of images", data: [] });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}