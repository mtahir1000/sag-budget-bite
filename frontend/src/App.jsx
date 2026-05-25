import React, { useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultsTable from "./components/ResultsTable";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "";

export default function App() {
  const [results, setResults] = useState(null);
  const [searchedItem, setSearchedItem] = useState("");
  const [searchedZip, setSearchedZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(item, zipCode, radius, storeCount) {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, zipCode, radius, storeCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed. Please try again.");
      }

      setResults(data.results);
      setSearchedItem(data.searchedItem);
      setSearchedZip(data.zipCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🛒</span>
            <div>
              <h1>Budget Bite</h1>
              <p>Find the lowest grocery prices near you</p>
            </div>
          </div>
          <div className="phase-badge">Phase 1 · Kroger Network</div>
        </div>
      </header>

      <main className="app-main">
        <div className="search-card">
          <SearchForm onSearch={handleSearch} loading={loading} />
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Checking prices at nearby stores…</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <strong>No results found</strong>
            <p>{error}</p>
          </div>
        )}

        {results && !loading && (
          <ResultsTable
            results={results}
            searchedItem={searchedItem}
            zipCode={searchedZip}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Budget Bite · SAG IT Consulting · Phase 1 covers Kroger-family stores in 35 states</p>
      </footer>
    </div>
  );
}
