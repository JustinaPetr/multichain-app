// src/components/ExplorerPanel.jsx
import React, { useMemo, useState } from 'react';
import { ethers } from 'ethers';

const isHex64 = (s) => /^0x[a-fA-F0-9]{64}$/.test(s);
const isNumber = (s) => /^\d+$/.test(s);

export default function ExplorerPanel({ chains }) {
  const [query, setQuery] = useState('');
  const [chainKey, setChainKey] = useState(chains[0]?.key);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const chain = useMemo(() => chains.find(c => c.key === chainKey), [chains, chainKey]);

  const run = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const q = query.trim();
      if (!q) throw new Error('Enter an address, tx hash or block height.');

      if (chain.type === 'evm') {
        const provider = new ethers.providers.JsonRpcProvider(chain.http);
        if (ethers.utils.isAddress(q)) {
          const [bal, nonce, code] = await Promise.all([
            provider.getBalance(q),
            provider.getTransactionCount(q),
            provider.getCode(q),
          ]);
          setResult({
            kind: 'address',
            balance: ethers.utils.formatEther(bal),
            nonce,
            isContract: code && code !== '0x',
            address: q,
          });
        } else if (isHex64(q)) {
          const [tx, receipt] = await Promise.all([
            provider.getTransaction(q),
            provider.getTransactionReceipt(q),
          ]);
          setResult({ kind: 'tx', tx, receipt });
        } else if (isNumber(q)) {
          const block = await provider.getBlock(parseInt(q, 10));
          setResult({ kind: 'block', block });
        } else {
          throw new Error('Unrecognized input. Use address / tx hash / block number.');
        }
      } else if (chain.type === 'cosmos') {
        // Cosmos REST endpoints (Tendermint/Bank/Tx)
        const base = chain.rest.replace(/\/$/, '');
        if (isHex64(q)) {
          const r = await fetch(`${base}/cosmos/tx/v1beta1/txs/${q}`);
          const data = await r.json();
          setResult({ kind: 'tx', data });
        } else if (isNumber(q)) {
          const r = await fetch(`${base}/cosmos/base/tendermint/v1beta1/blocks/${q}`);
          const data = await r.json();
          setResult({ kind: 'block', data });
        } else if (/^(cosmos|osmo|juno|noble|celestia|stride)[0-9a-z]+/.test(q)) {
          const r = await fetch(`${base}/cosmos/bank/v1beta1/balances/${q}`);
          const data = await r.json();
          setResult({ kind: 'address', data });
        } else {
          throw new Error('Unrecognized input for Cosmos. Use bech32 address / tx hash / block height.');
        }
      } else {
        throw new Error('Unknown chain type.');
      }
    } catch (e) {
      setError(e?.message ?? 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    if (result.kind === 'address' && chain.type === 'evm') {
      return (
        <div className="mono small">
          <p><b>Address:</b> {result.address}</p>
          <p><b>Balance:</b> {result.balance} {chain.symbol || ''}</p>
          <p><b>Tx Count:</b> {result.nonce}</p>
          <p><b>Type:</b> {result.isContract ? 'Contract' : 'EOA'}</p>
        </div>
      );
    }
    if (result.kind === 'tx') {
      return (
        <pre className="mono small scroll">{JSON.stringify(result.tx || result.data, null, 2)}</pre>
      );
    }
    if (result.kind === 'block') {
      return (
        <pre className="mono small scroll">{JSON.stringify(result.block || result.data, null, 2)}</pre>
      );
    }
    if (result.kind === 'address' && chain.type === 'cosmos') {
      return (
        <pre className="mono small scroll">{JSON.stringify(result.data, null, 2)}</pre>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="row">
        <select value={chainKey} onChange={(e) => setChainKey(e.target.value)}>
          {chains.filter(c=>c.supportsSearch!==false).map((c) => (
            <option key={c.key} value={c.key}>{c.title}</option>
          ))}
        </select>
        <input
          className="input"
          placeholder={`Address / tx hash / block height (ex: ${chain?.sampleAddress || '0x... / 123456'})`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
        />
        <button className="btn" onClick={run} disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
      </div>
      {error && <div className="alert alert-error mt">{error}</div>}
      {result && <div className="card mt">{renderResult()}</div>}
    </div>
  );
}
