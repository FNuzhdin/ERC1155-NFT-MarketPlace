import { useMarketRead, writeMarket } from "@/hooks/MarketContract";
import React, { useEffect, useState } from "react";

import SimpleButton from "@/components/Buttons/SimpleButton";
import SimpleError from "@/components/Errors/SimpleError";

import { IoIosRefresh } from "react-icons/io";

type ToWithdrawProps = {
  address: `0x${string}` | undefined;
};

/**
 * ToWithdraw component
 *
 * Lets any user view and withdraw their available earnings (ETH) accumulated from selling FT and NFT on the marketplace.
 *
 * Key points:
 * - Shows the amount available for withdrawal (in Wei) for the connected user.
 * - Lets the user trigger a withdrawal of their current available balance.
 * - Funds accumulate from sales of FT and NFT by the user.
 * - Calls the `toWithdraw` method to fetch the balance and `withdrawETH` to withdraw.
 * - Displays loading state, transaction hash upon completion, and error messages as needed.
 *
 * UI:
 * - Shows current withdrawable amount.
 * - `SimpleButton` to refresh the balance.
 * - `SimpleButton` to initiate withdrawal.
 * - `SimpleError` for error messages.
 *
 * Usage:
 * ```tsx
 * <ToWithdraw address={address} />
 * ```
 *
 * Notes:
 * - Any user can use this component to check and withdraw their own accumulated marketplace revenue.
 * - After withdrawal, balance is refreshed and the hash is shown partially.
 */

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

  const _handleClick = async () => {
    if (currentWithdraw === BigInt(0)) {
      setError("Your withdraw balance is zero");
      console.error("Withdraw: 0");
      return;
    }

    setLoad(true);
    setHash("");
    setError(undefined);
    try {
      const result = await writeMarket("withdrawETH", [], address);
      if (typeof result === "string") {
        setHash(result);
      } else {
        throw new Error("Hash isn't in format");
      }
    } catch (e) {
      console.log("Withdraw error:", error);
      setError("Withdraw error");
    } finally {
      setLoad(false);
    }
    refetch();
  };

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
        {hash && (
          <p>Hash: {hash.substring(0, 6) + "..." + hash.substring(60, 65)}</p>
        )}
        <SimpleError error={error} setError={setError} />
      </div>
    </div>
  );
};

export default ToWithdraw;
