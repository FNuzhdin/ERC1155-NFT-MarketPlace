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
  price: bigint;
};

type Metadata = {
  name: string;
  description: string;
  image: string;
};

/**
 * NFTCard component
 *
 * Displays NFT metadata and allows purchasing a single NFT from the marketplace.
 *
 * Key features and logic:
 * - Receives the price as a prop from the parent component (prices are fetched in batch at the parent level).
 * - Fetches the metadata URI from the token contract using `useTokenRead`.
 * - Loads and validates NFT metadata (name, description, image) from IPFS when the URI changes.
 * - Handles buy operations for the NFT via `writeMarket`. After purchase, triggers the parent's `refetch` to update the list and prices.
 * - Disables the Buy button and displays a warning if the price is not set (undefined or zero).
 * - Uses the `isMounted` pattern in async effects to avoid state updates on unmounted components.
 *
 * State variables:
 * - `metadataUri`: the metadata URI for this NFT (typically an IPFS CID).
 * - `metadata`: parsed NFT metadata (name, description, image) fetched from IPFS.
 * - `error`: string for error messages, displayed to the user.
 * - `load`: boolean indicating if a buy transaction is in progress.
 *
 * Props:
 * - `id`: NFT token ID (bigint)
 * - `address`: user's wallet address
 * - `refetch`: function to trigger parent/query data refresh after purchase
 * - `price`: current NFT price in wei, passed from the parent (batch fetched)
 */

const NFTCard: React.FC<NFTCardProps> = ({ id, address, refetch, price }) => {
  const { data: uri, isLoading: loadingUri } = useTokenRead("uri", [id]);

  const [metadataUri, setMatadataUri] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [metadata, setMetadata] = useState<Metadata | undefined>(undefined);
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

  /**
   * Loads and validates NFT metadata from IPFS when metadataUri changes.
   * Uses isMounted pattern to prevent setState on unmounted component.
   */
  useEffect(() => {
    let isMounted = true;

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
            if(isMounted) setMetadata(obj);
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

    return () => {
      isMounted = false; 
    }
  }, [metadataUri]);

  /**
   * Handles NFT buy operation.
   * After successful transaction, triggers refetch for parent data.
   */
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
          <SimpleButton disabled={false}>
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
        <div className="vertical-stack">
          <img
            className="img-limited"
            src={`https://ipfs.io/ipfs/${metadata?.image}`}
            alt="IPFS Image"
          />
          <div className="simple-row">
            <p className="pink-p">Name:</p>
            <p>{metadata.name}</p>
          </div>
          <div className="simple-row">
            <p className="orange-p">id:</p>
            <p>#{id}</p>
          </div>
        </div>
      )}
      <div className="simple-row">
        <div className="simple-row">
          <p>Price:</p>
          <p className="green-paragraph">{price}</p>
          <p>wei</p>
        </div>
        <SimpleButton  disabled={false}>
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
