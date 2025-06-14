import { useMarketRead } from "@/hooks/MarketContract";
import React, { useEffect, useState } from "react";

import FTCard from "@/components/cards/FTCard";
import SimpleError from "@/components/Errors/SimpleError";

const MarketPlaceFT: React.FC<{ address: `0x${string}` | undefined }> = ({
  address,
}) => {
  const { data: tokensArr, isLoading } = useMarketRead("getAllIdsFTExhibited");
  const [ids, setIds] = useState<bigint[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (Array.isArray(tokensArr)) {
      setIds(tokensArr);
    } else {
      console.log("Ids array isn't loaded yet");
    }
  }, [tokensArr, isLoading]);

  return (
    <div>
    
      <div className="vertical-stack">
        <ul className="simple-row">
          {ids.map((id) => (
            <li key={id}>
              <FTCard id={id} address={address} />
            </li>
          ))}
        </ul>
        <SimpleError error={error} setError={setError} />
      </div>
    </div>
  );
};

export default MarketPlaceFT;
