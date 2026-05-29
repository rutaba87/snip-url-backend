const express = require("express");
const router = express.Router();

const Url = require("../models/url");
const { nanoid } = require("nanoid");

// ROUTE 1: Shorten a URL
// POST /api/shorten
// React sends: { originalUrl: "https://very-long-url.com" }
// We send back: { shortCode: "xK9mP", shortUrl: "http://localhost:5000/xK9mP" }
router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "Original Url is required!" });
    }

    const shortCode = nanoid(6);

    const newUrl = await Url.create({
      originalUrl,
      shortCode,
    });

    res.status(201).json({
      _id: newUrl._id,
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      shortUrl: `${process.env.BASE_URL}${newUrl.shortCode}`,
      clicks: newUrl.clicks,
      createdAt: newUrl.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── ROUTE 3: Get all links ─────────────────────────────────
// GET /api/links
// React fetches this to display the list of all shortened URLs

router.get("/links", async (req, res) => {
  try {
    const urls = await Url.find() // get ALL documents from the urls collection
      .sort({ createdAt: -1 }) // newest first (-1 = descending)
      .limit(50); // max 50 results

    res.json(urls);
    // res.json() automatically sets Content-Type: application/json
    // and converts the array to a JSON string
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ── ROUTE 4: Get stats ────────────────────────────────────
// GET /api/stats
// Returns total links, total clicks, clicks today

router.get("/stats", async (req, res) => {
  try {
    const totalLinks = await Url.countDocuments();
    // countDocuments = count how many documents exist (like .length on an array)

    // aggregate = run a calculation across all documents
    // like .reduce() but for MongoDB
    const clicksResult = await Url.aggregate([
      { $group: { _id: null, total: { $sum: "$clicks" } } },
      // $group groups all documents together
      // $sum adds up all the clicks fields
    ]);

    const totalClicks = clicksResult[0]?.total || 0;

    // Clicks today — filter by today's date
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // midnight of today
    const todayClicks = await Url.countDocuments({
      createdAt: { $gte: todayStart }, // $gte = greater than or equal to
    });

    res.json({ totalLinks, totalClicks, todayClicks });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ── ROUTE 5: Delete a link ────────────────────────────────
// DELETE /api/links/:id
// React sends the MongoDB _id of the link to delete

router.delete("/links/:id", async (req, res) => {
  try {
    const { id } = req.params; // get the :id from the URL

    const deleted = await Url.findByIdAndDelete(id);
    // findByIdAndDelete = find document by MongoDB _id and remove it
    // returns the deleted document, or null if not found

    if (!deleted) {
      return res.status(404).json({ error: "Link not found" });
    }

    res.json({ message: "Link deleted", id });
    // send back confirmation
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ── ROUTE 2: Redirect short URL → original URL
// GET /:code  (e.g. GET /xK9mP)
// This is what makes URL shorteners actually work

router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const found = await Url.findOne({ shortCode: code });

    if (!found) {
      return res.status(400).json({ error: "Short Url not found!" });
    }

    found.clicks = found.clicks + 1;
    await found.save();

    res.redirect(found.originalUrl);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
