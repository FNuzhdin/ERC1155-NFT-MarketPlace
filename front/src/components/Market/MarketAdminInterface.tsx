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

/**
 * MarketAdminInterface component
 *
 * Provides a unified admin interface for managing the marketplace. 
 * This component combines several subcomponents for advanced market management and contract administration.
 *
 * Props:
 * - `address`: The administrator's Ethereum address (used in some subcomponents).
 *
 * Features (subcomponents):
 * - `GetterComponent`: View contract version, FT sale queue, and other admin data.
 * - `SetPriceFT`: Set price for FT tokens (admin only).
 * - `PlaceInQueue`: Check your place in the FT sale queue.
 * - `StopExhibitFT`: Stop exhibiting all your FT tokens and return them to your wallet.
 * - `StopExhibitNFT`: Stop exhibiting a single NFT and return it.
 * - `StopExhibitNFTBatch`: Stop exhibiting multiple NFTs at once and return them.
 * - `SetPriceNFTBatch`: Batch set price for NFTs (admin or users for their NFTs).
 * - `ToWithdraw`: View and withdraw accumulated marketplace revenue (ETH), passing `address`.
 *
 * Usage:
 * ```tsx
 * <MarketAdminInterface address={address} />
 * ```
 *
 * Notes:
 * - Intended for administrator use, combining both view and write operations for market management.
 * - Lays out all admin-relevant tools in a unified interface for convenience.
 */

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