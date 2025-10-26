// src/components/BalancePanel.jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';

export default function BalancePanel({ chains }) {
  const [addr, setAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setError(''); setRows([]);
    try {
      const tasks = chains.map(async (c) => {
        try {
          if (c.type === 'evm' && ethers.utils.isAddress(addr)) {
            const provider = new ethers.providers.JsonRpcProvider(c.http);
            const bal = await provider.getBalance(addr);
            return { chain: c.title, value: `${ethers.utils.formatEther(bal)} ${c.symbol || ''}` };
          }
          if (c.type === 'cosmos' && /^(cosmos|osmo|juno|noble|celestia|stride)[0-9a-z]+/.test(addr)) {
            const base = c.rest.replace(/\/$/, '');
            const r = await fetch(`${base}/cosmos/bank/v1beta1/balances/${addr}`);
            const data = await r.json();
            const coins = (data?.balances || []).map(b => `${b.amount} ${b.denom}`).join(', ') || '0';
            return { chain: c.title, value: coins };
          }
          return { chain: c.title, value: '— (address format not supported)' };
        } catch (e) {
          return { chain: c.title, value: `Error: ${e?.message || 'failed'}` };
        }
      });
      setRows(await Promise.all(tasks));
    } catch (e) {
      setError(e?.message ?? 'Balance fetch failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <input
          className="input"
          placeholder="Paste an EVM (0x...) or Cosmos (cosmos1...) address"
          value={addr}
          onChange={(e) => setAddr(e.target.value.trim())}
          onKeyDown={(e) => e.key === 'Enter' && run()}
        />
        <button className="btn" onClick={run} disabled={loading}>{loading ? 'Fetching…' : 'Check'}</button>
      </div>
      {error && <div className="alert alert-error mt">{error}</div>}
      {!!rows.length && (
        <table className="table mt">
          <thead>
            <tr><th>Chain</th><th>Balance</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}><td>{r.chain}</td><td className="mono">{r.value}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
