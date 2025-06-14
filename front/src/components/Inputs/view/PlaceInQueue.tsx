import SimpleButton from "@/components/buttons/SimpleButton";
import SimpleError from "@/components/Errors/SimpleError";
import { readMarket } from "@/hooks/MarketContract";
import React, { useState } from "react";
import SimpleInput from "../SimpleInput";

type PlaceInQueueProps = {
  address: `0x${string}` | undefined;
};

const PlaceInQueue: React.FC<PlaceInQueueProps> = ({ address }) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);
  const [result, setResult] = useState<bigint[]>([]);
  const [id, setId] = useState<string>("");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  }
  
  const _handleClick = async () => {
    const onlyNubmersId = /^\d+$/.test(id);
    if(!onlyNubmersId) {
      setError("Only numbers");
      return;
    }

    setError(undefined);
    setLoad(true);
    setResult([]);
    try {
      const places = await readMarket("getPlaceInQueue", [id], address);

      if (!Array.isArray(places)) {
        setError("Problem with places array!");
        throw new Error("Problem with places array!");
      }

      const queHead = await readMarket("getQueueHead", [id]);
      if (typeof queHead !== "bigint") {
        setError("Problem with queue head!");
        throw new Error("Problem with queue head!");
      }

      setResult(places.map((place) => place - queHead));
      console.log("Result:", result);
    } catch (e) {
      console.error("Place in queue error:", e);
      setError("Place in queue error");
    } finally {
      setLoad(false);
    }
  };
  
  return (
    <div>
      <h2 className="h2-green">Your places in queue</h2>
      <p>
        If you are selling FT, you can see
        <br></br>
        all your positions in queque
      </p>
      <SimpleInput 
        placeholder={"id"}
        name={"id"}
        value={id}
        onChange={_handleChange}
      />
      <SimpleButton disabled={load} onClick={_handleClick}>
        get
      </SimpleButton>
      <p>You places in queue: {result}</p>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default PlaceInQueue;
