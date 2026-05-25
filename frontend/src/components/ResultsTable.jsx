import React from "react";

export default function ResultsTable({ results, searchedItem, zipCode }) {
  if (!results || results.length === 0) return null;

  const lowestPrice = results[0].price;

  return (
    <div className="results-wrapper">
      <div className="results-header">
        <h2>
          Price comparison for <span className="item-name">"{searchedItem}"</span>
        </h2>
        <p className="results-meta">
          {results.length} stores found near {zipCode} · sorted cheapest first
        </p>
      </div>

      <div className="results-table-scroll">
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Store</th>
              <th>Distance</th>
              <th>Item</th>
              <th>Unit</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className={i === 0 ? "row-best" : ""}>
                <td className="rank">
                  {i === 0 ? (
                    <span className="badge-best">Best</span>
                  ) : (
                    <span className="rank-num">{i + 1}</span>
                  )}
                </td>
                <td className="store-name">{r.store}</td>
                <td className="distance">{r.distance}</td>
                <td className="product-name">{r.productName || searchedItem}</td>
                <td className="unit">{r.unit}</td>
                <td className="price-cell">
                  <span className="price">${r.price.toFixed(2)}</span>
                  {r.originalPrice && (
                    <span className="original-price">${r.originalPrice.toFixed(2)}</span>
                  )}
                  {i > 0 && (
                    <span className="price-diff">
                      +${(r.price - lowestPrice).toFixed(2)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="results-footer">
        Prices shown in real-time from store inventory. Results may vary.
      </p>
    </div>
  );
}
