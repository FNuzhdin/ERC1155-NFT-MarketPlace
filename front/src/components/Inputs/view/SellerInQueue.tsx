import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/Buttons/SimpleButton";
import { readMarket } from "@/hooks/MarketContract";

import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * SellerInQueue component
 *
 * A component for retrieving the seller's address at a specific position (index) in the FT market queue for a given token id.
 * Intended for users who want to inspect the queue for sellers of a particular FT.
 *
 * Features:
 * - Allows the user to input a token (FT) id and a queue index.
 * - Validates that both id and index are numeric.
 * - Fetches the seller's address at the specified queue index using the market contract.
 * - Displays the seller's address as a result or an error message if something goes wrong.
 * - Handles loading and error states, disables inputs and button while loading.
 *
 * UI:
 * - Uses SimpleInput for id and queue index fields.
 * - Uses SimpleButton for the "get" action.
 * - Uses SimpleError to display error messages.
 *
 * Usage:
 * ```tsx
 * <SellerInQueue />
 * ```
 *
 * Note:
 * - Both the token id and the queue index must be numeric.
 * - Inputs are cleared after each request.
 * - Useful for viewing which seller occupies a specific position in the FT market queue.
 * - Only owner can use this component.
 */

const SellerInQueue: React.FC = () => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [id, setId] = useState<string>("");
  const [index, setIndex] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [result, setResult] = useState<string | undefined>(undefined);

  const _handleChangeId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleChangeIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIndex(e.target.value);
  };

  const _handleClick = async () => {
    if(!onlyNumbers({param: id, setError})) return;
    if(!onlyNumbers({param: index, setError})) return;

    setLoad(true);
    setResult(undefined);
    setError(undefined);
    try {
      const result = await readMarket("getSellerInQueue", [id, index]);
      console.log("Get seller result:", result);
      if(typeof result === "string") {
        setResult(result);
      }
    } catch (e) {
      console.error(e);
      setError("Seller in queue error!");
    } finally {
      setLoad(false);
      setId("");
      setIndex("");
    }
  };

  return (
    <div>
      <h2 className="h2-green">Seller in queue</h2>
      <SimpleInput
        placeholder={"id"}
        name={"id"}
        value={id}
        onChange={_handleChangeId}
        disabled={load}
      />
      <SimpleInput
        placeholder={"queue index"}
        name={"index"}
        value={index}
        onChange={_handleChangeIndex}
        disabled={load}
      />
      {result  && <p>Result: {result}</p>}
      <SimpleButton onClick={_handleClick} disabled={load}>
        get
      </SimpleButton>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default SellerInQueue;
