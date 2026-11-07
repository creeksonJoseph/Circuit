import { APP_NAME, CLUSTER, PROGRAM_ID, RPC_URL } from "./lib/config.js";

export default function App() {
  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Solana · Anchor · Stage 1</p>
        <h1>{APP_NAME}</h1>
        <p className="tagline">Exchange beyond direct counterparties.</p>
      </header>

      <section className="card" aria-labelledby="status-heading">
        <h2 id="status-heading">Scaffold status</h2>
        <p>
          The React application, TypeScript matcher, and Python SDK scaffolds are in place. Offer
          creation, escrow, settlement, and matching are not implemented yet.
        </p>
      </section>

      <section className="card" aria-labelledby="config-heading">
        <h2 id="config-heading">Public configuration</h2>
        <dl className="config-list">
          <div>
            <dt>Cluster</dt>
            <dd>{CLUSTER}</dd>
          </div>
          <div>
            <dt>RPC URL</dt>
            <dd>{RPC_URL}</dd>
          </div>
          <div>
            <dt>Program ID</dt>
            <dd className="mono">{PROGRAM_ID}</dd>
          </div>
        </dl>
        <p className="note">
          These values come from public <code>VITE_*</code> environment variables. The browser never
          receives private key material.
        </p>
      </section>

      <footer>
        <p>CIRCUIT Stage 1 · No protocol logic implemented</p>
      </footer>
    </main>
  );
}
