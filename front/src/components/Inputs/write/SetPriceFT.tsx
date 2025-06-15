import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/Buttons/SimpleButton";
import { readMarket, writeMarket } from "@/hooks/MarketContract";
import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * SetPriceFT component
 *
 * A component for the contract owner to set the price of a fungible token (FT) that is already exhibited on the marketplace.
 * Only the owner can use this component to manage or update prices for FT tokens that users are selling or buying on the MarketPlace.
 *
 * Features:
 * - **Set FT Price:**  
 *   Allows the owner to input an FT token id and a new price for that token.
 *   Ensures the FT id exists in the current marketplace listing before allowing price changes.
 *   Validates that both id and price are numeric and that the price is greater than zero.
 *   Calls the `setPriceFT` method on the market contract.
 *
 * - **Validation:**  
 *   Checks that the id and price fields are filled with numeric values.
 *   Ensures the price is not zero.
 *   Checks that the entered id exists among the currently exhibited FTs on the marketplace.
 *
 * - **Error Handling & Feedback:**  
 *   Displays clear error messages for invalid input, missing ids, or contract errors.
 *   Disables inputs and buttons while loading.
 *
 * UI:
 * - Uses `SimpleInput` for the id and price fields.
 * - Uses `SimpleButton` for the "set" action.
 * - Uses `SimpleError` to display error messages.
 *
 * Usage:
 * ```tsx
 * <SetPriceFT />
 * ```
 *
 * Note:
 * - This component is intended for **owner use only** to set or update FT prices for tokens in the marketplace.
 * - The FT must already be exhibited on the market for the price to be set.
 * - The form is reset after each successful or failed attempt.
 */

const SetPriceFT: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [error, setError ] = useState<string | undefined>(undefined);

  const _handleChangeId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleChangePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  const _handleClick = async () => {
    if(!onlyNumbers({param: id, setError})) return;
    if(!onlyNumbers({param: price, setError})) return;

    if(BigInt(price) === BigInt(0)) {
        setError("Price must be more then 0!");
        return;
    }

    setError(undefined);
    setLoad(true);
    try {
        const idsFTExhibitedArr = await readMarket("getAllIdsFTExhibited");
        console.log("IdsFTArr:", idsFTExhibitedArr);
        console.log("Id", id);
        if(Array.isArray(idsFTExhibitedArr) && idsFTExhibitedArr.length > 0) {
            const found = idsFTExhibitedArr.find(idFT => idFT === BigInt(id));
            console.log("id found", found)
            if(found === undefined) {
                throw new Error("This id isn't exists in market!");
            }
        } else {
            throw new Error("IdsFTArray is empty or idsFTArr type error!")
        }

        const result  = await writeMarket("setPriceFT", [id, price]);
        console.log("Set price result:", result);
    } catch (e) {
        console.error(e);
        setError("Set price error!");
    } finally {
        setId("");
        setPrice("");
        setLoad(false);
    }
    console.log("Set price finished");
  };

  return (
    <div>
      <h2 className="h2-green">Set price FT</h2>
      <SimpleInput
        placeholder={"id"}
        name={"id"}
        value={id}
        onChange={_handleChangeId}
        disabled={load}
      />
      <SimpleInput
        placeholder={"price"}
        name={"price"}
        value={price}
        onChange={_handleChangePrice}
        disabled={load}
      />
      <SimpleButton disabled={load} onClick={_handleClick}>
        set
      </SimpleButton>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default SetPriceFT;
