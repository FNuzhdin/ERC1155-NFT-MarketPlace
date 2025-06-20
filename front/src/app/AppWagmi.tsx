"use client";

import React from "react";
import App from "@/components/App/App";

import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/config/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * AppWagmi component.
 *
 * - Sets up WAGMI provider for Ethereum wallet connection and React Query for data caching.
 * - Chains: Hardhat (with custom id: 1337) and Sepolia.
 * - Changes Hardhat chain id to 1337 for local development compatibility.
 * - Wraps the main components with WagmiProvider and QueryClientProvider.
 *
 * Usage:
 *   - All wallet and data-fetching context is provided to child components.
 */

const queryClient = new QueryClient();

const AppWagmi: React.FC = () => {
  return (
    <div>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
};

export default AppWagmi;
