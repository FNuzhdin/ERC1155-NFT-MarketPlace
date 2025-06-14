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

export type ImageItem = {
  file: File;
  name: string;
  description: string;
};

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
      <p>Last minted id: {currentId && (currentId - BigInt(1))}</p>

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
