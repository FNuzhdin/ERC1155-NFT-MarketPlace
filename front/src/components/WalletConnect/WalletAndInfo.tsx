"use client";

import { useDisconnect, useConnect, injected, useBalance } from "wagmi";
import { ethers } from "ethers";
import { useTokenRead } from "@/hooks/TokenContract";
import type { Chain } from "wagmi/chains";

import type { IsAdmin } from "../../app/App";
import { useMarketRead } from "@/hooks/MarketContract";
import { useEffect, useState } from "react";

type WalletAndInfoProps = {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  setAdmin: React.Dispatch<React.SetStateAction<IsAdmin>>;
  admin: IsAdmin;
  show: boolean;
};

/**
 * WalletAndInfo component
 *
 * Provides wallet connection, account status, and admin info for the user.  
 * Handles wallet connection/disconnection, displays the connected address, ETH balance,
 * and checks if the user is the admin of the Token or Market contracts.
 *
 * Props:
 * - `address`: The user's Ethereum address (or undefined if not connected).
 * - `isConnected`: Boolean flag indicating if the wallet is connected.
 * - `setAdmin`: State setter for updating admin status (adminToken/adminMarket).
 * - `admin`: Current admin status ({ adminToken: boolean, adminMarket: boolean }).
 * - `show`: Should the component be visible after connection.
 *
 * Features:
 * - Lets user connect or disconnect their wallet using wagmi.
 * - Displays ETH balance (with loading and error states).
 * - Shows short address format.
 * - Checks if the connected address is the owner (admin) of the Token and/or Market contracts.
 * - Shows current admin rights (for market/token).
 * - Handles and displays errors from wallet, balance, and contract owner checks.
 * - Provides a button to clear error messages.
 *
 * Usage:
 * ```tsx
 * <WalletAndInfo
 *   address={address}
 *   isConnected={isConnected}
 *   chain={chain}
 *   setAdmin={setAdmin}
 *   admin={admin}
 *   show={show}
 * />
 * ```
 *
 * Notes:
 * - Uses wagmi for wallet, connection, and balance management.
 * - Uses custom hooks to read contract owner from Token and Market contracts.
 * - Error handling is centralized and user-friendly.
 * - UI adapts based on connection and loading state.
 */

const WalletAndInfo: React.FC<WalletAndInfoProps> = ({
  address,
  isConnected,
  setAdmin,
  admin,
  show,
}) => {
  // Standart data about current connection
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

  if (!show) {
    return;
  }
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
