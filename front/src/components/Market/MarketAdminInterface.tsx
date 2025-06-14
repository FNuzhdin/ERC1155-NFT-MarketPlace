import React from "react";

import GetterComponent from "../Inputs/view/GetterComponent";
import SetPriceFT from "../Inputs/write/SetPriceFT";
import PlaceInQueue from "../Inputs/view/PlaceInQueue";
import StopExhibitFT from "../Inputs/write/StopExhibitFT";
import StopExhibitNFT from "../Inputs/write/StopExhibitNFT";
import StopExhibitNFTBatch from "../Inputs/write/StopExhibitNFTBatch";
import SetPriceNFTBatch from "../Inputs/write/SetPriceNFTBatch";
import ToWithdraw from "../Inputs/write/ToWithdraw";

type MarketAdminInterfaceProps = {
    address: `0x${string}` | undefined;
}

const MarketAdminInterface: React.FC<MarketAdminInterfaceProps> = ({ address }) => {
    console.log("Component 'MarketAdminInterface' booted");
    return <div className="containers-wrapper">
        <div className="flex-container-unsize">
            <GetterComponent />
        </div>
        <div className="flex-container-unsize">
            <SetPriceFT />
        </div>
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
    </div>
}

export default MarketAdminInterface;