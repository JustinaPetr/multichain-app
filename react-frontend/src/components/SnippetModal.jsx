// src/components/SnippetModal.jsx
import React, { useMemo, useState } from 'react';

const curlFor = (http) => `curl -s -X POST '${http}' \\
  -H 'content-type: application/json' \\
  -d '{ "jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[] }'`;

const ethersFor = (http) => `import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider('${http}');
const block = await provider.getBlockNumber();
console.log('block', block);`;

export default function SnippetModal({ chains, onClose }) {
  const [key, setKey] = useState(chains[0]?.key);
  const chain = useMemo(() => chains.find(c => c.key === key), [chains, key]);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h3>RPC Code Snippets</h3>
          <button className="btn small" onClick={onClose}>Close</button>
        </header>

        <div className="row mt">
          <label>Chain</label>
          <select value={key} onChange={(e)=>setKey(e.target.value)}>
            {chains.map(c => <option key={c.key} value={c.key}>{c.title}</option>)}
          </select>
        </div>

        <div className="mt">
          <h4>CURL</h4>
          <pre className="mono small scroll">{curlFor(chain.http || chain.rest)}</pre>
        </div>

        <div className="mt">
          <h4>ethers.js</h4>
          <pre className="mono small scroll">{ethersFor(chain.http || '')}</pre>
        </div>

        <div className="card hint-wide mt">
          <p>Tip: These snippets use your actual Lava Gateway endpoints from <code>config.js</code>.</p>
        </div>
      </div>
    </div>
  );
}
