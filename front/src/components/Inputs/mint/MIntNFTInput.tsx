import React, { useState } from "react";
import type { MintInputProps } from "./MainMInt";

import { readToken, writeToken } from "@/hooks/TokenContract";
import { ethers } from "ethers";

import ImagePreview from "@/components/Cards/ImagePreview";
import SimpleError from "@/components/Errors/SimpleError";

type ImageItem = {
  file: File;
  name: string;
  description: string;
};

/**
 * MintNFTInput component
 *
 * A form component for minting a collection of new NFTs (Non-Fungible Tokens) by uploading multiple images and metadata.
 * Intended for use by the contract owner in the mint section.
 *
 * Features:
 * - Allows uploading multiple images (2–50) for batch NFT minting.
 * - For each image, user can specify a name and description.
 * - Validates:
 *   - 2 to 50 images must be uploaded.
 *   - Only the contract owner can mint.
 *   - The token supply does not exceed the contract's max limit.
 * - Uploads images and metadata to IPFS via an API endpoint.
 * - On success, calls the smart contract to mint each NFT.
 * - Handles and displays errors using the SimpleError component.
 * - Allows removal of individual images or clearing the entire selection.
 * - Disables form controls during minting.
 *
 * Props (MintInputProps):
 * - `address`: (string | undefined) — Current wallet address.
 * - `mintStarted`: (boolean) — Minting state indicator.
 * - `setMintStarted`: Setter for minting state.
 * - `currentId`: (bigint | undefined) — Current token id.
 * - `refetchCurrentId`: Function to refetch the current token id.
 *
 * Usage:
 * ```tsx
 * <MintNFTInput
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
 * - Used inside the main mint component to create NFT collections in batch.
 */

const MintNFTInput: React.FC<MintInputProps> = ({
  address,
  mintStarted,
  setMintStarted,
  currentId,
  refetchCurrentId,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const _handleChangeImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      name: "",
      description: "",
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const _handleChangeData = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    setImages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const _handleClickClean = (indexToRemote: number) => {
    setImages(images.filter((_, i) => i !== indexToRemote));
  };

  const _handleClickCleanAll = () => {
    setImages([]);
  };

  const _handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> 
  ) => {
    e.preventDefault();

    //We are execution cheks before upload in ipfs
    if (!(images.length > 1 && images.length <= 50)) {
      setError("Collection must be 2 to 50 NFT!");
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
    const length = BigInt(images.length);
    if (!(currentId + length < max)) {
      setError("Max supply is reached!");
      return;
    }

    // Creation formData
    const formData = new FormData();
    images.forEach(({ file }) => {
      formData.append("file", file);
    });

    formData.append("names", JSON.stringify(images.map((i) => i.name)));
    formData.append(
      "descriptions",
      JSON.stringify(images.map((i) => i.description))
    );
    formData.append("currentId", String(currentId));

    console.log("FormData preview:");
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    setMintStarted(true);
    try {
      // At this step we are upload image and metadata in ipfs
      const result = await fetch("/api/upload-metadata-NFT", {
        method: "POST",
        body: formData,
      });

      if (!result.ok) {
        const errorData = await result.json().catch(() => ({}));
        throw new Error(errorData?.message || `Server error: ${result.status}`);
      }
      const data = await result.json();

      if (
        typeof data.length !== "number" ||
        typeof data.imageUri !== "string" ||
        typeof data.metadataUri !== "string"
      ) {
        throw new Error("Unexpected response structure");
      }

      console.log("POST data:", data);
      console.log("Upload in ipfs finised!");

      // At this step we are minting tokens in contract
      console.log("MintNFT started");
      const singleValue = Array.from({ length: data.length }, () => BigInt(1));
      const hash = await writeToken("mintNFT", [
        address,
        data.metadataUri,
        BigInt(data.length),
        singleValue,
      ]);
      console.log("Hash:", hash);

      refetchCurrentId();
    } catch (e) {
      console.error(e);
      setError("Upload error!");
    } finally {
      setImages([]);
      setMintStarted(false);
    }
    console.log("Mint status: finished");
  };
  return (
    <div>
      <h2 className="h2-green">Mint NFT</h2>
      <form onSubmit={_handleSubmit}>
        <label className="upload-label">
          <span className="plus-icon">+</span>
          <span className="text">
            {mintStarted ? "Loading..." : "Add Image"}
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={_handleChangeImages}
            disabled={mintStarted}
          />
        </label>

        {images.map((img, index) => (
          <div key={index}>
            <ImagePreview image={img.file} index={index} />
            <input
              type="text"
              placeholder="name"
              value={img.name}
              onChange={(e) => _handleChangeData(index, "name", e.target.value)}
            />
            <input
              type="text"
              placeholder="description"
              value={img.description}
              onChange={(e) =>
                _handleChangeData(index, "description", e.target.value)
              }
            />
            <button
              className="small-black-button2"
              onClick={() => _handleClickClean(index)}
            >
              x
            </button>
          </div>
        ))}
        {images.length > 0 && (
          <div>
            <button
              className="small-black-button2"
              type="button"
              onClick={_handleClickCleanAll}
            >
              Clean all
            </button>
            <button
              className="small-orange-button"
              type="submit"
              disabled={mintStarted}
            >
              {mintStarted ? "Wait..." : "Mint"}
            </button>
          </div>
        )}
      </form>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default MintNFTInput;
