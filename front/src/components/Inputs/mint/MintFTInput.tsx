import React, { useState } from "react";
import SimpleError from "@/components/Errors/SimpleError";
import { readToken, writeToken } from "@/hooks/TokenContract";
import SimpleInput from "../SimpleInput";
import SimpleButton from "@/components/buttons/SimpleButton";

type MintFTInputProps = {
  address: `0x${string}` | undefined;
  mintStarted: boolean;
  setMintStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

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
    const onlyNumbersValue = /^\d+$/.test(data.value);
    if (!onlyNumbersValue) {
      setError("Only numbers in value, pls!");
      return;
    }

    const onlyNumbersId = /^\d+$/.test(data.value);
    if (!onlyNumbersId) {
      setError("Only numbers in id, pls!");
      return;
    }

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
