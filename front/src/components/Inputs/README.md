# Input Components

This folder contains all React components related to user input and contract interactions for the project. The components are grouped into three main subfolders based on their purpose:

- [`mint`](./mint) — Components for minting tokens (admin-only).
- [`view`](./view) — Components for viewing blockchain/token data (public and admin).
- [`write`](./write) — Components for changing contract state (public and admin).

Below is an overview of the structure and purpose of each subfolder and its main components.

---

## `mint/` — Minting Components

These components are used by the contract owner (administrator) to mint new tokens.

- **MainMint.tsx**  
  The main minting component, which includes all secondary minting components as children.

- **MainFTInput.tsx**  
  Mint existing fungible tokens (FT).

- **MintNFTInput.tsx**  
  Mint non-fungible tokens (NFT).

- **MainNewFTInput.tsx**  
  Mint new types of fungible tokens (FT).

_All components in this folder are intended for administrator use only._

---

## `view/` — Viewing Components

These components are used to view information from the smart contracts (`Market.sol`, `TokenERC1155.sol`).  
Some are available to any user, others are for admin use.

- **BalanceInput.tsx**  
  View the balance of any token for any address.

- **ExistsInput.tsx**  
  Check if a token exists by id.

- **GetterComponent.tsx**  
  (Admin-only) View contract version (for upgradable proxy), queue head/tail for FT sales.

  - **SellerInQueue.tsx**  
    (Child of `GetterComponent`) View which address is at a specific position in the FT sales queue.

  - **ValueInQueue.tsx**  
    (Child of `GetterComponent`) View the amount for sale in the queue at a specific position.

- **PlaceInQueue.tsx**  
  View your place in the FT sale queue for a given token.

- **SupplyInput.tsx**  
  View the total supply (minted amount) of a token.

- **URIInput.tsx**  
  Get the metadata URI for any token (NFT or FT).

---

## `write/` — Write/Interaction Components

These components allow users or administrators to modify contract state (write transactions).

- **setApprovalForAll.tsx**  
  Grant/revoke contract approval. Usable by any user.

- **BurnInput.tsx**  
  Burn (destroy) tokens. Usable by any user.

- **MarketPlaceFT.tsx**  
  Interface for selling FT tokens. Usable by any user.

- **MarketPlaceNFT.tsx**  
  Interface for selling NFT tokens. Usable by any user.

- **SetPriceFT.tsx**  
  Set price for FT sale (admin-only).

- **SetPriceNFTBatch.tsx**  
  Set price for batch sale of NFTs. Usable by any user for their own NFTs.

- **StopExhibitNFTBatch.tsx**  
  Stop exhibiting (selling) several NFTs and return them to your account. Usable by any user for their own tokens.

- **StopExhibitNFT.tsx**  
  Stop exhibiting (selling) a single NFT and return it to your account. Usable by any user for their own tokens.

- **StopExhibitFT.tsx**  
  Stop exhibiting (selling) all of your FT tokens by id and return them. Usable by any user for their own tokens.

- **ToWithdraw.tsx**  
  Shows how much ETH is available for the user to withdraw (earned from sales of FT/NFT), and allows withdrawal. Usable by any user.

- **TransferBatchInput.tsx**  
  Batch transfer of tokens (NFT or FT) to another address. Usable by any user.  
  _If sent to the marketplace address, tokens are automatically listed for sale._

- **TransferInput.tsx**  
  Single transfer of a token (NFT or FT) to another address. Usable by any user.  
  _If sent to the marketplace address, the token is automatically listed for sale._

- **WithdrawBatchInput.tsx**  
  (Admin-only) Withdraw several tokens from the TokenERC1155 contract if they were accidentally sent there.

- **WithdrawInput.tsx**  
  (Admin-only) Withdraw a single token from the TokenERC1155 contract if it was accidentally sent there.

---

## Usage Notes

- Components are grouped by function for clarity and access control.
- Admin-only components should only be used by the contract owner or with appropriate permissions.
- Most write and view components are designed for usability by any user, except where noted.
- Interaction components include validation, error handling, and display of transaction hashes.

---

## See Also

- Each component is documented in its own file with concise usage and behavior descriptions.
- Refer to component source for prop requirements and detailed behavior.