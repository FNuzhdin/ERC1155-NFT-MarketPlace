"use client";

import {
  useAccount,
  useWalletClient,
  useDisconnect,
  useConnect,
  injected,
  useBalance,
} from "wagmi";
import { ethers } from "ethers";
import { useTokenRead } from "@/hooks/TokenContract";
import type { Chain } from "wagmi/chains";

/* получить ошибки от всех хуков, добавить ошибки в новый компонент для ошибок */

import type { IsAdmin } from "../../app/App";
import { useMarketRead } from "@/hooks/MarketContract";
import { useEffect, useState } from "react";

type WalletAndInfoProps = {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  chain: Chain | undefined;
  setAdmin: React.Dispatch<React.SetStateAction<IsAdmin>>;
  admin: IsAdmin;
  show: boolean; 
};

const WalletAndInfo: React.FC<WalletAndInfoProps> = ({
  address,
  isConnected,
  chain,
  setAdmin,
  admin,
  show
}) => {
  // Стандартные данные о подключенном аккаунте
  const { data, isLoading, error: balanceError } = useBalance({ address });
  const { disconnect, isPending: isPendingDisconnect } = useDisconnect();
  const {
    connect,
    isPending: isPendingConnect,
    error: connectionError,
  } = useConnect();

  const { data: tokenOwner, error: tokenOwnerError } = useTokenRead("owner");
  const { data: marketOwner, error: marketOwnerError } = useMarketRead("owner");

  const [someError, setSomeError] = useState<string>("");
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHydrated(true);
    console.log("Hydrate is succes");
  }, []);

  useEffect(() => {
    if (typeof tokenOwner === "string" && tokenOwner.length === 42 && address) {
      setAdmin((prev) => ({
        ...prev,
        adminToken: tokenOwner === address,
      }));
    }
  }, [address, tokenOwner, setAdmin]);
  /* добавили функцию setAdmin в зависимотьс, тк она
  получена из пропсов. в таких случаев нужно добавлять функцию в зависимость useEffect*/
  useEffect(() => {
    if (
      typeof marketOwner === "string" &&
      marketOwner.length === 42 &&
      address
    ) {
      setAdmin((prev) => ({
        ...prev,
        adminMarket: marketOwner === address,
      }));
    }
  }, [address, marketOwner, setAdmin]);

  useEffect(() => {
    if (tokenOwnerError || marketOwnerError) {
      setSomeError(
        tokenOwnerError?.message ||
          marketOwnerError?.message ||
          "Read owner problem!"
      );
    }
  }, [tokenOwnerError, marketOwnerError]);

  if (!hydrated) {
    return <div className="centered-container">Loading...</div>;
  }

  console.log("Component 'WalletAndInfo' booted");

  if (!isConnected)
    return (
      <div className="centered-container">
        <button
          className="animated-gradient-btn"
          onClick={() => connect({ connector: injected() })}
          disabled={isPendingConnect}
        >
          {!isPendingConnect ? (
            <span>Connect</span>
          ) : (
            <span>Connecting...</span>
          )}
        </button>
        {connectionError && (
          <p className="error-message">{connectionError.message}</p>
        )}
      </div>
    );

    if(!show) {return;}
    return (
      <div className="top-right-container">
        
        <h2 className="centered-title">Your info</h2>
        <h3 className="address-row">
          <strong>Address: </strong>
          <span>
            {address?.substring(0, 4) + "..." + address?.substring(38, 42)}
          </span>
        </h3>
        <div className="eth-row">
          <strong>ETH: </strong>{" "}
          <span>
            {isLoading ? (
              <span>loading...</span>
            ) : (
              <span>{ethers.formatEther(String(data?.value))}</span>
            )}
            {balanceError && (
              <span className="error-message">{balanceError.message}</span>
            )}
          </span>
        </div>
        <div className="disconnect-row">
          <button
            className="small-black-button"
            onClick={() => disconnect()}
            disabled={isPendingDisconnect}
          >
            {isPendingDisconnect ? (
              <span>Disconnecting...</span>
            ) : (
              <span>Disconnect</span>
            )}
          </button>
        </div>
        {admin.adminMarket && (
          <p className="green-paragraph">Your are admin of market</p>
        )}
        {admin.adminToken && (
          <p className="green-paragraph">You are admin of token</p>
        )}
        <p className="error-message">{someError}</p>
        {someError && (
          <button
            className="small-black-button2"
            onClick={() => setSomeError("")}
          >
            clean
          </button>
        )}
      </div>
    );
};

export default WalletAndInfo;
