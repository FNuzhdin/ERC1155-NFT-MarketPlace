/* тут будут аналогиченые кастомные хуки для подключения write и read для контракта MArket*/
import { useReadContract, useWriteContract } from "wagmi";
import Artifact from "../../artifacts/Market.json"; /* тут нужен верный путь */
import { MARKET_ADDR } from "@/utils/ProvenAddresses";

export function useMarketRead(functionName: string, args: any[] = []) {
  return useReadContract({
    address: MARKET_ADDR,
    abi: Artifact.abi,
    functionName,
    args,
  });
}

export function useMarketWrite() {
    const { writeContract, data, isPending, isSuccess, error } = useWriteContract();

    function write(functionName: string, args: any[] = []) {
        return writeContract({
            address: MARKET_ADDR,
            abi: Artifact.abi,
            functionName, 
            args,
        });
    }

    return { write, data, isPending, isSuccess, error }
}