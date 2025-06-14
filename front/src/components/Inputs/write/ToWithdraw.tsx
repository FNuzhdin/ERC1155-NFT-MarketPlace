import { useMarketRead, writeMarket } from "@/hooks/MarketContract";
import React, { useEffect, useState } from "react";

import SimpleButton from "@/components/buttons/SimpleButton";
import SimpleError from "@/components/Errors/SimpleError";

import { IoIosRefresh } from "react-icons/io";

type ToWithdrawProps = {
  address: `0x${string}` | undefined;
};

const ToWithdraw: React.FC<ToWithdrawProps> = ({ address }) => {
  const { data, isLoading, refetch } = useMarketRead("toWithdraw", [], address);
  const [currentWithdraw, setCurrentWithdraw] = useState<bigint | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    if (typeof data === "bigint") {
      console.log("toWithdraw result:", data);
      setCurrentWithdraw(data);
    } else {
      console.log("Data isn't bigint type yet");
    }
  }, [data, isLoading, refetch]);

  const _handleClick = async() => {
    if(currentWithdraw === BigInt(0)) {
        setError("Your withdraw balance is zero");
        console.error("Withdraw: 0");
        return;
    }

    setLoad(true);
    setHash("");
    setError(undefined);
    try {
        const result = await writeMarket("withdrawETH", [], address);
        if(typeof result === "string") {
            setHash(result);
        } else {
            throw new Error("Hash isn't in format");
        }
    } catch(e) {
        console.log("Withdraw error:", error);
        setError("Withdraw error");
    } finally {
        setLoad(false);
    }
    refetch();
  }

  return (
    <div>
      <h2 className="h2-green">Withdraw revenue</h2>
      <div>
        <p>
          You can withdraw: {isLoading ? "Loading..." : currentWithdraw} Wei
        </p>
        <SimpleButton disabled={isLoading} onClick={() => refetch()}>
          {isLoading ? "Loading..." : <IoIosRefresh />}
        </SimpleButton>
        <SimpleButton disabled={load} onClick={_handleClick}>
            withdraw
        </SimpleButton>
        {hash && <p>Hash: {hash.substring(0, 6) + "..." + hash.substring(60, 65)}</p>}
        <SimpleError error={error} setError={setError} />
      </div>
    </div>
  );
};

export default ToWithdraw;
