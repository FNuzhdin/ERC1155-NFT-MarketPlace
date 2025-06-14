import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/buttons/SimpleButton";
import { readMarket } from "@/hooks/MarketContract";

const ValueInQueue: React.FC = () => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [id, setId] = useState<string>("");
  const [index, setIndex] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [result, setResult] = useState<bigint | undefined>(undefined);

  const _handleChangeId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleChangeIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIndex(e.target.value);
  };

  const _handleClick = async () => {
    const onlyNubmersId = /^\d+$/.test(id);
    if (!onlyNubmersId) {
      setError("Only numbers in id!");
      return;
    }

    const onlyNubmersIndex = /^\d+$/.test(index);
    if (!onlyNubmersIndex) {
      setError("Only numbers in queue index!");
      return;
    }

    setLoad(true);
    setResult(undefined);
    setError(undefined);
    try {
      const result = await readMarket("getValueInQueue", [id, index]);
      console.log("Get value result:", result);
      if (typeof result === "bigint") {
        setResult(result);
      }
    } catch (e) {
      console.error(e);
      setError("Value in queue error!");
    } finally {
      setLoad(false);
      setId("");
      setIndex("");
    }
  };

  return (
    <div>
      <h2 className="h2-green">Value in queue</h2>
      <SimpleInput
        placeholder={"id"}
        name={"id"}
        value={id}
        onChange={_handleChangeId}
        disabled={load}
      />
      <SimpleInput
        placeholder={"queue index"}
        name={"index"}
        value={index}
        onChange={_handleChangeIndex}
        disabled={load}
      />
      {result  && <p>Result: {result}</p>}
      <SimpleButton onClick={_handleClick} disabled={load}>
        get
      </SimpleButton>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default ValueInQueue;
