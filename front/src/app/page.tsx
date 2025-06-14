"use client"

import { WagmiProvider, http, createConfig } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "@/app/App";

const newHardhat = { ...hardhat, id: 1337}; 

export const wagmiConfig = createConfig({
  chains: [newHardhat, sepolia],
  transports: {
    [newHardhat.id]: http(),
    [sepolia.id]: http(),
  },
});

// создаем QueryClient для работы с @tanstack/react-query (обязательно для WagmiProvider)
const queryClient = new QueryClient();

/* прописать потом в README, что мы используем wagmi, 
также используем кастомные хуки, также испльзуем самописную 
утилиту для загрузки изображений в ipfs */

export default function Home() {
  

  return (
    <div>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <App /> 
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}
