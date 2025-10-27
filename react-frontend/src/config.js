// config.js
export const CONFIG = {

  // NEW: global feature toggles (all optional)
  FEATURES: {
    explorer: true,
    balanceChecker: true,
    rpcBench: true,
    snippetGenerator: true,
  },

  CHAINS: [
    {
      key: 'eth',
      title: 'Ethereum (HTTP + WS)',
      type: 'evm',
      http: 'https://g.w.lavanet.xyz:443/gateway/eth/rpc-http/c4e67e1bdf22f6bca28c909d05621240',
      ws:   'wss://g.w.lavanet.xyz:443/gateway/eth/rpc/c4e67e1bdf22f6bca28c909d05621240',
    },
    {
      key: 'arbitrum',
      title: 'Arbitrum One (HTTP + WS)',
      type: 'evm',
      http: 'https://g.w.lavanet.xyz:443/gateway/arbitrum/rpc-http/c4e67e1bdf22f6bca28c909d05621240',

    },
    // Add more chains the same way (arbitrum, polygon, osmosis, etc.)
  ],
};
