import React from "react";
import URIInput from "../Inputs/view/URIInput";
import SupplyInput from "../Inputs/view/SupplyInput";
import ApprovalInput from "../Inputs/write/ApprovalInput";
import ExistsInput from "../Inputs/view/ExistsInput";
import BalanceInput from "../Inputs/view/BalanceInput";
import TransferInput from "../Inputs/write/TransferInput";
import TransferBatchInput from "../Inputs/write/TransferBatchInput";
import BurnInput from "../Inputs/write/BurnInput";

type TokenUserInterfaceProps = {
  address: `0x${string}` | undefined;
};

const TokenUserInterface: React.FC<TokenUserInterfaceProps> = ({ address }) => {
  console.log("Component 'TokenUserInterface' booted");
  return <div className="containers-wrapper">
    <div className="flex-container-unsize">
      <URIInput />
      <SupplyInput />
    </div>
    <div className="flex-container-standart">
        <BurnInput address={address} />
      </div>
    <div className="flex-container-unsize">
      <ApprovalInput address={address} />
    </div>
    <div className="flex-container-unsize">
      <ExistsInput />
      <BalanceInput />
    </div>
    <div className="flex-container-unsize">
      <TransferInput address={address} />
    </div>
    <div className="flex-container-unsize">
      <TransferBatchInput address={address} />
    </div>
  </div>;
};

export default TokenUserInterface;
