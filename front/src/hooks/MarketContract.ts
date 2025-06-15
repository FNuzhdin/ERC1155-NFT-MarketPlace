/**
 * Custom hooks and utility functions for interacting with the Market smart-contract.
 * Uses wagmi and viem for contract interaction and state management.
 */

import { useReadContract, useWriteContract } from "wagmi";
import Artifact from "../../artifacts/Market.json";
import { MARKET_ADDR } from "@/utils/ProvenAddresses";
import { wagmiConfig } from "@/app/page";
import { writeContract, readContract } from "wagmi/actions";
import type { Address } from "viem";

/**
 * React hook to read data from the Market contract using wagmi's useReadContract.
 * 
 * @param functionName - The contract function to call.
 * @param args - Arguments for the contract function (optional).
 * @param account - Optional address to use as the caller.
 * @returns wagmi hook result object for the read operation.
 *
 * Usage example:
 *   const { data, isLoading, error } = useMarketRead("getOwner", []);
 */
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

/**
 * React hook to write data to the Market contract using wagmi's useWriteContract.
 * Returns a helper function for invoking contract writes, as well as wagmi's state.
 * 
 * Usage example:
 *   const { write, isPending } = useMarketWrite();
 *   write("setPrice", [tokenId, price]);
 */
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

/**
 * Async utility function to read data from the Market contract (outside React).
 * Uses wagmi's readContract with custom config.
 * 
 * Usage example:
 *   const result = await readMarket("getOwner", []);
 */
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

/**
 * Async utility function to write data to the Market contract (outside React).
 * Optionally sends ETH with the transaction.
 * 
 * Usage example:
 *   const tx = await writeMarket("buyToken", [tokenId], account, ethers.parseEther("0.1"));
 */
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
