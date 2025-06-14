import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/buttons/SimpleButton";
import { writeMarket } from "@/hooks/MarketContract";

const StopExhibitNFT: React.FC = () => {
  const [load, setLoad] = useState<boolean>(false);
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [hash, setHash] = useState<string>("");

  const _hanldeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleClick = async() => {
    const onlyNumbers = /^\d+$/.test(id);
    if (!onlyNumbers) {
      setError("Only numbers in id");
      return;
    }

    setError(undefined);
    setLoad(true);
    setHash("");
    try {
      const hash = await writeMarket("stopExhibitNFT", [id]);
      if (hash) {
        console.log("Hash stop exhibit NFT:", hash);
        setHash(hash);
      }
    } catch (e) {
      console.error(e);
      setError("Stop exhibit error");
    } finally {
      setLoad(false);
      setId("");
    }
  };
  return (
    <div>
      <h2 className="h2-green">Stop exhibit single NFT</h2>
      <SimpleInput
        placeholder={"id"}
        name={"id"}
        value={load ? "Loading..." : id}
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

export default StopExhibitNFT;