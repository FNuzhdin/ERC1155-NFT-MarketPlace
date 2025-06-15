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

/**
 * TokenUserInterface component
 *
 * Provides the main interface for regular users to interact with the TokenERC1155 contract.
 * Allows users to view token data, manage approvals, check balances, and perform token transfers and burns.
 *
 * Props:
 * - `address`: The user's Ethereum address, passed to relevant subcomponents.
 *
 * Features (subcomponents):
 * - `URIInput`: View the metadata URI for any token (NFT or FT).
 * - `SupplyInput`: View the total supply (minted amount) of any token.
 * - `BurnInput`: Burn (destroy) your own tokens.
 * - `ApprovalInput`: Grant or revoke approval for contract operations.
 * - `ExistsInput`: Check if a token exists by ID.
 * - `BalanceInput`: View the balance of any token at any address.
 * - `TransferInput`: Transfer a single token (NFT or FT) to another address.
 * - `TransferBatchInput`: Transfer multiple tokens (NFT or FT) to another address in batch.
 *
 * Usage:
 * ```tsx
 * <TokenUserInterface address={address} />
 * ```
 *
 * Notes:
 * - Designed for use by any user to manage their own tokens.
 * - Combines both "view" and "write" features for everyday token management.
 * - All actions are performed with the user's own address and permissions.
 */

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
