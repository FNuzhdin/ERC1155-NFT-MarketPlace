import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../Buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { writeToken } from "@/hooks/TokenContract";
import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * WithdrawInput component
 *
 * Allows the contract owner to withdraw a single token (by id) from the TokenERC1155 contract if it was accidentally sent there.
 *
 * Key points:
 * - Only the owner can use this component.
 * - Enter token id (number) to withdraw it from the contract.
 * - Calls `withdrawSingle` on the TokenERC1155 contract.
 * - Shows loading state and error messages if input is invalid or transaction fails.
 *
 * UI:
 * - `SimpleInput` for token id.
 * - `SimpleButton` to confirm withdrawal.
 * - `SimpleError` to display errors.
 *
 * Usage:
 * ```tsx
 * <WithdrawInput />
 * ```
 *
 * Notes:
 * - For owner use only.
 * - Use to recover a token that ended up in the TokenERC1155 contract by mistake.
 * - Field clears after operation.
 */

const WithdrawInput: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  console.log("Component 'WithdrawInput' booted");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleClick = async () => {
    if(!onlyNumbers({param: id, setError})) return;

    setLoad(true);
    setError(undefined);
    try {
      const hash = await writeToken("withdrawSingle", [id]);
      console.log("Tx hash:", hash);
    } catch (e) {
      setError("Withdraw error!");
      console.error(e);
    } finally {
      setId("");
    }
    setLoad(false);
  };
  return (
    <div className="vertical-stack">
      <h2 className="h2-green">Withdraw single</h2>
      <div className="simple-row">
        <SimpleInput
          placeholder={"id"}
          name={"id"}
          value={id}
          onChange={_handleChange}
          disabled={load}
        />
        <SimpleButton disabled={load} onClick={_handleClick}>
          withdraw
        </SimpleButton>
      </div>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default WithdrawInput;
