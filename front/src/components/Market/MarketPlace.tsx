import React from "react";

import MarketPlaceFT from "../Inputs/write/MarketPlaceFT";
import MarketPlaceNFT from "../Inputs/write/MarketPlaceNFT";

/**
 * MarketPlace component
 *
 * Provides the main user interface for the marketplace, allowing any user to sell their fungible tokens (FT) or non-fungible tokens (NFT).
 *
 * Features:
 * - Renders interfaces for selling FT (`MarketPlaceFT`) and NFT (`MarketPlaceNFT`) tokens.
 * - Accepts the user's address as a prop and passes it to child components.
 *
 * Usage:
 * ```tsx
 * <MarketPlace address={address} />
 * ```
 *
 * Notes:
 * - Usable by any user to list their tokens for sale.
 * - Both FT and NFT listing options are provided in a single, unified interface.
 */

const MarketPlace: React.FC<{ address: `0x${string}` | undefined }> = ({
  address,
}) => {
  console.log("Component 'MarketPlace' booted");
  return (
    <div>
      <h1 className="h1-gradient">Market place</h1>
      <MarketPlaceFT address={address} />
      <MarketPlaceNFT address={address} />
    </div>
  );
};

export default MarketPlace;
