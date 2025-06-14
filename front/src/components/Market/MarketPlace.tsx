import React from "react";

import MarketPlaceFT from "../Inputs/write/MarketPlaceFT";
import MarketPlaceNFT from "../Inputs/write/MarketPlaceNFT";

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
