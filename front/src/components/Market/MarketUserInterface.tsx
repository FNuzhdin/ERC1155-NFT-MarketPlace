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

const MarketUserInterface: React.FC<MarketUserInterfaceProps> = ({
  address,
}) => {
  console.log("Component 'MarketUserInterface' booted");
  return <div>
    <div className="flex-container-unsize">
            <PlaceInQueue address={address}/>
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
  </div>;
};

export default MarketUserInterface;
