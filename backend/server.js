require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { searchPrices } = require("./groceryService");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    provider: process.env.DATA_PROVIDER || "not set",
    timestamp: new Date().toISOString(),
  });
});

// Main search endpoint
app.post("/api/search", async (req, res) => {
  const { item, zipCode, radius, storeCount } = req.body;

  if (!item || !zipCode) {
    return res.status(400).json({ error: "item and zipCode are required" });
  }

  if (!/^\d{5}$/.test(zipCode)) {
    return res.status(400).json({ error: "zipCode must be a 5-digit US zip code" });
  }

  const options = {
    radius: Math.min(10, Math.max(5, Number(radius) || 10)),
    storeCount: Math.min(10, Math.max(3, Number(storeCount) || 5)),
  };

  try {
    const results = await searchPrices(item.trim(), zipCode.trim(), options);
    res.json({
      results,
      provider: process.env.DATA_PROVIDER,
      searchedItem: item.trim(),
      zipCode: zipCode.trim(),
    });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({
      error: err.message || "Search failed. Please try again.",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Budget Bite backend running on port ${PORT}`);
  console.log(`Active provider: ${process.env.DATA_PROVIDER}`);
});
