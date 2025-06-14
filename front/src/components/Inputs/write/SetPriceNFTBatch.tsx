import React, { useState } from "react";

import SimpleInput from "../SimpleInput";
import SimpleButton from "@/components/buttons/SimpleButton";
import SimpleError from "@/components/Errors/SimpleError";
import { writeMarket } from "@/hooks/MarketContract";

const SetPriceNFTBatch: React.FC = () => {
  const [data, setData] = useState<{ ids: string; prices: string }>({
    ids: "",
    prices: "",
  });
  const [load, setLoad] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [hash, setHash] = useState<string>("");

  const _hanldeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
        ...prev,
        [name]: value,
    }));
  }

  const _handleClick = async() => {
    const formatId = /^[\d\s,]+$/.test(data.ids);
    const formatPrices = /^[\d\s,]+$/.test(data.prices);

    if(!(formatId || formatPrices)) {
        setError("Only numbers, comma and space in ids, values!");
        return;
    }

    const idsArr = data.ids.split(",").map(i => Number(i.trim()));
    const pricesArr = data.prices.split(",").map(i => Number(i.trim()));

    if(idsArr.length !== pricesArr.length) {
        setError("Id array and value array must be same length");
        return;
    }

    setLoad(true);
    setError(undefined);
    setHash("");
    try {
        const hash = await writeMarket("setPriceNFTBatch", [idsArr, pricesArr]);
        console.log("Hash set price:", hash);
    } catch (e) {
        console.error(e);
        setError("Set price error");
    } finally {
        setData({ ids: "", prices: ""});
        setLoad(false);
    }
  }

  return (
    <div>
      <h2 className="h2-green">Set price a few NFT</h2>
      <SimpleInput
        placeholder={"ids (1, 4, 5)"}
        name={"ids"}
        value={load ? "Loading..." : data.ids}
        onChange={_hanldeChange}
        disabled={load}
      />
      <SimpleInput
        placeholder={"prices in wei (100, 40, 50)"}
        name={"prices"}
        value={load ? "Loading..." : data.prices}
        onChange={_hanldeChange}
        disabled={load}
      />
      <SimpleButton disabled={load} onClick={_handleClick}>
        {load ? "Loading..." : "set"}
      </SimpleButton>
      {hash && <p>Hash: {hash.substring(0,6) + "..." + hash.substring(60,65)}</p>}
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default SetPriceNFTBatch;
