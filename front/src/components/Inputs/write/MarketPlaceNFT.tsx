import React, { useState, useEffect } from "react";
import NFTCard from "@/components/cards/NFTCard";
import SimpleError from "@/components/Errors/SimpleError";

import { useMarketRead } from "@/hooks/MarketContract";

const MarketPlaceNFT: React.FC<{ address: `0x${string}` | undefined }> = ({
  address,
}) => {
  const { data: tokensArr, isLoading, refetch } = useMarketRead("getAllIdsNFTExhibited");
  const [ids, setIds] = useState<bigint[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (Array.isArray(tokensArr)) {
      setIds(tokensArr);
    } else {
      console.log("Ids array isn't loaded yet")
    }
  }, [tokensArr, isLoading]);

  return (
    <div>
      <h1 className="h1">NFT</h1>
      <ul className="containers-wrapper">
        {ids.map((id) => (
          <li className="flex-container-standart" key={id}>
            <NFTCard id={id} address={address} refetch={refetch} />
          </li>
        ))}
      </ul>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default MarketPlaceNFT;
