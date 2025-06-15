import React, { useState, useEffect } from "react";

import { useTokenRead } from "@/hooks/TokenContract";
import { useMarketRead } from "@/hooks/MarketContract";
import { writeMarket } from "@/hooks/MarketContract";

import SimpleButton from "../Buttons/SimpleButton";
import { IoIosRefresh } from "react-icons/io";
import SimpleError from "../Errors/SimpleError";

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

/**
 * NFTCard component
 *
 * Displays metadata and allows purchasing of a single NFT from the marketplace.
 *
 * State variables:
 * - `metadataUri`: Holds the metadata URI (usually an IPFS CID) for the NFT.
 * - `metadata`: Parsed metadata object (name, description, image) fetched from IPFS.
 * - `error`: String for error messages, displayed to the user.
 * - `price`: Current NFT price in wei, fetched from the market contract.
 * - `load`: Boolean indicating if a buy transaction is in progress.
 *
 * Loads on-chain data using contract hooks for URI and price.
 * Fetches and validates metadata from IPFS.
 * Handles the buy operation with appropriate loading and error handling.
 * If the price is not set (undefined or zero), disables purchase and shows a warning.
 *
 * Props:
 * - `id`: NFT token ID (bigint)
 * - `address`: User wallet address
 * - `refetch`: Function to refetch parent/query data after purchase
 */

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

  /**
   * Loads and validates NFT metadata from IPFS whenever metadataUri changes.
   * Sends a POST request to /api/get-ipfs-metadata.
   * Sets metadata if valid, else sets error.
   */
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

  // Don't render NFT for purchase if price isn't set
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

/**
 * Type guard for the Metadata type.
 * Checks if the input object conforms to the expected Metadata structure:
 * - Must be a non-null object.
 * - Must have string properties: name, description, image.
 * Used to validate server responses for NFT metadata.
 */
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
