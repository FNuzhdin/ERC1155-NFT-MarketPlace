import { writeToken } from "@/hooks/TokenContract";
import React, { useState } from "react";
import SimpleError from "../../Errors/SimpleError";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../Buttons/SimpleButton";

import { onlyNumbers } from "@/utils/FormatChecks";

type BurnInputProps = {
  address: `0x${string}` | undefined;
};

/**
 * BurnInput component
 *
 * A component for burning both NFT and FT tokens by their id.
 * Can be used by any user to destroy their tokens.
 *
 * Features:
 * - **Burn NFT:**  
 *   Allows the user to input an NFT token id and burn one instance of it.
 *   Only valid numeric ids are accepted.
 *   Calls the `burn` method on the smart contract with value `1` for NFTs.
 *
 * - **Burn FT:**  
 *   Allows the user to input an FT token id and a value (amount) to burn.
 *   Both id and value must be numeric.
 *   Calls the `burn` method on the smart contract with the provided amount for FTs.
 *
 * - **Validation:**  
 *   Ensures that all entered ids and values are numbers.
 *   Displays separate error messages for NFT and FT fields as appropriate.
 *
 * - **Loading & Error Handling:**  
 *   Disables inputs and buttons during transactions.
 *   Provides immediate feedback for input errors and transaction failures using `SimpleError`.
 *
 * UI:
 * - Uses `SimpleInput` for id and value fields.
 * - Uses `SimpleButton` for burn actions.
 * - Uses `SimpleError` to display error messages.
 *
 * Props:
 * - `address` (`0x...` or undefined): The connected wallet address (required for burning tokens).
 *
 * Usage:
 * ```tsx
 * <BurnInput address={address} />
 * ```
 *
 * Note:
 * - Both regular users and admins can use this component to burn their tokens.
 * - Input fields are cleared after each successful burn attempt.
 */

const BurnInput: React.FC<BurnInputProps> = ({ address }) => {
  const [tokenData, setTokenData] = useState<{
    NFT: string;
    FT: string;
    value: string;
  }>({ NFT: "", FT: "", value: "" });
  const [errorNFT, setErrorNFT] = useState<string | undefined>(undefined);
  const [errorFT, setErrorFT] = useState<string | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);

  console.log("Component 'BurnInput' booted");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTokenData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const _burnNFTToken = async () => {
    if(!onlyNumbers({param: tokenData.NFT, setError: setErrorNFT})) return;

    setErrorNFT(undefined);
    setLoad(true);
    try {
      await writeToken("burn", [address, tokenData.NFT, 1]);
    } catch (error) {
      console.error(error);
      setErrorNFT("Burn error");
    } finally {
      setTokenData({ NFT: "", FT: "", value: "" });
    }
    setLoad(false);
  };

  const _burnFTToken = async () => {
    if(!onlyNumbers({param: tokenData.FT, setError: setErrorFT})) return;
    if(!onlyNumbers({param: tokenData.value, setError: setErrorFT})) return;

    setErrorFT(undefined);
    setLoad(true);
    try {
      await writeToken("burn", [address, tokenData.FT, tokenData.value]);
    } catch (error) {
      console.error(error);
      setErrorFT("Burn error");
    } finally {
      setTokenData({ NFT: "", FT: "", value: "" });
    }
    setLoad(false);
  };
  return (
    <div>
      <h2 className="h2-green">Burn NFT token</h2>
      <div className="simple-row">
        <SimpleInput
          placeholder={"id"}
          name={"NFT"}
          value={tokenData.NFT}
          onChange={_handleChange}
          disabled={load}
        />
        <SimpleButton disabled={load} onClick={_burnNFTToken}>
          burn
        </SimpleButton>
      </div>
      <SimpleError error={errorNFT} setError={setErrorNFT} />
      <h2 className="h2-green">Burn FT tokens</h2>
      <div className="simple-row">
        <div>
          <SimpleInput
            placeholder={"id"}
            name={"FT"}
            value={tokenData.FT}
            onChange={_handleChange}
            disabled={load}
          />
          <SimpleInput
            placeholder={"value"}
            name={"value"}
            value={tokenData.value}
            onChange={_handleChange}
            disabled={load}
          />
        </div>
        <SimpleButton disabled={load} onClick={_burnFTToken}>
          burn
        </SimpleButton>
      </div>
      <SimpleError error={errorFT} setError={setErrorFT} />
    </div>
  );
};

export default BurnInput;
