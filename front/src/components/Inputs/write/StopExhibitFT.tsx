import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/Buttons/SimpleButton";
import { writeMarket } from "@/hooks/MarketContract";
import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * StopExhibitFT component
 *
 * This component allows any user to remove (stop exhibiting) all their FT (fungible token) tokens with a given id from the marketplace.
 * Useful for cases where a user wants to cancel the sale and retrieve all tokens of a specific FT id that were previously exhibited for sale.
 *
 * Features:
 * - **Stop FT Exhibit:**  
 *   User enters an FT token id to stop exhibiting all tokens of that id from the marketplace.
 *   Calls the `stopExhibitFT` method on the market contract.
 *
 * - **Validation:**  
 *   Ensures the entered id is numeric.
 *
 * - **User Feedback:**  
 *   Shows loading state during the transaction.
 *   Displays the transaction hash on success.
 *   Shows clear error messages for invalid input or transaction errors.
 *
 * UI:
 * - Uses `SimpleInput` for the FT id.
 * - Uses `SimpleButton` to initiate the stop exhibit action.
 * - Uses `SimpleError` to display error messages.
 *
 * Usage:
 * ```tsx
 * <StopExhibitFT />
 * ```
 *
 * Notes:
 * - Any user can use this component to stop exhibiting their own FTs for sale on the marketplace.
 * - Only the user's own exhibited tokens will be affected.
 * - The input is cleared after each attempt.
 * - After a successful call, the transaction hash is partially displayed.
 */

const StopExhibitFT: React.FC = () => {
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
      const hash = await writeMarket("stopExhibitFT", [id]);
      if (hash) {
        console.log("Hash stop exhibit FT:", hash);
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
      <h2 className="h2-green">Stop exhibit all FT</h2>
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

export default StopExhibitFT;
