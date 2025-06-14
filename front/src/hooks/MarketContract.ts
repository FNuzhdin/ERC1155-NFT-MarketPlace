import { useReadContract, useWriteContract } from "wagmi";
import Artifact from "../../artifacts/Market.json"; /* тут нужен верный путь */
import { MARKET_ADDR } from "@/utils/ProvenAddresses";
import { wagmiConfig } from "@/app/page";
import { writeContract, readContract } from "wagmi/actions";
import type { Address } from "viem";

export function useMarketRead(functionName: string, args: any[] = [], account?: Address) {
  console.log("reading market contract...");
  return useReadContract({
    address: MARKET_ADDR,
    abi: Artifact.abi,
    functionName,
    args,
    account,
  });
}

export function useMarketWrite() {
  const { writeContract, data, isPending, isSuccess, error } =
    useWriteContract();
  console.log("writing market contarct...");
  function write(functionName: string, args: any[] = [], account?: Address) {
    return writeContract({
      address: MARKET_ADDR,
      abi: Artifact.abi,
      functionName,
      args,
      account,
    });
  }

  return { write, data, isPending, isSuccess, error };
}

export async function readMarket(
  functionName: string,
  args: any[] = [],
  account?: Address
) {
  console.log("reading market contract...");
  return await readContract(wagmiConfig, {
    abi: Artifact.abi,
    address: MARKET_ADDR,
    functionName,
    args,
    account,
  });
}

export async function writeMarket(functionName: string, args: any[] = [], account?: Address, ethValue?: bigint) {
  console.log("writing market contarct...");
  return await writeContract(wagmiConfig, {
    abi: Artifact.abi,
    address: MARKET_ADDR,
    functionName,
    args,
    account,
    ...(ethValue && {value: ethValue}),
  });
}
