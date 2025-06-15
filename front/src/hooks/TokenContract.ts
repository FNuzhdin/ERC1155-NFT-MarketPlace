// Custom hooks and utility functions for interacting with the TokenERC1155 smart-contract.
// Uses wagmi and viem for contract interaction and state management.

import { useReadContract, useWriteContract } from "wagmi";
import Artifact from "../../artifacts/TokensERC1155.json"
import { TOKEN_ADDR } from "@/utils/ProvenAddresses";
import type { Address } from "viem";
import { readContract, writeContract } from "wagmi/actions";
import { wagmiConfig } from "@/app/page";

/**
 * React hook to read data from the TokenERC1155 contract using wagmi's useReadContract.
 * 
 * @param functionName - The contract function to call.
 * @param args - Arguments for the contract function (optional).
 * @param account - Optional address to use as the caller.
 * @returns wagmi hook result object for the read operation.
 *
 * Usage example:
 *   const { data, isLoading, error } = useTokenRead("balanceOf", [address, tokenId]);
 */
export function useTokenRead(functionName: string, args: any[] = [], account?: Address ) {
  console.log("reading token contract...");
  return useReadContract({
    address: TOKEN_ADDR,
    abi: Artifact.abi,
    functionName,
    args,
    account,
  });
}

/**
 * Async utility function to read data from the TokenERC1155 contract (outside React).
 * Uses wagmi's readContract with custom config.
 * 
 * Usage example:
 *   const result = await readToken("balanceOf", [address, tokenId]);
 */
export async function readToken(functionName: string, args: any[] = [], account?: Address) {
  console.log("reading token contract...");
  return await readContract(wagmiConfig, {
    abi: Artifact.abi,
    address: TOKEN_ADDR,  
    functionName,
    args,
    account,
  })
}

/**
 * Async utility function to write data to the TokenERC1155 contract (outside React).
 * 
 * Usage example:
 *   const tx = await writeToken("mint", [to, tokenId, amount]);
 */
export async function writeToken(functionName: string, args: any[] = []) {
  console.log("writing token contract...");
  return await writeContract(wagmiConfig, {
    abi: Artifact.abi,
    address: TOKEN_ADDR,
    functionName, 
    args,
    
  })
  
}