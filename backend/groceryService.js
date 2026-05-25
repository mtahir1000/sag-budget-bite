// groceryService.js
// DO NOT MODIFY — This file must remain provider-agnostic.
// Swap providers by changing DATA_PROVIDER in .env only.

const provider = require(`./providers/${process.env.DATA_PROVIDER}`);

async function searchPrices(item, zipCode, options = {}) {
  return await provider.search(item, zipCode, options);
}

module.exports = { searchPrices };
