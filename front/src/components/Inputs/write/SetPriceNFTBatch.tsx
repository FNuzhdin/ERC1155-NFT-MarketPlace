import React, { useState } from "react";

import SimpleInput from "../SimpleInput";
import SimpleButton from "@/components/Buttons/SimpleButton";
import SimpleError from "@/components/Errors/SimpleError";
import { writeMarket } from "@/hooks/MarketContract";
import { onlyNumbersComma } from "@/utils/FormatChecks";

/**
 * SetPriceNFTBatch component
 *
 * This component allows any user to batch set prices for multiple NFTs that they have already listed for sale on the marketplace.
 * Only NFTs already exhibited by the user can have their prices updated through this form.
 *
 * Features:
 * - **Batch Set NFT Prices:**  
 *   Users can input comma-separated lists of NFT ids and corresponding prices (in wei).
 *   Both lists must be the same length (one price per id).
 *   Calls the `setPriceNFTBatch` method on the market contract to update the prices in a single transaction.
 *
 * - **Validation:**  
 *   Checks that both ids and prices are comma-separated lists of numbers.
 *   Verifies that both lists have the same length.
 *   Only allows price updates for NFTs the user has already put up for sale.
 *
 * - **User Feedback:**  
 *   Displays loading state during the transaction.
 *   Shows the transaction hash upon success.
 *   Displays clear error messages for input or contract errors.
 *
 * UI:
 * - Uses `SimpleInput` for ids and prices.
 * - Uses `SimpleButton` for the "set" action.
 * - Uses `SimpleError` to display error messages.
 *
 * Usage:
 * ```tsx
 * <SetPriceNFTBatch />
 * ```
 *
 * Notes:
 * - Any user can use this component, but can only set prices for NFTs they own and have listed for sale.
 * - Input fields are cleared after a transaction.
 * - Transaction hash is partially shown after a successful call.
 */

const SetPriceNFTBatch: React.FC = () => {
  const [data, setData] = useState<{ ids: string; prices: string }>({
    ids: "",
    prices: "",
  });
  const [load, setLoad] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [hash, setHash] = useState<string>("");

  const _hanldeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
        ...prev,
        [name]: value,
    }));
  }

  const _handleClick = async() => {
    if(!onlyNumbersComma({param: data.ids, setError})) return;
    if(!onlyNumbersComma({param: data.prices, setError})) return;

    const idsArr = data.ids.split(",").map(i => Number(i.trim()));
    const pricesArr = data.prices.split(",").map(i => Number(i.trim()));

    if(idsArr.length !== pricesArr.length) {
        setError("Id array and value array must be same length");
        return;
    }

    setLoad(true);
    setError(undefined);
    setHash("");
    try {
        const hash = await writeMarket("setPriceNFTBatch", [idsArr, pricesArr]);
        console.log("Hash set price:", hash);
    } catch (e) {
        console.error(e);
        setError("Set price error");
    } finally {
        setData({ ids: "", prices: ""});
        setLoad(false);
    }
  }

  return (
    <div>
      <h2 className="h2-green">Set price a few NFT</h2>
      <SimpleInput
        placeholder={"ids (1, 4, 5)"}
        name={"ids"}
        value={load ? "Loading..." : data.ids}
        onChange={_hanldeChange}
        disabled={load}
      />
      <SimpleInput
        placeholder={"prices in wei (100, 40, 50)"}
        name={"prices"}
        value={load ? "Loading..." : data.prices}
        onChange={_hanldeChange}
        disabled={load}
      />
      <SimpleButton disabled={load} onClick={_handleClick}>
        {load ? "Loading..." : "set"}
      </SimpleButton>
      {hash && <p>Hash: {hash.substring(0,6) + "..." + hash.substring(60,65)}</p>}
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default SetPriceNFTBatch;
