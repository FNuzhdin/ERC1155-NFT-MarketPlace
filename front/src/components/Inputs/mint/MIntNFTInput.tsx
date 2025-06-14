import React, { useState } from "react";

import type { ImageItem } from "./MainMInt";
import type { MintInputProps } from "./MainMInt";

import { readToken, writeToken } from "@/hooks/TokenContract";
import { ethers } from "ethers";

import ImagePreview from "@/components/cards/ImagePreview";
import SimpleError from "@/components/Errors/SimpleError";

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
    field: "name" | "description" /* консп делаем "объединенный тип" 
    который говорит, что field может быть строго такими строками */,
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
    e: React.FormEvent<HTMLFormElement> /* это
      generic, в нем можно указывать тип DOM-элемента, на котором 
      возникаепт событие (input, form, button, select) */
  ) => {
    e.preventDefault();

    /**
     * @description
     * We are execution cheks before upload in ipfs
     */
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

    /**
     * @description Creation formData
     */
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
      /**
       * @description
       * At this step we are upload image and metadata in ipfs
       */
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

      /** 
       * @description
       * At this step we are minting tokens in contract
       */
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
