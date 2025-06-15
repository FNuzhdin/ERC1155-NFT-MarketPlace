import React from "react";

import PlaceInQueue from "../Inputs/view/PlaceInQueue";
import ToWithdraw from "../Inputs/write/ToWithdraw";
import StopExhibitFT from "../Inputs/write/StopExhibitFT";
import StopExhibitNFT from "../Inputs/write/StopExhibitNFT";
import StopExhibitNFTBatch from "../Inputs/write/StopExhibitNFTBatch";
import SetPriceNFTBatch from "../Inputs/write/SetPriceNFTBatch";

type MarketUserInterfaceProps = {
  address: `0x${string}` | undefined;
};

/**
 * MarketUserInterface component
 *
 * Provides the main marketplace interface for regular users, allowing them to manage their token sales and withdrawals.
 *
 * Features:
 * - Check your place in the FT sale queue (`PlaceInQueue`).
 * - Stop exhibiting (selling) FT or NFT tokens and return them to your wallet (`StopExhibitFT`, `StopExhibitNFT`, `StopExhibitNFTBatch`).
 * - Set price for a batch of NFTs (`SetPriceNFTBatch`).
 * - View and withdraw ETH earned from token sales (`ToWithdraw`).
 *
 * Props:
 * - `address`: The user's Ethereum address (passed to relevant subcomponents).
 *
 * Usage:
 * ```tsx
 * <MarketUserInterface address={address} />
 * ```
 *
 * Notes:
 * - Designed for use by any user to manage their own assets on the marketplace.
 */

const MarketUserInterface: React.FC<MarketUserInterfaceProps> = ({
  address,
}) => {
  console.log("Component 'MarketUserInterface' booted");
  return (
    <div className="containers-wrapper">
      <div className="flex-container-unsize">
        <PlaceInQueue address={address} />
      </div>
      <div className="flex-container-unsize">
        <StopExhibitFT />
        <StopExhibitNFT />
        <StopExhibitNFTBatch />
      </div>
      <div className="flex-container-unsize">
        <SetPriceNFTBatch />
      </div>
      <div className="flex-container-unsize">
        <ToWithdraw address={address} />
      </div>
    </div>
  );
};

export default MarketUserInterface;
