import { useReadContract, useWriteContract } from "wagmi";
import Artifact from "../../artifacts/TokensERC1155.json"
import { TOKEN_ADDR } from "@/utils/ProvenAddresses";
import type { Address } from "viem";
import { readContract, writeContract } from "wagmi/actions";
import { wagmiConfig } from "@/app/page";



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

export async function writeToken(functionName: string, args: any[] = []) {
  console.log("writing token contract...");
  return await writeContract(wagmiConfig, {
    abi: Artifact.abi,
    address: TOKEN_ADDR,
    functionName, 
    args,
    
  })
  
}

// export function useTokenWrite() {
//     const { writeContract, data, isPending, isSuccess, error } = useWriteContract();

//     function write(functionName: string, args: any[] = []) {
//         return writeContract({
//             address: TOKEN_ADDR,
//             abi: Artifact.abi,
//             functionName, 
//             args,
//         });
//     }

//     return { write, data, isPending, isSuccess, error }
// }