import React, { ReactElement, ReactEventHandler, useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../Buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { readToken } from "@/hooks/TokenContract";
import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * ExistsInput component
 *
 * A form component for checking if a token with a specific ID exists in the contract.
 * Suitable for use by any user wanting to verify token existence.
 *
 * Features:
 * - Allows the user to enter a token ID.
 * - Validates that the token ID is a number.
 * - Calls the `exists` method of the smart contract to check existence.
 * - Displays 'true' or 'false' as result, or an error message if something goes wrong.
 * - Disables input and button during loading.
 *
 * UI:
 * - Uses SimpleInput for the token ID field.
 * - Uses SimpleButton for the "get" action.
 * - Uses SimpleError to display error messages.
 *
 * Usage:
 * ```tsx
 * <ExistsInput />
 * ```
 *
 * Note:
 * - The token ID must be numeric.
 * - Input is cleared after each request.
 */

const ExistsInput: React.FC = () => {
  const [load, setLoad] = useState<boolean>(false);
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isExists, setIsExists] = useState<string | undefined>(undefined);

console.log("Component 'ExistsInput' booted");
  
  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleClick = async () => {
    if(!onlyNumbers({param: id, setError})) return;

    setError(undefined);
    setLoad(true); 
    setIsExists(undefined); 
    try {
        const result = await readToken("exists", [id]);
        if(typeof result === "boolean") {
            setIsExists(String(result)); 
        } 
    } catch (error) {
        console.error(error);
        setError("Exists error");
    } finally {
        setId("")
    }
    setLoad(false); 
  };
  return (
    <div>
      <h2 className="h2-green">Is exist?</h2>
      <div className="simple-row">
        <SimpleInput
          placeholder={"id"}
          name={"id"}
          value={id}
          onChange={_handleChange}
          disabled={load}
        />
        <SimpleButton disabled={load} onClick={_handleClick}>
          get
        </SimpleButton>
      </div>
      {isExists && <p>result: {isExists}</p>}
      {error && <SimpleError error={error} setError={setError} />}
    </div>
  );
};

export default ExistsInput;
