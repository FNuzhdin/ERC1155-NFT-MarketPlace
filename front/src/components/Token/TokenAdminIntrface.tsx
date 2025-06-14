
import React, { useState } from "react";
import URIInput from "../Inputs/view/URIInput";
import BurnInput from "../Inputs/write/BurnInput";
import SupplyInput from "../Inputs/view/SupplyInput";
import PausedButton from "../buttons/PausedButton";
import ApprovalInput from "../Inputs/write/ApprovalInput";
import ExistsInput from "../Inputs/view/ExistsInput";
import BalanceInput from "../Inputs/view/BalanceInput";
import TransferInput from "../Inputs/write/TransferInput";
import TransferBatchInput from "../Inputs/write/TransferBatchInput";
import WithdrawBatchInput from "../Inputs/write/WithdrawBatchInput";
import WithdrawInput from "../Inputs/write/WithdrawInput";
import MainMint from "../Inputs/mint/MainMInt";

type TokenAdminInterfaceProps = {
  address: `0x${string}` | undefined;
};

const TokenAdminInterface: React.FC<TokenAdminInterfaceProps> = ({
  address,
}) => {

  console.log("Component 'TokenAdminInterface' booted");
  return (
    <div className="containers-wrapper">
      {/* <h1 className="h1-green">Token data</h1> */}
      <div className="flex-container-medium">
        <URIInput />
        <SupplyInput />
        <PausedButton />
      </div>
      {/* <h1 className="h1-green">Token features</h1> */}
      <div className="flex-container-standart">
        <BurnInput address={address} />
      </div>
      
      
      <div className="flex-container-standart">
        <ApprovalInput address={address} />
      </div>

      <div className="flex-container-standart">
        <ExistsInput />
        <BalanceInput />
      </div>
      <div className="flex-container-standart">
        <TransferInput address={address} />
      </div>
      <div className="flex-container-standart">
        <TransferBatchInput address={address} />
      </div>
      <div className="flex-container-standart">
        <WithdrawInput /> 
        <WithdrawBatchInput />
      </div>
      <div className="flex-container-standart">
        <MainMint address={address}/>
      </div>
    </div>
  );
};

export default TokenAdminInterface;
