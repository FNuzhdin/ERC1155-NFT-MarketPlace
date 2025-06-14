"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import WalletAndInfo from "@/components/WalletConnect/WalletAndInfo";
import MarketPlace from "@/components/Market/MarketPlace";

import SimpleButton from "../components/buttons/SimpleButton";
import TokenAdminInterface from "../components/Token/TokenAdminIntrface";
import MarketAdminInterface from "../components/Market/MarketAdminInterface";
import TokenUserInterface from "../components/Token/TokenUserInterface";
import MarketUserInterface from "../components/Market/MarketUserInterface";

import orange_192 from "../images/orange_192.png";

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

  const [show, setShow] = useState<{
    tokenFunc: boolean;
    marketFunc: boolean;
    marketPlace: boolean;
  }>({ tokenFunc: false, marketFunc: false, marketPlace: true });

  const [showInfo, setShowInfo] = useState<boolean>(false);

  const [hydrated, setHydrated] = useState<boolean>(true);

  useEffect(() => {
    setHydrated(false);
  }, []);

  if (hydrated) return;

  const _hanldeClickOnlyTokenFunc = () => {
    setShow({
      tokenFunc: true,
      marketFunc: false,
      marketPlace: false,
    });
  };

  const _handleClickOnlyMarketFunc = () => {
    setShow({
      tokenFunc: false,
      marketFunc: true,
      marketPlace: false,
    });
  };

  const _handleClickOnlyMarketPlace = () => {
    setShow({
      tokenFunc: false,
      marketFunc: false,
      marketPlace: true,
    });
  };

  const _handleClickShowInfo = () => {
    setShowInfo(!showInfo);
  };

  if (!chain && isConnected) {
    console.warn("This market place works on hardhat or sepolia chain");
    return (
      <div className="centered-container">
        <h1>Please switch chain to hardhat or sepolia</h1>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        {!isConnected && (
          <img className="logo" src={orange_192.src} alt="orange_192" />
        )}
        {isConnected && (
          <div className="simple-row">
            <img className="logo" src={orange_192.src} alt="orange_192" />
            <SimpleButton
              onClick={_hanldeClickOnlyTokenFunc}
              className={"small-button-header "}
            >
              Token functions
            </SimpleButton>
            <SimpleButton
              onClick={_handleClickOnlyMarketFunc}
              className={"small-button-header "}
            >
              Market functions
            </SimpleButton>
            <SimpleButton
              onClick={_handleClickOnlyMarketPlace}
              className={"small-button-header "}
            >
              Market place
            </SimpleButton>
            <SimpleButton
              onClick={_handleClickShowInfo}
              className={"small-button-header "}
            >
              Your info
            </SimpleButton>
          </div>
        )}
      </header>

      <WalletAndInfo
        address={address}
        isConnected={isConnected}
        chain={chain}
        setAdmin={setAdmin}
        admin={admin}
        show={showInfo}
      />

      {isConnected && admin.adminToken && chain && show.tokenFunc && (
        <TokenAdminInterface address={address} />
      )}

      {isConnected && admin.adminMarket && chain && show.marketFunc && (
        <MarketAdminInterface address={address} />
      )}

      {isConnected && !admin.adminToken && chain && show.tokenFunc && (
        <TokenUserInterface address={address} />
      )}

      {isConnected && !admin.adminMarket && chain && show.marketFunc && (
        <MarketUserInterface address={address} />
      )}

      {isConnected && chain && show.marketPlace && (
        <MarketPlace address={address} />
      )}

      <footer className="footer"> © 2025 FNuzhdin </footer>
    </div>
  );
};

export default App;
