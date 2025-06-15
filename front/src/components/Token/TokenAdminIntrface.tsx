
import React, { useState } from "react";
import URIInput from "../Inputs/view/URIInput";
import BurnInput from "../Inputs/write/BurnInput";
import SupplyInput from "../Inputs/view/SupplyInput";
import PausedButton from "../Buttons/PausedButton";
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

/**
 * TokenAdminInterface component
 *
 * Provides a comprehensive administrative interface for managing the TokenERC1155 contract. 
 * Intended for use by the contract owner (administrator).
 *
 * Props:
 * - `address`: The admin's Ethereum address, passed to relevant subcomponents.
 *
 * Included Features (subcomponents):
 * - `URIInput`: View the metadata URI for any token (NFT or FT).
 * - `SupplyInput`: View the total supply (minted amount) of any token.
 * - `PausedButton`: Pause or unpause the contract.
 * - `BurnInput`: Burn (destroy) tokens from any address.
 * - `ApprovalInput`: Grant or revoke approval for contract operations.
 * - `ExistsInput`: Check if a token exists by ID.
 * - `BalanceInput`: View the balance of any token at any address.
 * - `TransferInput`: Transfer a single token (NFT or FT) to another address.
 * - `TransferBatchInput`: Transfer multiple tokens (NFT or FT) to another address in batch.
 * - `WithdrawInput`: Withdraw a single token from the TokenERC1155 contract (if accidentally sent there).
 * - `WithdrawBatchInput`: Withdraw multiple tokens from the TokenERC1155 contract (if accidentally sent there).
 * - `MainMint`: Mint new tokens (FT or NFT, including new FT types).
 *
 * Usage:
 * ```tsx
 * <TokenAdminInterface address={address} />
 * ```
 *
 * Notes:
 * - Combines both "view" and "write" features for complete contract management.
 * - Intended for administrative use—access control should be enforced at a higher level.
 * - Organizes all token-level tools in a unified interface for convenience.
 */

const TokenAdminInterface: React.FC<TokenAdminInterfaceProps> = ({
  address,
}) => {

  console.log("Component 'TokenAdminInterface' booted");
  return (
    <div className="containers-wrapper">
      <div className="flex-container-medium">
        <URIInput />
        <SupplyInput />
        <PausedButton />
      </div>
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
