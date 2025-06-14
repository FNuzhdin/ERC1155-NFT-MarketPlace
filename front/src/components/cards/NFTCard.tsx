import React, { useState, useEffect } from "react";

import { useTokenRead } from "@/hooks/TokenContract";
import { useMarketRead } from "@/hooks/MarketContract";
import { writeMarket } from "@/hooks/MarketContract";

import SimpleButton from "../buttons/SimpleButton";
import { IoIosRefresh } from "react-icons/io";
import SimpleError from "../Errors/SimpleError";

import Image from "next/image";
import question from "../../images/question.png";

import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import type { ReadContractErrorType } from "wagmi/actions";

type NFTCardProps = {
  id: bigint;
  address: `0x${string}` | undefined;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<unknown, ReadContractErrorType>>;
};

type Metadata = {
  name: string;
  description: string;
  image: string;
};

const NFTCard: React.FC<NFTCardProps> = ({ id, address, refetch }) => {
  const { data: uri, isLoading: loadingUri } = useTokenRead("uri", [id]);
  const {
    data: currentPrice,
    isLoading: loadingPrice,
    refetch: refetchPrice,
  } = useMarketRead("getPriceNFT", [id]);

  const [metadataUri, setMatadataUri] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [metadata, setMetadata] = useState<Metadata | undefined>(undefined);
  const [price, setPrice] = useState<bigint | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);

  useEffect(() => {
    if (typeof uri === "string" && uri !== "") {
      console.log("From contract result:", uri);
      setMatadataUri(uri);
    } else {
      console.log(
        "Uri problem: data is emty string or type of data isn't string"
      );
    }
  }, [uri, loadingUri]);

  useEffect(() => {
    if (typeof currentPrice === "bigint") {
      console.log(`Current token price (id: ${id}):  ${currentPrice}`);
      setPrice(currentPrice);
    } else {
      console.log("currentPrice type isn't on format");
      console.log("Price:", price);
    }
  }, [loadingPrice, currentPrice]);

  useEffect(() => {
    (async () => {
      if (metadataUri) {
        console.log("Metadata URI: ", metadataUri);
        try {
          const res = await fetch("/api/get-ipfs-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cid: metadataUri }),
          });

          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }

          const obj = await res.json();
          console.log("Metadata object:", obj);

          if (isMetadata(obj)) {
            setMetadata(obj);
          } else {
            console.error("Object from server have incorrect format");
            setError("Incorrect format metadata");
          }
        } catch (e) {
          console.error(e);
          setError("Server error!");
        }
      } else console.log("metadata don't exists");
    })();
  }, [metadataUri]);

  const _handleClickBuy = async () => {
    setLoad(true);
    setError(undefined);
    try {
      if (typeof id === "bigint" && price !== undefined) {
        const hash = await writeMarket("buyNFT", [id], address, price);
        console.log("Buy hash:", hash);
      } else {
        throw new Error("Error id type: id must be bigint");
      }
    } catch (e) {
      console.error(e);
      setError("Buy problem");
    } finally {
      setLoad(false);
    }
    refetch();
  };

  /* чтобы не отображалось nft, если не установлена цена */
  if (price === undefined || price === BigInt(0)) {
    return (
      <div className="vertical-stack">
        {!loadingUri && metadata?.image && (
          <img
            className="img-limited"
            src={`https://ipfs.io/ipfs/${metadata?.image}`}
            alt="IPFS Image"
          />
        )}
        <div className="simple-row">
          <p className="orange-p">Price isn't set</p>
          <SimpleButton onClick={() => refetchPrice()} disabled={loadingPrice}>
            <IoIosRefresh />
          </SimpleButton>
        </div>
        <SimpleButton className={"small-green-button"} disabled={true}>
          no price
        </SimpleButton>
        <SimpleError error={error} setError={setError} />
      </div>
    );
  }

  return (
    <div className="vertical-stack">
      {!loadingUri && metadata && (
        <div className="simple-row">
          <img
            className="img-limited"
            src={`https://ipfs.io/ipfs/${metadata?.image}`}
            alt="IPFS Image"
          />
          <p>Name: {metadata.name}</p>
        </div>
      )}
      <div className="simple-row">
        <p>Cost: {price} wei</p>
        <SimpleButton onClick={() => refetchPrice()} disabled={loadingPrice}>
          <IoIosRefresh />
        </SimpleButton>
      </div>
      <SimpleButton
        className={"small-green-button"}
        onClick={_handleClickBuy}
        disabled={load}
      >
        Buy
      </SimpleButton>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export function isMetadata(obj: any): obj is Metadata {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.name === "string" &&
    typeof obj.description === "string" &&
    typeof obj.image === "string"
  );
}

export default NFTCard;
