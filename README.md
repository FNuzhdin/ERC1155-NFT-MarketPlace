# ERC1155-NFT-MarketPlace Tech Stack

| Category                      | Technologies / Tools                              | Description / Purpose                                       |
| ----------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| **Frontend**                  | Next.js (App Router)                              | SSR/SPA framework, routing                                  |
|                               | React 19                                          | UI library                                                  |
|                               | TypeScript                                        | Static typing                                               |
|                               | Wagmi                                             | Web3 hooks, Ethereum interaction                            |
|                               | ethers.js                                         | Ethereum JS/TS library                                      |
|                               | viem                                              | Type-safe web3 operations                                   |
|                               | @tanstack/react-query                             | Async data fetching, caching                                |
|                               | Pinata/IPFS                                       | Decentralized storage for metadata and files                |
|                               | React Icons                                       | UI icon library                                             |
|                               | JSDoc                                             | Code documentation (JS/TS)                                  |
|                               | Markdown                                          | Docs, README, code docs                                     |
| **Backend / Smart Contracts** | Hardhat                                           | Smart contract development and testing framework            |
|                               | Solidity                                          | Smart contract language                                     |
|                               | OpenZeppelin (incl. upgradeable/proxy)            | Secure base contracts and upgrade patterns                  |
|                               | dotenv                                            | Environment variable management                             |
|                               | ethers.js                                         | Ethereum scripting/testing                                  |
|                               | chai/mocha (via @nomicfoundation/hardhat-toolbox) | Contract testing                                            |
|                               | Etherscan API                                     | Contract verification                                       |
|                               | Alchemy                                           | Ethereum RPC provider                                       |
|                               | NatSpec                                           | Solidity function documentation                             |
| **DevOps / Automation**       | .env                                              | Store private/secrets/environment variables                 |
|                               | ABI/address automation                            | Sync ABI and addresses after deployment                     |
|                               | Documentation in README and JSDoc/Markdown        | Complete developer documentation                            |
|                               | Vercel                                            | Frontend deployment, hosting, and serverless infrastructure |
