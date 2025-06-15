# ERC1155 NFT Marketplace & FT Exchange – Frontend

This is a modern **Web3 DApp frontend** built with [Next.js](https://nextjs.org/) (App Router) for interacting with the **TokenERC1155** and **Market** contracts. The application serves as both an NFT marketplace and an FT exchange, allowing users to buy, sell, and swap NFTs and FTs through an intuitive, user-friendly interface.

---

## 🚀 Main Advantages

- **Universal Web3 Platform:** Manage both NFTs and FTs in one application—buy, sell, and exchange.
- **Direct Contract Integration:** Interacts with [TokenERC1155.sol](../contracts/TokensERC1155.sol) and [Market.sol](../contracts/Market.sol).
- **Always Up-to-date ABIs and Addresses:** Contract ABIs and addresses are validated and updated automatically.
- **Modular Architecture:** Clear separation of components, hooks, and utilities for scalability and maintainability.
- **TypeScript & JSDoc:** Extensive documentation in code (JSDoc) and markdown ([README for hooks](./src/hooks/README.md), [README for utils](./src/utils/README.md)).
- **Developer Friendly:** All core files feature both markdown and JSDoc documentation.
- **IPFS Storage:** Uses [Pinata](https://www.pinata.cloud/) for storing metadata and files on IPFS.
- **Security:** Contract addresses are validated at runtime.
- **Easily Extensible Stack:** New contracts and features can be added effortlessly.
- **Modern Routing:** Utilizes Next.js App Router.

---

## 🛠 Technologies Used

- **Next.js (App Router)**
- **React & TypeScript**
- **Wagmi** — seamless Web3 and contract interactions
- **ethers** — low-level Ethereum interaction
- **viem** — type safety for addresses and data structures
- **JSDoc** — inline code documentation
- **Pinata / IPFS** — decentralized storage for token metadata and files
- **JSON/ABI** — contract interface management

---

## 📁 Project Structure

```
front/
├── api/           # API routes (see below)
├── artifacts/     # Contract ABI files (must always be up to date!)
├── public/        # Static files, contract addresses (see below)
└── src/
    ├── app/           # Next.js pages and routing ([view](https://github.com/FNuzhdin/ERC1155-NFT-MarketPlace/tree/main/front/src/app))
    ├── components/    # Reusable components ([view](https://github.com/FNuzhdin/ERC1155-NFT-MarketPlace/tree/main/front/src/components))
    ├── hooks/         # Custom hooks for contract interaction ([README](./src/hooks/README.md))
    ├── images/        # Static images ([view](https://github.com/FNuzhdin/ERC1155-NFT-MarketPlace/tree/main/front/src/images))
    └── utils/         # Validation, addresses, utilities ([README](./src/utils/README.md))
```

---

### 📦 `api/` — Server-side Handlers

The `api` directory contains backend (server-side) handlers for Next.js.  
Common use cases:
- Proxying requests to third-party services (such as Pinata/IPFS)
- Internal logic related to security, token aggregation

> _See the folder for specific endpoint implementations._

---

### 📦 `src/app/` — Main Application & Routing

- Entry point and routing for the entire application
- Uses the Next.js App Router for modular, scalable routing
- Handles layout, providers (wagmi, ethers, etc.), and global state

[Open app folder](https://github.com/FNuzhdin/ERC1155-NFT-MarketPlace/tree/main/front/src/app)

---

### 📦 `src/components/` — UI Components

- All basic and composite UI components
- Forms, token cards, modals, navigation, etc.
- Designed for reusability and clean code

[Open components folder](https://github.com/FNuzhdin/ERC1155-NFT-MarketPlace/tree/main/front/src/components)

---

### 📦 `src/hooks/` — Web3 & Contract Hooks

- **Custom hooks** for working with contracts (Market, TokenERC1155)
- Abstract wagmi/ethers, IPFS, and async requests
- [README for hooks](./src/hooks/README.md)

---

### 📦 `src/images/` — Static Assets

- All images, logos, and icons for the application

---

### 📦 `src/utils/` — Validation & Addresses

- Utilities for input validation, centralized management of contract addresses
- Contract addresses are automatically loaded from deployment files and validated at startup
- [README for utils](./src/utils/README.md)

---

### 📦 `artifacts/` — Contract ABIs

**Important!**  
- This folder **must always contain up-to-date ABIs** (`Market.json`, `TokensERC1155.json`, etc.)
- If the ABI does not match the current contracts, the application will not work!
- After each contract deployment/change, update the ABI files here

---

### 📦 `public/` — Addresses and Deployment Data

- `DeployingData.json` — Current contract addresses (used by the application by default)
- `SepoliaDeployingData.json` — Contract addresses for the Sepolia network  
  _To use Sepolia, manually copy the addresses into `DeployingData.json`_

---

## 💡 Contract Overview

The application interacts with two main contracts:

- **[TokenERC1155.sol](../contracts/TokenERC1155.sol):**  
  ERC-1155 multi-token standard (NFT and FT in one contract). Mint, transfer, and store balances.

- **[Market.sol](../contracts/Market.sol):**  
  Marketplace logic: listing, buying, selling, and swapping NFTs and FTs.

Contract addresses are automatically loaded from `public/DeployingData.json` and validated at startup ([utils/ProvenAddresses.ts](./src/utils/ProvenAddresses.ts)).

---

## 🏆 Advantages and Strengths

- **Multi-asset Marketplace:** NFT and FT in one product—convenient for both users and developers.
- **Decentralization:** All operations (trading, exchanging, storing) are handled via smart contracts.
- **Documentation:** Detailed documentation for each key module (see [README for hooks](./src/hooks/README.md), [README for utils](./src/utils/README.md)), as well as JSDoc in the code.
- **Reliability:** Contract addresses and ABIs are validated; errors are caught at startup.
- **Web3-Extensibility:** New contracts and features can be added easily.
- **IPFS Integration:** NFT and FT metadata are stored in distributed storage via Pinata.
- **Security:** Addresses are validated at startup, with a centralized storage and validation mechanism.

---

## 📝 Developer Notes

- **Documentation:**  
  All key files and folders contain documentation in both markdown (`README.md`) and JSDoc inside the code.
    - [README for components](./src/components/README.md)
    - [README for hooks](./src/hooks/README.md)
    - [README for utils](./src/utils/README.md)
- After deploying new contracts:
  - Update ABI files in `/artifacts`
  - New addresses will be used automatically
- To work with Sepolia:
  - Manually copy addresses from `SepoliaDeployingData.json` into `DeployingData.json`
- For quick navigation, use embedded links to internal READMEs and JSDoc comments in the code

---

## 📚 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/docs/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Pinata IPFS](https://www.pinata.cloud/documentation)
- [ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)

---

**For questions, suggestions, or bug reports — create an issue or pull request in the repository!**