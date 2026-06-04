// providers/walmart.js
// Phase 2 data source — Walmart via RapidAPI (Real-Time Walmart Data)
// Covers: Walmart Supercenter + Walmart Neighborhood Market, national coverage
// Note: Walmart prices are nationally uniform — all nearby stores show the same price,
//       results are sorted by distance so the closest store appears first.
// Activate: set DATA_PROVIDER=walmart in backend/.env

const axios = require("axios");

const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const WALMART_SEARCH_URL = "https://real-time-walmart-data.p.rapidapi.com/search";

// ─── Geocode zip → lat/lng ────────────────────────────────────────────────────
async function geocodeZip(zipCode) {
  const response = await axios.get(GOOGLE_GEOCODE_URL, {
    params: {
      address: zipCode,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  const results = response.data.results;
  if (!results || results.length === 0) {
    throw new Error(`Could not geocode zip code: ${zipCode}`);
  }

  const { lat, lng } = results[0].geometry.location;
  return { lat, lng };
}

// ─── Find Walmart stores near lat/lng via Google Places ───────────────────────
async function findNearbyWalmarts(lat, lng, radius, storeCount) {
  const radiusMeters = Math.round(radius * 1609.34);

  const response = await axios.get(GOOGLE_PLACES_URL, {
    params: {
      location: `${lat},${lng}`,
      radius: radiusMeters,
      keyword: "walmart",
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  return (response.data.results || []).slice(0, storeCount);
}

// ─── Search Walmart product price via RapidAPI ────────────────────────────────
async function searchWalmartProduct(item) {
  const response = await axios.get(WALMART_SEARCH_URL, {
    params: { query: item, type: "search", page: "1" },
    headers: {
      "X-RapidAPI-Key": process.env.WALMART_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "real-time-walmart-data.p.rapidapi.com",
    },
  });

  const items = response.data?.data?.items || [];
  const product = items.find((p) => p.product_price) || items[0];
  if (!product) return null;

  const price = parseFloat(product.product_price?.replace(/[^0-9.]/g, ""));
  if (!price || isNaN(price)) return null;

  const originalPriceRaw = product.product_original_price;
  const originalPrice = originalPriceRaw
    ? parseFloat(originalPriceRaw.replace(/[^0-9.]/g, ""))
    : null;
  const hasSale = originalPrice && originalPrice > price;

  return {
    price,
    salePrice: hasSale ? price : null,
    regularPrice: hasSale ? originalPrice : price,
    unit: product.product_num_items_in_store_package || "each",
    productName: product.product_title,
  };
}

// ─── Calculate distance (Haversine) ──────────────────────────────────────────
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Main search function ─────────────────────────────────────────────────────
async function search(item, zipCode, options = {}) {
  const { radius = 10, storeCount = 5 } = options;
  const { lat, lng } = await geocodeZip(zipCode);

  // Fire both calls in parallel — store locations and product price are independent
  const [stores, productData] = await Promise.all([
    findNearbyWalmarts(lat, lng, radius, storeCount),
    searchWalmartProduct(item),
  ]);

  if (!stores.length) {
    throw new Error(`No Walmart stores found within ${radius} miles of ${zipCode}.`);
  }

  if (!productData) {
    throw new Error(`No price data found for "${item}" at Walmart.`);
  }

  const results = stores.map((place) => {
    const storeLat = place.geometry?.location?.lat;
    const storeLng = place.geometry?.location?.lng;
    const distanceMiles =
      storeLat && storeLng ? calcDistance(lat, lng, storeLat, storeLng) : null;

    return {
      store: "Walmart",
      address: place.vicinity || "",
      distance: distanceMiles !== null ? distanceMiles.toFixed(1) + " miles" : "unknown",
      price: productData.salePrice ?? productData.regularPrice,
      originalPrice: productData.salePrice ? productData.regularPrice : null,
      unit: productData.unit,
      productName: productData.productName,
      inStock: true,
      _sort: distanceMiles ?? 999,
    };
  });

  // Prices are uniform — rank by proximity
  results.sort((a, b) => a._sort - b._sort);
  results.forEach((r) => delete r._sort);

  return results;
}

module.exports = { search };
