// config.js
export const CONFIG = {
  TX_CHAIN: {
    chainIdDec: 11155111,
    chainIdHex: '0xaa36a7',
    name: 'Sepolia (ETH testnet)',
  },

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

      // NEW metadata (optional but recommended)
      chainIdDec: 1,
      symbol: 'ETH',
      explorerBase: 'https://etherscan.io',  // for nice links
      sampleAddress: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
      supportsSearch: true,
      supportsGas: true,
    },
    {
      key: 'arbitrum',
      title: 'Arbitrum One (HTTP + WS)',
      type: 'evm',
      http: 'https://g.w.lavanet.xyz:443/gateway/arbitrum/rpc-http/c4e67e1bdf22f6bca28c909d05621240',

      // NEW metadata
      chainIdDec: 42161,
      symbol: 'ETH',
      explorerBase: 'https://arbiscan.io',
      sampleAddress: '0x0000000000000000000000000000000000000000',
      supportsSearch: true,
      supportsGas: true,
    },
    // Add more chains the same way (arbitrum, polygon, osmosis, etc.)
  ],
};
