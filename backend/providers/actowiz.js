// providers/actowiz.js
// Phase 3 data source — Actowiz or Datarade (~$100–200/month)
// Covers: All 50 states, all major chains incl. Costco, Aldi, Trader Joe's
// Activate: set DATA_PROVIDER=actowiz in .env

async function search(item, zipCode) {
  // TODO: Implement Actowiz API integration
  throw new Error("Actowiz provider (Phase 3) not yet implemented. Set DATA_PROVIDER=kroger to use Phase 1.");
}

module.exports = { search };
