import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/buttons/SimpleButton";
import { readMarket, writeMarket } from "@/hooks/MarketContract";

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
    const onlyNubmersId = /^\d+$/.test(id);
    if (!onlyNubmersId) {
      setError("Only numbers in id!");
      return;
    }

    const onlyNubmersIndex = /^\d+$/.test(price);
    if (!onlyNubmersIndex) {
      setError("Only numbers in price!");
      return;
    }

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
