"use client";

import React, { useState } from "react";

import WalletAndInfo from "@/components/WalletAndInfo";
import MarketPlace from "@/components/MarketPlace";
import AdminInterface from "@/components/AdminInterface";
import { useAccount } from "wagmi";

export type IsAdmin = {
  adminToken: boolean;
  adminMarket: boolean;
};

const App: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const [admin, setAdmin] = useState<IsAdmin>({
    adminToken: false,
    adminMarket: false,
  });

  console.log("Component App");
  return (
    <div>
      <WalletAndInfo
        address={address}
        isConnected={isConnected}
        chain={chain}
        setAdmin={setAdmin}
        admin={admin}
      />
      {!(admin.adminMarket || admin.adminToken) && <MarketPlace />}
      {(admin.adminMarket || admin.adminToken) && (
        <AdminInterface admin={admin} />
      )}
    </div>
  );
};

export default App;
