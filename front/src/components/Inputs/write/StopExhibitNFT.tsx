import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/Buttons/SimpleButton";
import { writeMarket } from "@/hooks/MarketContract";
import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * StopExhibitNFT component
 *
 * Allows a user to remove their NFT (by id) from sale on the marketplace and return it to their wallet.
 *
 * Key points:
 * - Enter the NFT id to stop exhibiting it (must be a number).
 * - Calls the `stopExhibitNFT` method on the marketplace contract.
 * - Shows loading status and the transaction hash on success.
 * - Displays error messages for invalid input or transaction failures.
 *
 * UI:
 * - `SimpleInput` for id entry.
 * - `SimpleButton` for confirmation.
 * - `SimpleError` for errors.
 *
 * Usage:
 * ```tsx
 * <StopExhibitNFT />
 * ```
 *
 * Notes:
 * - Any user can use this component for their own NFTs.
 * - After a successful operation, the input is cleared and the transaction hash is partially shown.
 */

const StopExhibitNFT: React.FC = () => {
  const [load, setLoad] = useState<boolean>(false);
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [hash, setHash] = useState<string>("");

  const _hanldeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleClick = async() => {
    if(!onlyNumbers({param: id, setError})) return; 

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