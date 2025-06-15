# Write Components

This folder contains React components responsible for **writing to (changing the state of) the smart contracts** (`Market.sol`, `TokenERC1155.sol`). Components here let users or the administrator interact with the contracts by submitting transactions.

## Access Control

- **Admin-only** components: Only the contract owner (administrator) should use these.
- **Public** components: Any user can use these to interact with their own tokens or marketplace functionality.

---

## Components Overview

### General User Actions

- **setApprovalForAll.tsx**  
  Grant or revoke approval for contract operations (required for token transfers/sales).

- **BurnInput.tsx**  
  Burn (destroy) your tokens (NFT or FT).

- **MarketPlaceFT.tsx**  
  Sell FT tokens on the marketplace.

- **MarketPlaceNFT.tsx**  
  Sell NFT tokens on the marketplace.

- **SetPriceNFTBatch.tsx**  
  Set price for several NFTs at once (for your own tokens).

- **StopExhibitNFTBatch.tsx**  
  Stop selling multiple NFTs at once, returning them to your wallet.

- **StopExhibitNFT.tsx**  
  Stop selling a single NFT, returning it to your wallet.

- **StopExhibitFT.tsx**  
  Stop selling all your FT tokens of a particular id, returning them to your wallet.

- **ToWithdraw.tsx**  
  Check how much ETH you earned from selling FT/NFT and withdraw it.

- **TransferBatchInput.tsx**  
  Batch transfer tokens (NFT or FT) to another address.  
  _If sent to the marketplace address, tokens are automatically listed for sale._

- **TransferInput.tsx**  
  Transfer a single token (NFT or FT) to another address.  
  _If sent to the marketplace address, the token is listed for sale automatically._

---

### Admin-Only Actions

- **SetPriceFT.tsx**  
  Set price for FT tokens on the marketplace (by admin only).

- **WithdrawBatchInput.tsx**  
  Withdraw several tokens from the TokenERC1155 contract if they were accidentally sent there.

- **WithdrawInput.tsx**  
  Withdraw a single token from the TokenERC1155 contract if it was accidentally sent there.

---

## Usage Notes

- All components include input validation, loading state, error handling, and transaction hash display.
- Components are grouped for clarity by action type and required access level.
- Always ensure that only the contract owner uses admin-only components.

---

## See Also

- For components related to minting, see the `../mint` folder.
- For components related to viewing contract/token data, see the `../view` folder.
- Each component file is documented with concise usage and behavior notes.