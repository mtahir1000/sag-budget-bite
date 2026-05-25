import React, { useState } from "react";

export default function SearchForm({ onSearch, loading }) {
  const [item, setItem] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState(10);
  const [storeCount, setStoreCount] = useState(5);

  function handleSubmit(e) {
    e.preventDefault();
    if (!item.trim() || !zipCode.trim()) return;
    onSearch(item.trim(), zipCode.trim(), radius, storeCount);
  }

  function adjustCount(delta) {
    setStoreCount((prev) => Math.min(10, Math.max(3, prev + delta)));
  }

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-row">
        <div className="input-group">
          <label htmlFor="item">Grocery item</label>
          <input id="item" type="text" placeholder="e.g. whole milk, eggs, bread" value={item} onChange={(e) => setItem(e.target.value)} disabled={loading} required />
        </div>
        <div className="input-group input-group--zip">
          <label htmlFor="zip">Zip code</label>
          <input id="zip" type="text" placeholder="e.g. 77001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={5} pattern="\d{5}" disabled={loading} required />
        </div>
        <button type="submit" className="search-btn" disabled={loading || !item || !zipCode}>
          {loading ? "Searching..." : "Compare prices"}
        </button>
      </div>

      <div className="search-controls">
        <div className="control-group">
          <label htmlFor="radius">Search radius</label>
          <div className="slider-row">
            <span className="range-end">5 mi</span>
            <input id="radius" type="range" min={5} max={10} step={1} value={radius} onChange={(e) => setRadius(Number(e.target.value))} disabled={loading} />
            <span className="range-end">10 mi</span>
            <span className="control-value">{radius} miles</span>
          </div>
        </div>

        <div className="control-group control-group--counter">
          <label>Number of stores</label>
          <div className="counter">
            <button type="button" className="counter-btn" onClick={() => adjustCount(-1)} disabled={storeCount <= 3 || loading}>−</button>
            <span className="counter-value">{storeCount}</span>
            <button type="button" className="counter-btn" onClick={() => adjustCount(1)} disabled={storeCount >= 10 || loading}>+</button>
          </div>
          <span className="counter-hint">stores (3–10)</span>
        </div>
      </div>
    </form>
  );
}
