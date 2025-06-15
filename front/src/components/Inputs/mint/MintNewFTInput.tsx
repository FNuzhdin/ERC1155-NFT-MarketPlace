import React, { useState } from "react";
import type { MintInputProps } from "./MainMInt";
import ImagePreview from "@/components/Cards/ImagePreview";
import SimpleError from "@/components/Errors/SimpleError";
import { readToken, writeToken } from "@/hooks/TokenContract";
import { ethers } from "ethers";
import { onlyNumbers } from "@/utils/FormatChecks";

type TokenData = {
  file: File | undefined;
  name: string;
  description: string;
  symbol: string;
  value: string;
};

/**
 * MintNewFTInput component
 *
 * A form component for minting a new Fungible Token (FT) with image and metadata.
 * Used by the contract owner in the minting section.
 *
 * Features:
 * - Lets the owner upload an image and provide metadata (name, description, symbol, value).
 * - Validates input fields for length, required presence, and correct formatting.
 * - Checks if the user is the contract owner and if the supply limit is not exceeded.
 * - Uploads image and metadata to IPFS via an API endpoint.
 * - On successful upload, mints a new FT by calling the smart contract.
 * - Handles minting state and disables form inputs during processing.
 * - Shows error messages using the SimpleError component.
 * - Allows cleaning/resetting the form.
 *
 * Props (MintInputProps):
 * - `address` (`0x...` or undefined): Connected wallet address.
 * - `mintStarted` (boolean): Is minting in progress.
 * - `setMintStarted`: Setter for minting state.
 * - `currentId` (bigint | undefined): Current token id.
 * - `refetchCurrentId`: Function to refetch the current token id.
 *
 * Usage:
 * ```tsx
 * <MintNewFTInput
 *   address={address}
 *   mintStarted={mintStarted}
 *   setMintStarted={setMintStarted}
 *   currentId={currentId}
 *   refetchCurrentId={refetchCurrentId}
 * />
 * ```
 *
 * Note:
 * - Only the contract owner should use this component.
 * - Used inside the main mint component to create new FTs with custom metadata and image.
 */

const MintNewFTInput: React.FC<MintInputProps> = ({
  address,
  mintStarted,
  setMintStarted,
  currentId,
  refetchCurrentId,
}) => {
  const [tokenData, setTokenData] = useState<TokenData>({
    file: undefined,
    name: "",
    description: "",
    symbol: "",
    value: "",
  });
  const [error, setError] = useState<string | undefined>(undefined);

  const _handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files !== null &&
      e.target.files[0].type.startsWith("image/")
    ) {
      const file = e.target.files[0];
      setTokenData((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  const _handleChangeData = (
    field: "name" | "description" | "symbol" | "value",
    value: string
  ) => {
    setTokenData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const _handleClickClean = () => {
    setTokenData({
      file: undefined,
      name: "",
      description: "",
      symbol: "",
      value: "",
    });
  };

  const _handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //We are execution cheks before upload in ipfs
    if (
      !(
        tokenData.file ||
        tokenData.name ||
        tokenData.description ||
        tokenData.symbol
      )
    ) {
      setError("All fields must be filled in");
      return;
    }

    const owner = await readToken("owner");
    if (owner !== address) {
      setError("You are not an owner!");
      return;
    }

    if (currentId === undefined) {
      setError("CurrentId error!");
      return;
    }

    const max = ethers.MaxUint256;
    if (!(currentId + BigInt(1) < max)) {
      setError("Max supply is reached!");
      return;
    }

    if(!onlyNumbers({param: tokenData.value, setError})) return;

    if (tokenData.description.length > 20) {
      setError("Description must be shorter");
      return;
    }

    if (tokenData.name.length > 10) {
      setError("Name must be shorter");
      return;
    }

    if (tokenData.symbol.length > 6) {
      setError("Symbol must be shorter");
      return;
    }

    if(Number(tokenData.value) < 2) {
      setError("It's very small value");
      return;
    }

    // Creation formData
    const formData = new FormData();
    if (tokenData.file) {
      formData.append("file", tokenData.file);
    }
    formData.append("name", JSON.stringify(tokenData.name));
    formData.append("description", JSON.stringify(tokenData.description));
    formData.append("symbol", JSON.stringify(tokenData.symbol));
    formData.append("currentId", String(currentId));

    setMintStarted(true);
    try {
      // At this step we are upload image and metadata in ipfs
      const result = await fetch("/api/upload-metadata-FT", {
        method: "POST",
        body: formData,
      });

      if (!result.ok) {
        const errorData = await result.json().catch(() => ({}));
        throw new Error(errorData?.message || `Server error: ${result.status}`);
      }
      const data = await result.json();
      console.log("Data", data);
      if (
        typeof data.imageUri !== "string" ||
        typeof data.metadataUri !== "string"
      ) {
        throw new Error("Unexpected response structure");
      }

      console.log("POST data:", data);
      console.log("Upload in ipfs finised!");

      // At this step we are minting tokens in contract
      console.log("MintNewFT started");
      console.log([address, data.metadataUri, BigInt(tokenData.value)]);
      const hash = await writeToken("mintNewFT", [
        address,
        data.metadataUri,
        BigInt(tokenData.value),
      ]);
      console.log("Hash:", hash);

      refetchCurrentId();
    } catch (e) {
      console.error(e);
      setError("Upload error!");
    } finally {
      setTokenData({
        file: undefined,
        name: "",
        description: "",
        symbol: "",
        value: "",
      });
      setMintStarted(false);
    }
    console.log("Mint status: finished");
  };
  return (
    <div>
      <h2 className="h2-green">Mint new FT</h2>
      <form onSubmit={_handleSubmit}>
        <label className="upload-label">
          <span className="plus-icon">+</span>
          <span className="text">
            {mintStarted ? "Loading..." : "Add Image"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={_handleChangeImage}
            disabled={mintStarted}
          />
        </label>

        {tokenData.file && (
          <div>
            <ImagePreview image={tokenData?.file} index={0} />
            <input
              type="text"
              placeholder="name"
              value={tokenData?.name}
              onChange={(e) => _handleChangeData("name", e.target.value)}
            />
            <input
              type="text"
              placeholder="description"
              value={tokenData?.description}
              onChange={(e) => _handleChangeData("description", e.target.value)}
            />
            <input
              type="text"
              placeholder="symbol"
              value={tokenData?.symbol}
              onChange={(e) => _handleChangeData("symbol", e.target.value)}
            />
            <input
              type="text"
              placeholder="value"
              value={tokenData?.value}
              onChange={(e) => _handleChangeData("value", e.target.value)}
            />
          </div>
        )}
        {tokenData.file && (
          <div>
            <button
              className="small-black-button2"
              type="button"
              onClick={_handleClickClean}
            >
              Clean
            </button>
            <button
              className="small-orange-button"
              type="submit"
              disabled={mintStarted}
            >
              {mintStarted ? "Wait..." : "Mint"}
            </button>{" "}
          </div>
        )}
      </form>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default MintNewFTInput;
