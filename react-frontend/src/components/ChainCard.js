import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';

const fmt = (n) => (n == null ? '—' : n.toString());
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function Spark({ points = [], max = 2000 }) {
  const w = 120, h = 28;
  if (!points.length) return <span className="spark-placeholder">—</span>;
  const step = w / Math.max(points.length - 1, 1);
  const path = points
    .map((p, i) => {
      const y = h - (clamp(p, 0, max) / max) * h;
      return `${i === 0 ? 'M' : 'L'}${i * step},${y}`;
    })
    .join(' ');
  const last = points[points.length - 1];
  return (
    <div className="spark-wrap">
      <svg width={w} height={h}><path d={path} fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      <span className="spark-last">{last}ms</span>
    </div>
  );
}

export default function ChainCard({ cfg }) {
  const [httpLatest, setHttpLatest] = useState(null);
  const [wsLatest, setWsLatest] = useState(null);
  const [lat, setLat] = useState([]);
  const wsRef = useRef(null);
  const httpProvRef = useRef(null);

  const addLatency = (ms) => setLat((xs) => [...xs.slice(-60), ms]);

  // HTTP / REST poller (every 4s)
  useEffect(() => {
    let timer;
    let stop = false;

    async function poll() {
      const t0 = performance.now();
      try {
        if (cfg.type === 'evm') {
          if (!httpProvRef.current) {
            httpProvRef.current = new ethers.providers.JsonRpcProvider(cfg.http);
          }
          const n = await httpProvRef.current.getBlockNumber();
          if (!stop) setHttpLatest(Number(n));
        } else if (cfg.type === 'cosmos') {
          const res = await fetch(`${cfg.rest}/cosmos/base/tendermint/v1beta1/blocks/latest`, { cache: 'no-store' });
          const data = await res.json();
          const height = Number(data.block.header.height);
          if (!stop) setHttpLatest(height);
        }
      } catch (e) {
        console.warn(cfg.title, 'HTTP/REST error', e);
      } finally {
        addLatency(Math.round(performance.now() - t0));
      }
    }

    poll();
    timer = setInterval(poll, 4000);

    return () => { stop = true; clearInterval(timer); };
  }, [cfg]);

  // WebSocket subscribe (EVM only: newHeads)
  useEffect(() => {
    if (cfg.type !== 'evm' || !cfg.ws) return;
    try {
      const ws = new WebSocket(cfg.ws);
      wsRef.current = ws;

      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_subscribe', params: ['newHeads'] }));
      });

      ws.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.method === 'eth_subscription' && msg.params?.result?.number) {
            const hex = msg.params.result.number;
            setWsLatest(parseInt(hex, 16));
          }
        } catch (e) {
          // ignore parse errors
        }
      });

      ws.addEventListener('error', (e) => console.warn(cfg.title, 'WS error', e));

      return () => { try { ws.close(); } catch {} };
    } catch (e) {
      console.warn(cfg.title, 'WS create error', e);
    }
  }, [cfg]);

  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">{cfg.title}</h3>
        <Spark points={lat} />
      </div>
      <div className="grid-2">
        <div>
          <div className="label">HTTP/REST latest</div>
          <div className="mono big">{fmt(httpLatest)}</div>
        </div>
        <div>
          <div className="label">WS newHeads</div>
          <div className="mono big">{cfg.type === 'evm' ? fmt(wsLatest) : '—'}</div>
        </div>
      </div>
      <div className="hint">
        {cfg.type === 'evm' ? 'ETH JSON-RPC via HTTP & WS' : 'Cosmos SDK REST (Tendermint)'}
      </div>
    </div>
  );
}
