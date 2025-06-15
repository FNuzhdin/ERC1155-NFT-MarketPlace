# ERC1155 Smart Contracts Suite

This directory contains two highly functional smart contracts for building a powerful, modern NFT & FT marketplace and exchange on Ethereum:

- [`TokensERC1155.sol`](./TokensERC1155.sol) – Advanced ERC1155 token contract with expanded features for both NFTs and FTs, including supply tracking, pausing, URI management, and strict owner controls.
- [`Market.sol`](./Market.sol) – Flexible, upgradable marketplace contract for buying, selling, and exchanging NFTs and FTs, with a focus on security, ease of use, and smooth integration.

---

## ✨ Key Advantages

### TokensERC1155.sol

**A next-gen token contract combining versatility and control:**

- **Supports Both FTs & NFTs:**  
  - Easily mint both fungible tokens (FT) and non-fungible tokens (NFT) from a single contract.
  - Batch minting for NFT collections (each NFT with a unique ID, same base URI).

- **Supply Tracking:**  
  - Inherits from OpenZeppelin’s `ERC1155Supply`, so every token’s total supply is always available on-chain.
  - Prevents overflows by enforcing a maximum supply check on mint.

- **Pausable for Security:**  
  - Owner can pause or unpause all token transfers instantly in case of emergency or maintenance.
  - Based on OpenZeppelin’s well-audited `ERC1155Pausable` extension.

- **Burnable:**  
  - Supports token burning (NFTs and FTs), enabling flexible supply management.

- **Custom URI Management:**  
  - Each token stores its own URI, making metadata access and management straightforward.
  - NFT collections use a base URI with automatic metadata file suffixes for each NFT.

- **Strict Owner-Only Minting:**  
  - Only the contract owner can mint or batch-mint, ensuring complete control over token creation and preventing spam.

- **Withdrawal Utilities:**  
  - Owner can easily withdraw any tokens (FT/NFT) held by the contract, either individually or in batches.

- **Fully Compatible:**  
  - Implements a custom interface for easy extensibility and is compatible with OpenZeppelin tools.

**→** _This contract is a robust foundation for any project needing both FTs and NFTs, with advanced control, security, and extensibility._

---

### Market.sol

**A marketplace contract optimized for safety, simplicity, and upgradeability:**

- **Upgradeable Proxy Design:**  
  - Built to be used behind a proxy, with easy future upgrades and version tracking.

- **Seamless Listing Experience:**  
  - To put tokens up for sale, users only need to transfer them to the market contract’s address.
  - Tokens are instantly listed for sale upon receipt; no complicated approval or setup required.

- **Supports Both NFTs and FTs:**  
  - NFTs: List, set price, buy, or withdraw single NFTs or batches.
  - FTs: Utilizes a queue-based order book for fair, transparent FT sales.

- **Queue System for FTs:**  
  - Ensures a fair, FIFO (first-in, first-out) order matching for fungible tokens.
  - Sellers can track and manage their queue positions.

- **Simple, Non-Custodial ETH Handling:**  
  - All seller proceeds are stored as a withdrawable balance, minimizing the risk of reentrancy and loss.
  - Sellers can withdraw their ETH at any time.

- **Batch & Single Operations:**  
  - Batch price setting and withdrawal for NFT collections.
  - Single and batch operations available for both token types.

- **Open Data for Frontends:**  
  - Exposes arrays and mapping views for all listed NFTs/FTs, prices, queues, etc., making integration with DApps and user interfaces simple.

- **Security Focused:**  
  - All critical actions are protected by checks (ownership, supply, etc.).
  - ETH and token flows are tightly controlled, and pausing is available at the token level.

**→** _This contract makes listing, buying, and managing NFTs/FTs as easy and safe as possible, while supporting future upgrades and complex tokenomics._

---

## How They Work Together

1. **Minting:**  
   Use `TokensERC1155.sol` to mint FTs or NFT collections. Only owner can mint, ensuring trust and supply control.

2. **Listing for Sale:**  
   To list a token, simply transfer it to the `Market.sol` contract.  
   - For NFTs, set the price.  
   - For FTs, the contract owner sets the price, and any seller can join the queue.

3. **Buying:**  
   Buyers send ETH to purchase NFTs or FTs. The token is transferred, and ETH is credited to the seller’s withdrawable balance.

4. **Withdrawing:**  
   Sellers withdraw ETH at their convenience. The owner can also withdraw tokens held by the token contract.

---

## Security & Extensibility

- **Owner controls all minting and pausing on the token contract.**
- **Market contract can be upgraded without losing data (proxy pattern).**
- **No direct ETH acceptance on the token contract (prevents accidental loss).**
- **Only tokens minted by the contract are accepted for transfers (prevents foreign token exploits).**

---

## References

- [ERC1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)
- [Solidity NatSpec Documentation](https://docs.soliditylang.org/en/latest/natspec-format.html)

---

## License

Both contracts are MIT Licensed.

---