require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mondo DB connected"))
  .catch((err) => console.log("Can't connect to the Database:", err));

// ROOT ROUTE — must be on `app` directly, not inside the /api router
// This is what serves http://localhost:5000/
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>URL Shortener API</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, sans-serif; background: #f5f5f5; color: #111; padding: 2rem; }
        h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
        p.sub { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
        .route { display: flex; align-items: center; gap: 1rem; background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 0.85rem 1.2rem; margin-bottom: 0.6rem; text-decoration: none; color: inherit; transition: box-shadow 0.15s; }
        .route:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .badge { font-size: 0.7rem; font-weight: 600; padding: 3px 9px; border-radius: 6px; min-width: 56px; text-align: center; letter-spacing: 0.03em; }
        .GET    { background: #e6f4ea; color: #1a6b35; }
        .POST   { background: #e8f0fe; color: #1a56b0; }
        .DELETE { background: #fce8e8; color: #a32d2d; }
        .path { font-family: monospace; font-size: 0.95rem; }
        .desc { margin-left: auto; font-size: 0.85rem; color: #777; }
      </style>
    </head>
    <body>
      <h1> URL Shortener API</h1>
      <p class="sub">All available routes — click GET routes to open them directly.</p>
 
      <a class="route" href="/">
        <span class="badge GET">GET</span>
        <span class="path">/</span>
        <span class="desc">This page</span>
      </a>
 
      <a class="route" href="/api/links">
        <span class="badge GET">GET</span>
        <span class="path">/api/links</span>
        <span class="desc">List all shortened URLs</span>
      </a>
 
      <a class="route" href="/api/stats">
        <span class="badge GET">GET</span>
        <span class="path">/api/stats</span>
        <span class="desc">Total links, clicks & today's stats</span>
      </a>
 
      <div class="route">
        <span class="badge POST">POST</span>
        <span class="path">/api/shorten</span>
        <span class="desc">Shorten a URL — use Postman or fetch</span>
      </div>
 
      <div class="route">
        <span class="badge DELETE">DELETE</span>
        <span class="path">/api/links/:id</span>
        <span class="desc">Delete a link by MongoDB ID</span>
      </div>
 
      <div class="route">
        <span class="badge GET">GET</span>
        <span class="path">/:code</span>
        <span class="desc">Redirect short code → original URL</span>
      </div>
    </body>
    </html>
  `);
});

const linkRoutes = require("./routes/links");
app.use("/api", linkRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
