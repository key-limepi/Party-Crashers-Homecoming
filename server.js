// local test server, run it with: npm start
// on vercel this file is not used, vercel serves public/ and api/ by itself
const http = require("http");
const fs = require("fs");
const path = require("path");
const handler = require("./api/index.js");

const PORT = Number(process.argv[2] || process.env.PORT || 8000);
const PUBLIC_DIR = path.join(__dirname, "public");

const FILE_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
};

// send a file from the public folder
function serveFile(urlPath, res) {
  let filePath;
  try {
    filePath = path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : decodeURIComponent(urlPath));
  } catch (err) {
    res.statusCode = 400;
    return res.end("bad request");
  }
  // never leave the public folder
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.statusCode = 403;
    return res.end("nope");
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.statusCode = 404;
      return res.end("not found");
    }
    const type = FILE_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.setHeader("Content-Type", type);
    // always load fresh code while testing
    if ([".html", ".js", ".css"].includes(path.extname(filePath))) res.setHeader("Cache-Control", "no-store");
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, "http://localhost").pathname;
  const isApi = urlPath.startsWith("/api/") || urlPath === "/login" || urlPath === "/logout";
  if (isApi) return handler(req, res);
  serveFile(urlPath, res);
});

server.listen(PORT, () => {
  console.log(`party crashers homecoming is LIVE at http://localhost:${PORT} !!`);
  console.log("friends on your wifi: use your computer's IP instead of localhost!!");
});
