import { useReadContract, useWriteContract } from "wagmi";
import Artifact from "../../artifacts/TokensERC1155.json";
import { TOKEN_ADDR } from "@/utils/ProvenAddresses";

export function useTokenRead(functionName: string, args: any[] = []) {
  return useReadContract({
    address: TOKEN_ADDR,
    abi: Artifact.abi,
    functionName,
    args,
  });
}

export function useTokenWrite() {
    const { writeContract, data, isPending, isSuccess, error } = useWriteContract();

    function write(functionName: string, args: any[] = []) {
        return writeContract({
            address: TOKEN_ADDR,
            abi: Artifact.abi,
            functionName, 
            args,
        });
    }

    return { write, data, isPending, isSuccess, error }
}