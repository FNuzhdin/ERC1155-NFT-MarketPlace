# Token Components

This folder contains React components for interacting with and managing the TokenERC1155 smart contract. Components are grouped into interfaces for administrators and regular users, providing tools for both token data viewing and contract state-changing operations.

---

## Components

### TokenAdminInterface.tsx

- **Purpose:**  
  A comprehensive administrative dashboard for the TokenERC1155 contract.  
- **Features:**  
  - View metadata URI, token supply, and contract paused state.
  - Burn (destroy) tokens from any address.
  - Grant or revoke approvals for contract operations.
  - Check token existence and balances.
  - Transfer tokens (single or batch).
  - Withdraw tokens accidentally sent to the contract (single or batch).
  - Mint new tokens (FT/NFT, or new FT types).
- **Access:**  
  **Admin only** (contract owner/administrator).

---

### TokenUserInterface.tsx

- **Purpose:**  
  The standard user interface for interacting with the TokenERC1155 contract.
- **Features:**  
  - View metadata URI and token supply.
  - Burn your own tokens.
  - Grant or revoke approvals for contract operations.
  - Check token existence and balances.
  - Transfer tokens (single or batch).
- **Access:**  
  **All users** (for managing their own tokens).

---

## Usage

- **TokenAdminInterface** should be used by the contract owner or administrators for full control over all tokens, including minting and emergency withdrawals.
- **TokenUserInterface** is for any user to manage their own tokens: viewing, transferring, burning, and approval management.

---

## Notes

- Components utilize subcomponents from the `Inputs` directory (see `view`, `write`, and `mint`).
- Each subcomponent is separately documented in its own file.
- Administrative access control should be enforced at a higher level in the application.