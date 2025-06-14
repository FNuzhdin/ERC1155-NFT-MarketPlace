import React, { useState } from "react";
import SimpleButton from "../../Buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import SimpleInput from "../SimpleInput";
import { readToken } from "@/hooks/TokenContract";
import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * BalanceInput component
 *
 * A form component for querying the balance of a specific token ID for a given account address.
 * Intended for viewing token balances by any user.
 *
 * Features:
 * - Allows the user to enter a token ID and an Ethereum account address.
 * - Validates the address format and that the token ID is a number.
 * - Calls the `balanceOf` method on the smart contract to fetch the balance.
 * - Displays the retrieved balance or an error message.
 * - Disables inputs and button during loading.
 *
 * UI:
 * - Uses SimpleInput for token ID and account address fields.
 * - Uses SimpleButton for the "get" action.
 * - Uses SimpleError to display error messages.
 *
 * Usage:
 * ```tsx
 * <BalanceInput />
 * ```
 *
 * Note:
 * - The account field must be a valid Ethereum address (0x... and 42 chars).
 * - The token ID field must be numeric.
 * - Inputs are reset after a request.
 */

const BalanceInput: React.FC = () => {
  const [load, setLoad] = useState<boolean>(false);
  const [balanceData, setBalanceData] = useState<{
    id: string;
    account: string;
  }>({ id: "", account: "" });

  const [error, setError] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);

  console.log("Component 'BalanceInput' booted");
  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBalanceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const _handleClick = async () => {
    if (
      !(
        balanceData.account.substring(0, 2) === "0x" &&
        balanceData.account.length === 42
      )
    ) {
      setError("Incorrect address");
      setBalanceData({ id: "", account: "" });
      return;
    } else {
      if(!onlyNumbers({param: balanceData.id, setError})) return;

      setError(undefined);
      setLoad(true);
      setBalance(undefined);
      try {
        const result = await readToken("balanceOf", [
          balanceData.account,
          balanceData.id,
        ]);
        if (typeof result === "bigint") {
          setBalance(String(result));
        }
      } catch (error) {
        console.error(error);
        setError("Exists error");
      } finally {
        setBalanceData({ id: "", account: "" });
      }
      setLoad(false);
    }
  };
  return (
    <div>
      <h2 className="h2-green">Account balance</h2>
      <div className="simple-row">
        <div className="vertical-stack">
          <SimpleInput
            placeholder={"id"}
            name={"id"}
            value={balanceData.id}
            onChange={_handleChange}
            disabled={load}
          />
          <SimpleInput
            placeholder={"account"}
            name={"account"}
            value={balanceData.account}
            onChange={_handleChange}
            disabled={load}
          />
        </div>
        <SimpleButton disabled={load} onClick={_handleClick}>
          get
        </SimpleButton>
      </div>
      {balance && <p>result: {balance}</p>}
      {error && <SimpleError error={error} setError={setError} />}
    </div>
  );
};

export default BalanceInput;
