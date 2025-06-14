import React, { useEffect, useState } from "react";
import { readMarket } from "@/hooks/MarketContract";
import { useMarketRead } from "@/hooks/MarketContract";

import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/buttons/SimpleButton";

import SellerInQueue from "./SellerInQueue";
import ValueInQueue from "./ValueInQueue";

import { IoIosRefresh } from "react-icons/io";
import SimpleInput from "../SimpleInput";

const GetterComponent: React.FC = () => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [version, setVersion] = useState<bigint | undefined>(undefined);
  const [tail, setTail] = useState<bigint | undefined>(undefined);
  const [head, setHead] = useState<bigint | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);
  const [id, setId] = useState<string>("");

  const {
    data: currentVersion,
    error: versionError,
    isLoading: versionIsLoading,
  } = useMarketRead("getImplementetionVersion");

  useEffect(() => {
    if (!versionIsLoading && typeof currentVersion === "bigint") {
      setVersion(currentVersion);
    }
    if (versionError) {
      console.error("Version error:", versionError);
      setError("Version error!");
    }
  }, [versionIsLoading, currentVersion, versionError]);

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  }

  const _handleClick = async() => {
    const onlyNubmersId = /^\d+$/.test(id);

    if(!onlyNubmersId) {
      setError("Only numbers");
      return;
    }

    setLoad(true);
    setError(undefined);
    try {
      const resHead = await readMarket("getQueueHead", [id]);
      console.log("resHead:", resHead);
      if(typeof resHead === "bigint") {
        setHead(resHead);
      } else {
        throw new Error("Type of head error");
      }
    } catch (e) {
      console.error(e);
      setError("Get head error");
    } 

    try {
      const resTail = await readMarket("getQueueTail", [id]);
      console.log("resTail:", resTail);
      if(typeof resTail === "bigint") {
        setTail(resTail);
      } else {
        throw new Error("Type of tail error");
      }
    } catch (e) {
      console.error(e);
      setError("Get tail error");
    }

    setLoad(false);
    setId("");
  }

  return (
    <div>
      <div className="simple-row">
        <h2 className="h2-green">Vesion:</h2>
        <span>{versionIsLoading ? "Loading..." : version}</span>
      </div>

      <div className="simple-row">
        <h2 className="h2-green">QueueHead: {load ? "Loading..." : head}</h2>
        <h2 className="h2-green">QueueTail: {load ? "Loading..." : tail}</h2>
        <SimpleInput 
          placeholder={"id"}
          name={"id"}
          value={id}
          onChange={_handleChange}
          disabled={load}
        />
        <SimpleButton onClick={_handleClick} disabled={load}>
          get
        </SimpleButton>
      </div>

      <ValueInQueue />
      <SellerInQueue />

      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default GetterComponent;
