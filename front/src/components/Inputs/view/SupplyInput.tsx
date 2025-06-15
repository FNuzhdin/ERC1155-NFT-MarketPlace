import React, { useState } from "react";
import SimpleError from "../../Errors/SimpleError";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../Buttons/SimpleButton";
import { readToken } from "@/hooks/TokenContract";

import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * SupplyInput component
 *
 * A form component for retrieving the total supply of a token by its id.
 * Can be used by both the contract owner and regular users.
 *
 * Features:
 * - Allows the user to input a token id.
 * - Validates that the id is numeric.
 * - Fetches the total supply for the given id by calling the `totalSupply` method on the smart contract.
 * - Displays the result (current supply) or an error message.
 * - Provides a button to clear the displayed supply.
 * - Handles loading and error states, disables inputs and buttons during loading.
 *
 * UI:
 * - Uses SimpleInput for the id field.
 * - Uses SimpleButton for "get" and "clean" actions.
 * - Uses SimpleError to display error messages.
 *
 * Usage:
 * ```tsx
 * <SupplyInput />
 * ```
 *
 * Note:
 * - The token id must be numeric.
 * - Input is not cleared after a request unless the user clicks "clean".
 * - Both owners and standard users can access this component to view token supply.
 */

const SupplyInput: React.FC = () => {
  const [supply, setSupply] = useState<bigint | undefined>(undefined);
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);

  console.log("Component 'SupplyInput' booted");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleClickSupply = async () => {
    if(!onlyNumbers({param: id, setError})) return;

    setError(undefined);
    setLoad(true);
    console.log(id);
    console.log(typeof id);

    try {
      const result = await readToken("totalSupply", [BigInt(id)]);
      console.log("Total supply by id:", result);
      if (typeof result === "bigint") {
        setSupply(result);
        console.log("Total supply by id:", supply);
      }
    } catch (error) {
      console.error(error);
      setError("Supply error");
    }
    setLoad(false);
  };

  return (
    <div>
      <h2 className="h2-green">Supply</h2>
      <div className="simple-row">
        <div className="vertical-stack">
          <SimpleInput
            placeholder={"id"}
            name={"supply"}
            value={id}
            onChange={_handleChange}
            disabled={load}
          />
          {supply && (
            <div>
              <p>
                Current supply:
                <span className="aquamarine-paragraph">{supply}</span>
              </p>
              <SimpleButton
                disabled={load}
                onClick={() => setSupply(undefined)}
              >
                clean
              </SimpleButton>
            </div>
          )}
        </div>
        <SimpleButton disabled={load} onClick={_handleClickSupply}>
          get
        </SimpleButton>
      </div>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default SupplyInput;
