import { createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains"; 

const newHardhat = { ...hardhat, id: 1337};

export const wagmiConfig = createConfig({
  chains: [newHardhat, sepolia],
  transports: {
    [newHardhat.id]: http(),
    [sepolia.id]: http(),
  },
});