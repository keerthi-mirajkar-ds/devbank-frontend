import React, { useEffect, useState } from "react";

import "./styles.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function App() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/summary`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("The API returned an unexpected response.");
        }

        setSummary(await response.json());
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("Unable to load account data.");
        }
      }
    }

    loadSummary();

    return () => controller.abort();
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">DevBank</p>
          <h1>Account overview</h1>
        </div>
        <span className="status">Live</span>
      </header>

      {error && <p className="error">{error}</p>}

      {!summary && !error && <p className="loading">Loading account data...</p>}

      {summary && (
        <>
          <section className="balance-panel">
            <span>Total balance</span>
            <strong>{formatCurrency(summary.totalBalance)}</strong>
            <small>{summary.customer}</small>
          </section>

          <section className="content-grid">
            <div>
              <h2>Accounts</h2>
              <div className="list">
                {summary.accounts.map((account) => (
                  <article key={account.id} className="row-item">
                    <div>
                      <strong>{account.type}</strong>
                      <span>{account.id}</span>
                    </div>
                    <b>{formatCurrency(account.balance)}</b>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h2>Recent transactions</h2>
              <div className="list">
                {summary.transactions.map((transaction) => (
                  <article key={transaction.id} className="row-item">
                    <div>
                      <strong>{transaction.merchant}</strong>
                      <span>{transaction.id}</span>
                    </div>
                    <b className={transaction.direction}>
                      {transaction.direction === "debit" ? "-" : "+"}
                      {formatCurrency(transaction.amount)}
                    </b>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
