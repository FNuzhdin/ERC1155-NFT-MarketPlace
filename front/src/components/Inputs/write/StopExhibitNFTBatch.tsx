import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/buttons/SimpleButton";
import { writeMarket } from "@/hooks/MarketContract";

const StopExhibitNFTBatch: React.FC = () => {
  const [load, setLoad] = useState<boolean>(false);
  const [ids, setIds] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [hash, setHash] = useState<string>("");

  const _hanldeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIds(e.target.value);
  };

  const _handleClick = async () => {
    const format = /^[\d\s,]+$/.test(ids);
    if (!format) {
      setError("Only numbers, comma and space in id");
      return;
    }

    setError(undefined);
    setLoad(true);
    setHash("");
    try {
      const idsArr = ids.split(",").map((i) => Number(i.trim()));
      const hash = await writeMarket("stopExhibitNFTBatch", [idsArr]);
      if (hash) {
        console.log("Hash stop exhibit NFTs:", hash);
        setHash(hash);
      }
    } catch (e) {
      console.error(e);
      setError("Stop exhibit error");
    } finally {
      setLoad(false);
      setIds("");
    }
  };
  return (
    <div>
      <h2 className="h2-green">Stop exhibit a few NFT</h2>
      <SimpleInput
        placeholder={"ids (1, 4, 5)"}
        name={"ids"}
        value={load ? "Loading..." : ids}
        onChange={_hanldeChange}
        disabled={load}
      />
      <SimpleButton disabled={load} onClick={_handleClick}>
        {load ? "Loading..." : "stop"}
      </SimpleButton>
      {hash && <p>Hash: {hash.substring(0,6) + "..." + hash.substring(60,65)}</p>}
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default StopExhibitNFTBatch;
