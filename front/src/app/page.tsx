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

const queryClient = new QueryClient();

/**
 * Home component (entry point).
 *
 * - Sets up WAGMI provider for Ethereum wallet connection and React Query for data caching.
 * - Chains: Hardhat (with custom id: 1337) and Sepolia.
 * - Changes Hardhat chain id to 1337 for local development compatibility.
 * - Wraps the main App component with WagmiProvider and QueryClientProvider.
 *
 * Usage:
 *   - Place this as the main page (e.g., in `app/page.tsx`).
 *   - All wallet and data-fetching context is provided to child components.
 */

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
