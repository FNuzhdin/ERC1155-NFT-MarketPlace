import React, { useState, useEffect } from "react";
import { useTokenRead } from "@/hooks/TokenContract";

import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import type { ReadContractErrorType } from "wagmi/actions";

import MintNFTInput from "./MIntNFTInput";
import MintNewFTInput from "./MintNewFTInput";
import MintFTInput from "./MintFTInput";

/**
 * MintInputProps type
 *
 * Shared props for minting components (e.g., MintNFTInput, MintNewFTInput).
 *
 * Fields:
 * - `address`: The connected wallet address (`0x...` or undefined).
 * - `mintStarted`: Is a minting operation in progress.
 * - `setMintStarted`: Setter for `mintStarted`.
 * - `currentId`: Current token ID from the contract.
 * - `setCurrentId`: Setter for `currentId`.
 * - `refetchCurrentId`: Function to refetch the current token ID.
 *
 * Used for:
 * - Passing minting state and handlers between the main mint component and its children.
 */
export type MintInputProps = {
  address: `0x${string}` | undefined;
  mintStarted: boolean;
  setMintStarted: React.Dispatch<React.SetStateAction<boolean>>;
  currentId: bigint | undefined;
  setCurrentId: React.Dispatch<React.SetStateAction<bigint | undefined>>;
  refetchCurrentId: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<unknown, ReadContractErrorType>>;
};

/**
 * MainMint component
 *
 * The main entry point for minting tokens (NFTs and FTs).
 * This component is intended for use only by the contract owner/admin.
 *
 * Features:
 * - Displays the last minted token ID.
 * - Manages and shares minting state (`mintStarted`) and current token ID (`currentId`) between child minting components.
 * - Fetches the current token ID from the blockchain using a contract hook.
 * - Renders three child minting input components:
 *   - MintNFTInput: For minting new NFTs.
 *   - MintNewFTInput: For creating new fungible tokens (FTs).
 *   - MintFTInput: For minting additional supply of existing FTs.
 *
 * Props:
 * - `address` (`0x...` or undefined): The connected wallet address (should be the owner).
 *
 * State:
 * - `mintStarted` (boolean): Indicates if a minting operation is in progress.
 * - `currentId` (bigint | undefined): Holds the current token ID from the contract.
 *
 * Child Components:
 * - All child components receive relevant state and handler props to coordinate minting actions.
 *
 * Usage:
 * ```tsx
 * <MainMint address={address} />
 * ```
 *
 * Note:
 * - Only the contract owner should see and use this component.
 * - Requires appropriate contract hooks and web3 context to function.
 */

const MainMint: React.FC<{ address: `0x${string}` | undefined }> = ({
  address,
}) => {
  const [mintStarted, setMintStarted] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<bigint | undefined>(undefined);
  const {
    data: currentTokenId,
    isSuccess: isSuccessCurId,
    refetch: refetchCurrentId,
  } = useTokenRead("currentTokenId", [], address);

  useEffect(() => {
    if (address && isSuccessCurId && typeof currentTokenId === "bigint") {
      console.log("currentTokenId:", currentTokenId);
      setCurrentId(currentTokenId);
    } else {
      console.log("Success status id:", isSuccessCurId);
    }
  }, [isSuccessCurId, currentTokenId]);

  console.log("Component 'MainMint' booted");
  return (
    <div>
      <p>Last minted id: {currentId && currentId - BigInt(1)}</p>

      <MintNFTInput
        address={address}
        mintStarted={mintStarted}
        setMintStarted={setMintStarted}
        currentId={currentId}
        setCurrentId={setCurrentId}
        refetchCurrentId={refetchCurrentId}
      />

      <MintNewFTInput
        address={address}
        mintStarted={mintStarted}
        setMintStarted={setMintStarted}
        currentId={currentId}
        setCurrentId={setCurrentId}
        refetchCurrentId={refetchCurrentId}
      />

      <MintFTInput
        address={address}
        mintStarted={mintStarted}
        setMintStarted={setMintStarted}
      />
    </div>
  );
};

export default MainMint;
