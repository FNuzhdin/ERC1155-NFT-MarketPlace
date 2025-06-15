import React, { useState } from "react";
import SimpleError from "@/components/Errors/SimpleError";
import { readToken, writeToken } from "@/hooks/TokenContract";
import SimpleInput from "../SimpleInput";
import SimpleButton from "@/components/Buttons/SimpleButton";
import { onlyNumbers } from "@/utils/FormatChecks";

type MintFTInputProps = {
  address: `0x${string}` | undefined;
  mintStarted: boolean;
  setMintStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * MintFTInput component
 *
 * A form component for minting additional supply of an existing fungible token (FT).
 * Used within the minting section by the contract owner/admin.
 *
 * Features:
 * - Allows the owner to specify a token ID and the amount to mint.
 * - Validates input to ensure only numbers are accepted.
 * - Checks if the token exists and verifies that the user is the contract owner.
 * - Prevents minting if the amount is less than 2.
 * - Handles minting state, disables input and button during processing.
 * - Displays error messages via the SimpleError component.
 * - Uses SimpleInput and SimpleButton for uniform UI.
 *
 * Props:
 * - `address`: (`0x...` or undefined) — the connected wallet address.
 * - `mintStarted`: (boolean) — indicates if a minting process is in progress.
 * - `setMintStarted`: (Dispatch) — setter to update minting state.
 *
 * Usage:
 * ```tsx
 * <MintFTInput address={address} mintStarted={mintStarted} setMintStarted={setMintStarted} />
 * ```
 *
 * Note:
 * - This component should only be accessible to the contract owner.
 * - Used inside the main mint component to add supply to an existing FT.
 */

const MintFTInput: React.FC<MintFTInputProps> = ({
  address,
  mintStarted,
  setMintStarted,
}) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<{ id: string; value: string }>({
    id: "",
    value: "",
  });

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const _handleClick = async () => {
    if(!onlyNumbers({param: data.value, setError})) return;
    if(!onlyNumbers({param: data.id, setError})) return;

    const result = await readToken("exists", [data.id]);
    if (result !== true) {
      setError("Token isn't exist!");
      return;
    }

    const owner = await readToken("owner");
    if (owner !== address) {
      setError("You not an owner!");
      return;
    }

    if (Number(data.value) < 2) {
      setError("Value must be bigest!");
      return;
    }

    setMintStarted(true);
    try {
      console.log("Mint FT yet status: started");
      await writeToken("mintFT", [address, data.id, data.value]);
    } catch (error) {
      console.error("Mint FT yet status: error");
      console.error(error);
      setError("Mint error!");
    } finally {
      setData({
        id: "",
        value: "",
      });
    }
    setMintStarted(false);
    console.log("Mint FT yet status: finished");
  };
  return (
    <div>
      <h2 className="h2-green">Mint FT yet</h2>
      <SimpleInput
        placeholder={"id"}
        name={"id"}
        value={data.id}
        onChange={_handleChange}
        disabled={mintStarted}
      />
      <SimpleInput
        placeholder={"value"}
        name={"value"}
        value={data.value}
        onChange={_handleChange}
        disabled={mintStarted}
      />
      {data.id && data.value && (
        <SimpleButton
          className={"small-orange-button"}
          onClick={_handleClick}
          disabled={mintStarted}
        >
          {mintStarted ? "Loading..." : "Mint"}
        </SimpleButton>
      )}
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default MintFTInput;
