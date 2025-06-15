import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/Buttons/SimpleButton";
import { readMarket } from "@/hooks/MarketContract";

import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * ValueInQueue component
 *
 * A component for retrieving the value (amount) at a specific position (index) in the FT market queue for a given token id.
 * Intended primarily for admin use, as it is only embedded inside GetterComponent, which is admin-only.
 *
 * Features:
 * - Allows the admin to input a token (FT) id and a queue index.
 * - Validates that both id and index are numeric.
 * - Fetches the value at the specified queue position using the market contract.
 * - Displays the value as a result or an error message if something goes wrong.
 * - Handles loading and error states, disables inputs and button while loading.
 *
 * UI:
 * - Uses SimpleInput for id and queue index fields.
 * - Uses SimpleButton for the "get" action.
 * - Uses SimpleError to display error messages.
 *
 * Usage:
 * ```tsx
 * <ValueInQueue />
 * ```
 *
 * Note:
 * - Both the token id and the queue index must be numeric.
 * - Inputs are cleared after each request.
 * - This component is only accessible to admins via the GetterComponent.
 */

const ValueInQueue: React.FC = () => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [id, setId] = useState<string>("");
  const [index, setIndex] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [result, setResult] = useState<bigint | undefined>(undefined);

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
      const result = await readMarket("getValueInQueue", [id, index]);
      console.log("Get value result:", result);
      if (typeof result === "bigint") {
        setResult(result);
      }
    } catch (e) {
      console.error(e);
      setError("Value in queue error!");
    } finally {
      setLoad(false);
      setId("");
      setIndex("");
    }
  };

  return (
    <div>
      <h2 className="h2-green">Value in queue</h2>
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

export default ValueInQueue;
