// providers/kroger.js
// Phase 1 data source — Kroger Developer API (free)
// Covers: ~2,700 stores across 35 US states
// Best test zip codes: 77001 (Houston TX), 44101 (Cleveland OH), 30301 (Atlanta GA)

const axios = require("axios");

const KROGER_TOKEN_URL = "https://api.kroger.com/v1/connect/oauth2/token";
const KROGER_LOCATIONS_URL = "https://api.kroger.com/v1/locations";
const KROGER_PRODUCTS_URL = "https://api.kroger.com/v1/products";
const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

// ─── OAuth Token (cached) ────────────────────────────────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

async function getKrogerToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  try {
    const credentials = Buffer.from(
      `${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      KROGER_TOKEN_URL,
      "grant_type=client_credentials&scope=product.compact",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 60000;

    console.log("Kroger token acquired successfully");

    return cachedToken;
  } catch (err) {
    console.error("TOKEN ERROR STATUS:", err.response?.status);
    console.error("TOKEN ERROR DATA:", err.response?.data);
    throw err;
  }
};


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

// ─── Find Kroger stores near lat/lng ─────────────────────────────────────────
async function findNearbyStores(lat, lng, token, radius, storeCount) {
  const response = await axios.get(KROGER_LOCATIONS_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      "filter.lat.near": lat,
      "filter.lon.near": lng,
      "filter.radiusInMiles": radius,
      "filter.limit": storeCount,
    },
  });

  return response.data.data || [];
}

// ─── Get price for item at a specific store ───────────────────────────────────
async function getPriceAtStore(item, locationId, token) {
  try {
    const response = await axios.get(KROGER_PRODUCTS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        "filter.term": item,
        "filter.locationId": locationId,
        "filter.limit": 1,
      },
    });

    const products = response.data.data;
    if (!products || products.length === 0) return null;

    const product = products[0];
    const priceInfo = product.items?.[0]?.price;
    if (!priceInfo) return null;

    return {
      price: priceInfo.regular,
      salePrice: priceInfo.promo || null,
      unit: product.items?.[0]?.size || "each",
      productName: product.description,
    };
  } catch {
    return null;
  }
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
  const token = await getKrogerToken();
  const { lat, lng } = await geocodeZip(zipCode);
  const stores = await findNearbyStores(lat, lng, token, radius, storeCount);

  if (!stores.length) {
    throw new Error(
      `No Kroger-family stores found within ${radius} miles. Try zip codes: 77001 (Houston TX), 44101 (Cleveland OH), or 30301 (Atlanta GA). Phase 2 will cover Allentown PA.`
    );
  }

  const results = [];

  for (const store of stores) {
    const priceData = await getPriceAtStore(item, store.locationId, token);
    if (!priceData) continue;

    const storeLat = store.geolocation?.latitude;
    const storeLng = store.geolocation?.longitude;
    const distance =
      storeLat && storeLng
        ? calcDistance(lat, lng, storeLat, storeLng).toFixed(1) + " miles"
        : "unknown";

    const address = [
      store.address?.addressLine1,
      store.address?.city,
      store.address?.state,
    ]
      .filter(Boolean)
      .join(", ");

    results.push({
      store: store.chain || "Kroger",
      address,
      distance,
      price: priceData.salePrice || priceData.price,
      originalPrice: priceData.salePrice ? priceData.price : null,
      unit: priceData.unit,
      productName: priceData.productName,
      inStock: true,
    });
  }

  if (!results.length) {
    throw new Error(`No price data found for "${item}" at nearby stores.`);
  }

  // Sort by price ascending — cheapest first
  return results.sort((a, b) => a.price - b.price);
}

module.exports = { search };
