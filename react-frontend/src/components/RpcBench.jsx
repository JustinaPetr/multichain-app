// src/components/RpcBench.jsx
import React, { useState } from 'react';

async function jrpcCall(url, method, params = []) {
  const t0 = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  const t1 = performance.now();
  return { ms: Math.round(t1 - t0), json };
}

export default function RpcBench({ chains }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const methods = ['eth_blockNumber', 'eth_gasPrice'];

  const run = async () => {
    setLoading(true);
    try {
      const evmChains = chains.filter(c => c.type === 'evm');
      const tasks = [];
      for (const c of evmChains) {
        for (const m of methods) {
          tasks.push(
            jrpcCall(c.http, m).then((r) => ({
              chain: c.title,
              method: m,
              ms: r.ms,
              result: r.json?.result,
              error: r.json?.error?.message,
            })).catch((e) => ({
              chain: c.title, method: m, ms: '-', result: '-', error: e?.message || 'failed'
            }))
          );
        }
      }
      setRows(await Promise.all(tasks));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="btn" onClick={run} disabled={loading}>{loading ? 'Running…' : 'Run Bench'}</button>
      {!!rows.length && (
        <table className="table mt">
          <thead>
            <tr><th>Chain</th><th>Method</th><th>Latency (ms)</th><th>Result</th><th>Error</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.chain}</td>
                <td><code>{r.method}</code></td>
                <td>{r.ms}</td>
                <td className="mono small">{String(r.result)}</td>
                <td className="small">{r.error || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
