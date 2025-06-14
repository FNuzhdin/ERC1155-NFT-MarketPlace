import { useTokenRead, writeToken } from "@/hooks/TokenContract";
import { useMarketRead, writeMarket } from "@/hooks/MarketContract";

import React, { useEffect, useState } from "react";
import SimpleButton from "../Buttons/SimpleButton";
import { IoIosRefresh } from "react-icons/io";
import SimpleInput from "../Inputs/SimpleInput";

import { MARKET_ADDR } from "@/utils/ProvenAddresses";
import SimpleError from "../Errors/SimpleError";

import question from "../../images/question.png";
import Image from "next/image";
import { onlyNumbers } from "@/utils/FormatChecks";

type FTCardProps = {
  id: bigint;
  address: `0x${string}` | undefined;
};

type Metadata = {
  name: string;
  description: string;
  image: string;
  decimals: number;
  symbol: string;
};

/**
 * FTCard component
 *
 * Displays and allows trading of a fungible token (FT) in the marketplace.
 *
 * State variables:
 * - `metadataUri`: Holds the token's metadata URI (usually IPFS CID).
 * - `metadata`: Parsed metadata object (name, description, image, symbol, decimals).
 * - `error`: String for error messages, displayed to the user.
 * - `price`: Current token price in wei, fetched from the market contract.
 * - `balance`: Token balance available in the market contract for this token.
 * - `value`: User input for buy/sell amount.
 * - `load`: Whether a buy/sell transaction is currently in progress.
 *
 * Loads on-chain data via contract hooks.
 * Handles buy/sell actions with validation and error handling.
 * Uses custom UI components for input, error display, and buttons.
 *
 * Props:
 * - `id`: Token ID (bigint)
 * - `address`: User wallet address
 */

const FTCard: React.FC<FTCardProps> = ({ id, address }) => {
  const { data: uri, isLoading: loadingUri } = useTokenRead("uri", [id]);
  const {
    data: currentPrice,
    isLoading: loadingPrice,
    refetch: refetchPrice,
  } = useMarketRead("getPriceFT", [id]);
  const { data: marketTokenBalance, isLoading: loadingMarketBalance } =
    useTokenRead("balanceOf", [MARKET_ADDR, id]);

  const [metadataUri, setMatadataUri] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [metadata, setMetadata] = useState<Metadata | undefined>(undefined);
  const [price, setPrice] = useState<bigint | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  useEffect(() => {
    if (typeof marketTokenBalance === "bigint") {
      console.log(`Current market balance (id: ${id}): ${marketTokenBalance}`);
      setBalance(marketTokenBalance);
    } else {
      console.log("Market token balance isn't format");
    }
  }, [loadingMarketBalance, marketTokenBalance]);

  useEffect(() => {
    if (typeof currentPrice === "bigint") {
      console.log(`Current token price (id: ${id}):  ${currentPrice}`);
      setPrice(currentPrice);
    } else {
      console.log("currentPrice type isn't on format");
    }
  }, [loadingPrice, currentPrice]);

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
   * Loads and validates token metadata from IPFS whenever metadataUri changes.
   * Sends a POST request to /api/get-ipfs-metadata.
   * Sets metadata if valid, else sets error.
   */
  useEffect(() => {
    (async () => {
      if (metadataUri) {
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

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const _handleClickBuy = async () => {
    if(!onlyNumbers({param: value, setError})) return;

    if (Number(value) === 0) {
      setError("Zero value prohibited");
      return;
    }

    setLoad(true);
    setError(undefined);
    try {
      if (typeof id === "bigint" && price !== undefined) {
        const hash = await writeMarket(
          "buyFT",
          [id, value],
          address,
          price * BigInt(value)
        );
        console.log("Buy hash:", hash);
      } else {
        throw new Error("Error id type: id must be bigint");
      }
    } catch (e) {
      console.error(e);
      setError("Buy problem");
    } finally {
      setLoad(false);
      setValue("");
    }
  };

  const _handleClickSell = async () => {
    if(!onlyNumbers({param: value, setError})) return;

    if (Number(value) === 0) {
      setError("Zero value prohibited");
      return;
    }

    setLoad(true);
    setError(undefined);
    try {
      const hash = await writeToken("safeTransferFrom", [
        address,
        MARKET_ADDR,
        id,
        value,
        "0x",
      ]);
      if (typeof hash === "string") {
        console.log("Sell hash:", hash);
      } else {
        throw new Error("Sell problem");
      }
    } catch (e) {
      console.error(e);
      setError("Sell problem");
    } finally {
      setLoad(false);
      setValue("");
    }
  };

  return (
    <div className="vertical-stack, flex-container-unsize">
      {!loadingUri && metadata ? (
        <div className="simple-row">
          <img
          className="img-limited"
          src={`https://ipfs.io/ipfs/${metadata?.image}`}
          alt="IPFS Image"
        />
          <p>Name: {metadata.name}</p>
          <p>Symbol: {metadata.symbol}</p>
        </div>
      ) : (
        <Image src={question} alt="..." className="img-limited" />
      )}

      {balance && <p>Availible: {balance / BigInt(1000000)}million Tokens</p>}

      {price && (
        <div className="simple-row">
          <p>1 token: {loadingPrice ? "Loading..." : price} wei</p>
          <SimpleButton onClick={() => refetchPrice()} disabled={loadingPrice}>
            <IoIosRefresh />
          </SimpleButton>
        </div>
      )}

      {price && (
        <div className="vertical-stack">
          <SimpleInput
            placeholder={"value"}
            name={"value"}
            value={value}
            onChange={_handleChange}
            disabled={load}
          />
          <div className="simple-row">
            <SimpleButton
              className={"small-orange-button"}
              onClick={_handleClickSell}
              disabled={load}
            >
              Sell
            </SimpleButton>
            {balance !== BigInt(0) ? (
              <SimpleButton
                className={"small-green-button"}
                onClick={_handleClickBuy}
                disabled={load}
              >
                Buy
              </SimpleButton>
            ) : (
              <SimpleButton className={"small-green-button"} disabled={true}>
                No funds
              </SimpleButton>
            )}
          </div>
          <SimpleError error={error} setError={setError} />
        </div>
      )}
    </div>
  );
};

/**
 * Type guard for the Metadata type.
 * Checks if the input object conforms to the expected Metadata structure:
 * - Must be a non-null object.
 * - Must have string properties: name, description, image, symbol.
 * - Must have a numeric property: decimals.
 * Used to validate server responses for token metadata.
 */
export function isMetadata(obj: any): obj is Metadata {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.name === "string" &&
    typeof obj.description === "string" &&
    typeof obj.image === "string" &&
    typeof obj.symbol === "string" &&
    typeof obj.decimals === "number"
  );
}

export default FTCard;
