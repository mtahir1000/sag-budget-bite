// providers/bluecart.js
// Phase 2 data source — BlueCart API (~$50–100/month)
// Covers: Wegmans, Giant, Walmart, Whole Foods, Target, Safeway
// Includes Allentown PA coverage
// Activate: set DATA_PROVIDER=bluecart in .env

const axios = require("axios");

async function search(item, zipCode) {
  // TODO: Implement BlueCart API integration
  // Docs: https://rapidapi.com/bluecart/api/bluecart
  throw new Error("BlueCart provider (Phase 2) not yet implemented. Set DATA_PROVIDER=kroger to use Phase 1.");
}

module.exports = { search };
