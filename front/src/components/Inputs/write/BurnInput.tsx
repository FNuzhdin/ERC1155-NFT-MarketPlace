import { writeToken } from "@/hooks/TokenContract";
import React, { useState } from "react";
import SimpleError from "../../Errors/SimpleError";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../buttons/SimpleButton";

type BurnInputProps = {
  address: `0x${string}` | undefined;
};

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
    let onlyNumbers = /^\d+$/.test(tokenData.NFT);
    if (!onlyNumbers) {
      setErrorNFT("Only numbers, please");
      console.warn("Only numbers in input 'id', please");
      return;
    }

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
    let onlyNumbers = /^\d+$/.test(tokenData.FT);
    if (!onlyNumbers) {
      setErrorFT("Only numbers, please");
      console.warn("Only numbers in input 'id', please");
      return;
    }

    onlyNumbers = /^\d+$/.test(tokenData.value);
    if (!onlyNumbers) {
      setErrorFT("Only numbers, please");
      console.warn("Only numbers in input 'value', please");
      return;
    }

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
