// App.js
import React, { useMemo } from 'react';
import './App.css';

// Existing
import ChainCard from './components/ChainCard';

// Panels
import ExplorerPanel from './components/ExplorerPanel';
import BalancePanel from './components/BalancePanel';
import RpcBench from './components/RpcBench';

import { CONFIG } from './config';

function App() {
  const chains = useMemo(() => CONFIG.CHAINS, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1 className="title">Multichain Liveboard</h1>
          <p className="subtitle">Transactions, Blocks, WS newHeads & latency — powered by Lava RPC API endpoints</p>
        </div>
      </header>

      <main className="container">
        {/* NOTE: toolbar removed (no wallet connect / tx / snippets) */}

        {/* Universal Explorer */}
        {CONFIG.FEATURES?.explorer && (
          <section className="card">
            <h2>Explorer</h2>
            <p className="small">Search by address, tx hash, or block height across your configured chains.</p>
            <ExplorerPanel chains={chains} />
          </section>
        )}

        {/* Cross-chain balance view */}
        {CONFIG.FEATURES?.balanceChecker && (
          <section className="card">
            <h2>Cross-chain Balance</h2>
            <p className="small">Paste an address (EVM 0x… or bech32 for non-EVM chains if added) to fetch balances.</p>
            <BalancePanel chains={chains} />
          </section>
        )}

        {/* RPC mini-benchmark */}
        {CONFIG.FEATURES?.rpcBench && (
          <section className="card">
            <h2>RPC Mini-Bench</h2>
            <p className="small">Run JSON-RPC reads (blockNumber, gasPrice) and compare latency across EVM chains.</p>
            <RpcBench chains={chains} />
          </section>
        )}

        {/* Chain cards */}
        <div className="grid">
          {chains.map((c) => (
            <ChainCard key={c.key} cfg={c} />
          ))}
        </div>

        <div className="card hint-wide">
          <p>
            Learn more about Lava Network on Lava Network Documentation: https://docs.lavanet.xyz
          </p>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>Powered by Lava Network</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
