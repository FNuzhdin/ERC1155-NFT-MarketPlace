# Market Components

This folder contains React components for interacting with the marketplace features of the platform. These components provide both administrative and regular user interfaces for managing, viewing, and operating on token sales, queues, and marketplace earnings. The folder is designed to separate the experience for administrators and regular users, as well as to provide a unified marketplace view.

---

## Components

### MarketAdminInterface.tsx

- **Purpose:**  
  The main administrative interface for the marketplace. Combines several advanced management tools for the contract owner or administrator.
- **Features:**  
  - View contract version and FT sales queue (`GetterComponent`)
  - Set price for FT tokens (`SetPriceFT`)
  - Check your place in the FT sales queue (`PlaceInQueue`)
  - Stop exhibiting FT/NFT tokens and return them to your wallet (`StopExhibitFT`, `StopExhibitNFT`, `StopExhibitNFTBatch`)
  - Batch set NFT sale prices (`SetPriceNFTBatch`)
  - View and withdraw accumulated ETH revenue (`ToWithdraw`)
- **Access:**  
  **Admin only**

---

### MarketPlace.tsx

- **Purpose:**  
  The main user-facing interface for selling tokens.
- **Features:**  
  - Sell fungible tokens (FT) (`MarketPlaceFT`)
  - Sell non-fungible tokens (NFT) (`MarketPlaceNFT`)
- **Access:**  
  **All users**

---

### MarketUserInterface.tsx

- **Purpose:**  
  The main management interface for regular marketplace users to handle their sales and earned funds.
- **Features:**  
  - Check your place in the FT sale queue (`PlaceInQueue`)
  - Stop exhibiting FT/NFT tokens and return them to your wallet (`StopExhibitFT`, `StopExhibitNFT`, `StopExhibitNFTBatch`)
  - Batch set NFT prices (`SetPriceNFTBatch`)
  - View and withdraw ETH earned from sales (`ToWithdraw`)
- **Access:**  
  **All users**

---

## Usage

- **MarketAdminInterface** should be rendered for administrators/owners who need advanced market management features.
- **MarketPlace** is for any user wishing to list their FT or NFT tokens for sale.
- **MarketUserInterface** is for users to manage their existing sales, stop sales, set batch prices, or withdraw their marketplace earnings.

---

## Notes

- Components rely on subcomponents from the `Inputs` directory (both `view` and `write`).
- Each subcomponent is documented in its own file.
- Access control (admin vs. user) must be enforced at a higher level in the application.